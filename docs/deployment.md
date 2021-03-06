# Deployment

This document covers deploying the app/api as well as the data provider. A reminder that the flow of data is for a data provider to push integrated spectra from some probably radio-interfaced computer as a socket-io client to a VM hosted node server. That node server manages a socket-io server.

The VM also hosts the website, so serves a React app, each of which is a socket-io client to the users browser.

When the node-managed socket-io server receives an integration from the data provider (socket-io client), it processes it to be more digestible by the React app then pushes it to each instance of the React app (all in-browser socket-io clients).

## Table of Contents

- [Deployment](#deployment)
  - [Table of Contents](#table-of-contents)
  - [Deploying VM](#deploying-vm)
    - [Choose OS](#choose-os)
    - [First steps](#first-steps)
    - [Deploying React app](#deploying-react-app)
      - [Install dependencies](#install-dependencies)
      - [Build project](#build-project)
      - [Install web server to host React app](#install-web-server-to-host-react-app)
      - [Setup an ssl cert (https)](#setup-an-ssl-cert-https)
    - [Deploy node js server](#deploy-node-js-server)
      - [Setup system service to run the node server](#setup-system-service-to-run-the-node-server)
    - [Finishing steps](#finishing-steps)
      - [Allow api ports in firewall](#allow-api-ports-in-firewall)
  - [Deploy data provider](#deploy-data-provider)
    - [Ettus USRP](#ettus-usrp)
      - [Docker](#docker)
      - [Native](#native)

## Deploying VM

### Choose OS

I'm using Ubuntu 20.04. General tips if using Compute Canada Cloud:

1. Don't use your maximum available storage when spinning up an instance, it will mean you can't snapshot or back it up later.

### First steps

1. Open ssh, http, https ports
2. Assign floating IP
3. ssh in and update os

### Deploying React app

#### Install dependencies

Install yarn

```bash
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn
```

Check current nvm version but something like the following line should install it

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Install correct node version with
```bash
nvm install 14.18.0
nvm use 14.18.0
```

#### Build project

To use Github you'll probably need to add the VMs publish ssh key to your github account. Then clone repo and from inside its directory install the necessary packages and generate an environment file

```bash
yarn
yarn make:envfile
```

Edit the generated .env file with relevant values. Now build a deployable bundle.

```bash
yarn build:web
```

#### Install web server to host React app

This is heavily based off of a [Digital Ocean tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04).

Install nginx

```bash
sudo apt install nginx
```

Use the following command to list available services to allow through the "uncomplicated firewall"

```bash
sudo ufw app list
```

Allow ssh and nginx

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw status
sudo ufw enable
```

Check if nginx is running and probably restart it because you're paranoid

```bash
systemctl status nginx
sudo systemctl restart nginx
```

Put the react app files where they need to be

```bash
sudo mkdir -p /var/www/<SERVER-PUBLIC-IP>/html
sudo chown -R $USER:$USER /var/www/<SERVER-PUBLIC-IP>/html
sudo chmod -R 755 /var/www/<SERVER-PUBLIC-IP>
cp -r ~/rfind-web/dist/apps/web/* /var/www/<SERVER-PUBLIC-IP>/html/
```

Edit or create the following file

```bash
sudo vi /etc/nginx/sites-available/<SERVER-PUBLIC-IP>
```

And add the following configuration block

```bash
server {
        listen 80;
        listen [::]:80;

        root /var/www/<SERVER-PUBLIC-IP>/html;
        index index.html index.htm index.nginx-debian.html;

        server_name <SERVER-PUBLIC-IP> www.<SERVER-PUBLIC-IP>;

        location / {
                try_files $uri $uri/ =404;
        }
}
```

Link it to where ngix will grab it on startup

```bash
sudo ln -s /etc/nginx/sites-available/<SERVER-PUBLIC-IP> /etc/nginx/sites-enabled/
```

Using whatever method you want, inside the file `/etc/nginx/nginx.conf` uncomment the line

```bash
server_names_hash_bucket_size 64;
```

Check that there are no ngix errors and restart the service with

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Setup an ssl cert (https)

This is also heavily based off of a [Digital Ocean tutorial](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04).

Install certbot and the nginx plugin

```bash
sudo apt install certbot python3-certbot-nginx
```

Validate the nginx configuration and restart it again

```bash
sudo nginx -t
sudo systemctl restart nginx
```

Spin up certbot (it will prompt you for email etc)

```bash
sudo certbot --nginx -d <SERVER-PUBLIC-IP> -d www.<SERVER-PUBLIC-IP>
```

Check that certbots auto-renewal timer is working and try a dryrun

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

The certificate files are stored in `/etc/letsencrypt/live/<SERVER-PUBLIC-IP>` so fill in the appropriate lines in your `.env` file

```bash
NX_SSL_CERT=/etc/letsencrypt/live/<SERVER-PUBLIC-IP>/fullchain.pem
NX_SSL_KEY=/etc/letsencrypt/live/<SERVER-PUBLIC-IP>/privkey.pem
NX_SSL_CA=/etc/letsencrypt/live/<SERVER-PUBLIC-IP>/chain.pem
```

Because the certificate was generated using sudo, we need to create a limited unix group which gives the regular user (who will be running the node server) access.

```bash
sudo addgroup sslcert
sudo adduser <USERNAME-ON-SERVER> sslcert
sudo adduser root sslcert
sudo chgrp -R sslcert /etc/letsencrypt/live
sudo chgrp -R sslcert /etc/letsencrypt/archive
sudo chmod -R 750 /etc/letsencrypt/live
sudo chmod -R 750 /etc/letsencrypt/archive
```

Reboot.

```bash
sudo reboot
```

### Deploy node js server

#### Setup system service to run the node server

This too is heavily based off of a [Digital Ocean tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04).

Install PM2 (process manager for node applications), , and tell it to launch managed processes on system startup

```bash
npm install pm2 -g
```

Build your node application and tell PM2 to start and parent it (ensure you run the `pm2 start` command from the folder containing your `.env`)

```bash
cd ~/rfind-web
yarn build:api
pm2 start pm2.config.js
pm2 startup systemd
```

The last command will output a command that you need to copy and run.

After running that command, save the PM2 process list and start it

```bash
pm2 save
sudo systemctl start pm2-<USERNAME-ON-SERVER>
```

Reboot.

```bash
sudo reboot
```

Check the service status

```bash
systemctl status pm2-<USERNAME-ON-SERVER>
```

### Finishing steps

#### Allow api ports in firewall

Figure out your socketio port (it defaults in the .env to 4001) and then enable it.

```bash
sudo ufw allow <YOUR SOCKETIO PORT>
```

## Deploy data provider

### Ettus USRP

So far I have set this up to stream data from the USRP using the UHD Python API into socket-io messages which are then emitted to the node-managed socket-io server.

#### Docker

I've written a handy [Docker](../DataProviders/USRP/Dockerfile) container which deploys everything. It essentially installs the build requirements, grabs the socket-io client script and starts running it.

#### Native

If you don't want to use Docker you'll have to figure out a way to keep the [data provider script](../DataProviders/USRP/socketio-data-delivery-usrp.py) running. There are several methods but it's probably easiest to [lean on systemd](https://code.luasoftware.com/tutorials/linux/auto-start-python-script-on-boot-systemd/).
