# RFInd Web

A web interface to monitor the output of an integrating spectrometer. This application pairs with one of several data providers available in the [rfind-web-providers](https://github.com/nsbruce/rfind-web-providers) python module.

## Getting started

For local development you need a [SciChart license](https://www.scichart.com/).

Run `yarn` to install necessary node_modules.

Run `yarn make:envfile` to build the necessary .env files.

Run `yarn start:web` in one console to start the React front end and `yarn start:api` in another to start the nodejs back end.

## Deploying

For a walkthrough on deploying to an Ubuntu server see [the docs on deployment](./docs/deployment.md).

## Redeploying

If you make changes after the app is first deployed you can simply rebuild with `yarn build:all --prod` and then redeploy with `yarn redeploy:all`.

There are also variants:
 - `yarn build:api`/`yarn build:web`
 - `yarn deploy:api`/`yarn deploy:web`

Sometimes the cache is sticky which `yarn nx reset` fixes.