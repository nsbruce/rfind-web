import * as http from "http";
import * as https from 'https';
import { Server, Socket, ServerOptions } from "socket.io";
import {Integration} from '@rfind-web/api-interfaces'
import env from '@rfind-web/environment'
import * as fs from 'fs'


const sioPort = env.SOCKETIO_PORT;

let webServer: https.Server | http.Server;
if (env.SOCKETIO_PROTOCOL === 'https') {
  console.log('Setting up https server')
  const credentials:https.ServerOptions = {
    cert: fs.readFileSync(env.SSL_CERT),
    key: fs.readFileSync(env.SSL_KEY)
  }
  webServer = https.createServer(credentials)
} else if (env.SOCKETIO_PROTOCOL === 'http') {
  console.log('Setting up http server')
  webServer = http.createServer();
} else {
  console.error('Unsupported socketio protocol.')
}

const socketioServerOpts:Partial<ServerOptions> = {
  cors: {origin: '*', methods: 'GET'},
  maxHttpBufferSize: 2e6, // 2MB
}

const io = new Server(webServer, socketioServerOpts);

//On new backend connection
io.of(env.SOCKETIO_BACKEND_NAMESPACE).on('connection', (socket:Socket)=>{
  console.log('New backend socket connection', socket.conn.remoteAddress)
  socket.on('integration', (data)=>{
    const processed: Integration = {
      time: new Date(data.timestamp),
      bins: [...new Int16Array(data.bins.buffer)]
    }
    io.of(env.SOCKETIO_FRONTEND_NAMESPACE).emit('client', processed)
  })
  socket.on('disconnect',()=>{console.log('A backend socket disconnected')})
})

//On new frontend connection
io.of(env.SOCKETIO_FRONTEND_NAMESPACE).on('connection', (socket:Socket)=>{
  console.log('New frontend socket connection', socket.conn.remoteAddress)
  socket.on('disconnect',()=>{console.log('A frontend socket disconnected')})
})

webServer.listen(sioPort, () => console.log(`Listening on port ${sioPort}`));