import * as express from "express";
import * as http from "http";
import { Server } from "socket.io";
import {Subscriber} from 'zeromq'
import {Message} from '@rfind-web/api-interfaces'
import env from '@rfind-web/environment'

const sioPort = env.SOCKETIO_PORT;
const sioAddr = env.SOCKETIO_PROTOCOL+'://'+env.SOCKETIO_IP+':'+sioPort
const zmqAddr = env.ZMQ_PROTOCOL+'://'+env.ZMQ_IP+':'+env.ZMQ_PORT

const app = express();

const httpServer = http.createServer(app);


const zmqSub = new Subscriber()
zmqSub.subscribe()

const io = new Server(httpServer, {cors: {origin: sioAddr, methods: ['GET', 'POST']}}); //TODO this origin is not good

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

httpServer.listen(sioPort, () => console.log(`Listening on port ${sioPort}`));