import * as express from "express";
import * as http from "http";
import * as https from 'https';
import { Server } from "socket.io";
import {Subscriber} from 'zeromq'
import {Message} from '@rfind-web/api-interfaces'
import 'dotenv/config'
import env from '@rfind-web/environment'
import * as fs from 'fs'

console.table(env)

const sioPort = env.SOCKETIO_PORT;
// const sioAddr = env.SOCKETIO_PROTOCOL+'://'+env.SOCKETIO_API_IP+':'+sioPort
const sioClientAddr = env.SOCKETIO_PROTOCOL+'://'+env.SOCKETIO_APP_IP+':'+sioPort
const zmqAddr = env.ZMQ_PROTOCOL+'://'+env.ZMQ_IP+':'+env.ZMQ_PORT

const app = express();
let webServer: https.Server | http.Server;
if (env.SOCKETIO_PROTOCOL === 'https') {
  console.log('Setting up https server')
  const credentials:https.ServerOptions = {
    cert: fs.readFileSync(env.SSL_CERT),
    key: fs.readFileSync(env.SSL_KEY)
  }
  webServer = https.createServer(credentials, app)
} else {
  console.log('Setting up http server')
  webServer = http.createServer(app);
}


const zmqSub = new Subscriber()
zmqSub.subscribe()

const io = new Server(webServer, {cors: {origin: '*', methods: 'GET'}});

async function initZmq() {
  try {
    await zmqSub.bind(zmqAddr)
    for await (const [topic, msg] of zmqSub) {
      const spectra = new Float32Array(msg.buffer)
      const timestamp = parseFloat(topic.toString())*1000 //python is ms JS is s
      
      io.emit('integration', {timestamp:timestamp, bins: [...spectra]} as Message)
      
    }
  } catch (err) {
    console.log("Error starting ZMQ sub: ", err)
  }
}

initZmq()

webServer.listen(sioPort, () => console.log(`Listening on port ${sioPort}`));