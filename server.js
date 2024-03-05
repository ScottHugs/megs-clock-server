const express = require('express')
const http = require('http')
const cors = require('cors') 
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ['GET', 'POST']

  }
})

const port = 3365

app.use(cors());

let roomDetails = {}


io.on('connection', (socket) => {
  console.log(`user connected: ${socket.id}`)

  socket.on('setup_options', (setupOptions) => {
    socket.join(setupOptions.key)
    console.log(`joined ${setupOptions.key}`)
    roomDetails[setupOptions.key] = {
      name: setupOptions.name,
      time: setupOptions.time,
      users: [socket.id]
    }
    console.log(roomDetails)
    console.log(setupOptions.key)
    console.log(setupOptions.time)
    io.to(setupOptions.key).emit('recieve_time', setupOptions.time*1000)
  })
  

  // socket.on('join_room', (roomKey) => {
  //   socket.join(roomKey)
  //   console.log(`joined ${roomKey}`)
  // })

  socket.on('start_timer', (roomKey) => {
    console.log('starting timer')
    startTimer(roomDetails[roomKey].time*1000, roomKey) // timesing by 1000 for to get seconds for dev 
  })
  
})

server.listen(port,() => {
  console.log(`listening on port ${port}`)
})  


function startTimer(milliseconds, roomKey){
  let time = milliseconds
    const timer = setInterval(() => {
      time = time - 1000
      console.log(time)
      io.to(roomKey).emit('recieve_time', time)
    },1000)
    
    setTimeout(() => {
      clearInterval(timer)
      time = 0
      io.to(roomKey).emit('recieve_time', time)
    },time)
}