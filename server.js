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

let time = 0

// const timer = setInterval(() => {
//   time = time - 1000
//   console.log(time)
// },1000)

// setTimeout(() => {
//   clearInterval(timer)
// },time)

app.use(cors());

io.on('connection', (socket) => {
  console.log(`user connected: ${socket.id}`)

  socket.on('start_timer', (data) => {
    time = data
    const timer = setInterval(() => {
      time = time - 1000
      console.log(time)
      socket.broadcast.emit('recieve_time', time)
    },1000)
    
    setTimeout(() => {
      clearInterval(timer)
      time = 0
      socket.broadcast.emit('recieve_time', time)
    },time)
  })
  
})

server.listen(port,() => {
  console.log(`listening on port ${port}`)
})  
