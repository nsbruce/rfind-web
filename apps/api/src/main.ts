import * as express from "express";
import * as http from "http";
import { Socket, Server } from "socket.io";
import {Subscriber} from 'zeromq'
import {EventEmitter} from 'events'
import {Message} from '@rfind-web/api-interfaces'


const sioPort = process.env.PORT || 4001;
const zmqPort = 5557;

const app = express();

const server = http.createServer(app);

const zmqDataEmitter = new EventEmitter()


const zmqSock = new Subscriber()
zmqSock.subscribe()

async function initZmq() {
  try {
    await zmqSock.bind("tcp://127.0.0.1:"+zmqPort)
    for await (const [topic, msg] of zmqSock) {
      const spectra = new Float32Array(msg.buffer)
      const timestamp = parseFloat(topic.toString())*1000 //python is ms JS is s

      zmqDataEmitter.emit('integration', {timestamp: timestamp, bins: [...spectra]} as Message)

    }
  } catch (err) {
    console.log("Error starting ZMQ sub: ", err)
  }
}

initZmq()

const sioServer = new Server(server, {cors: {origin: '*', methods: ['GET', 'POST']}}); //TODO this origin is not good

sioServer.on("connection", async (sioClient: Socket) => {
  console.log("New client connected");

  zmqDataEmitter.on('integration', (integration: Response)=> {
    if (sioClient.connected) {
      // console.log("message is:", integration.timestamp, " spectra length:", integration.bins.length)
      getApiAndEmit(sioClient, integration)
    }
})

  sioClient.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const getApiAndEmit = (sioSocket: Socket, integration: Response) => {

  // Emitting a new message. Will be consumed by the client
  sioSocket.emit("FromAPI", integration);
};

server.listen(sioPort, () => console.log(`Listening on port ${sioPort}`));
