require ('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors') 
const { Server } = require('socket.io')


const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  // cors: {
  //   origin: "http://localhost:5173",
  //   methods: ['GET', 'POST']

  // },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2*60*1000,
    skipMiddlewares: true
  }

})

const port = process.env.PORT

app.use(cors());

app.use(express.static('public'))

let roomDetails = {}


io.on('connection', (socket) => {

  socket.on('setup_options', (setupOptions) => {
    socket.join(setupOptions.key)
    roomDetails[setupOptions.key] = {
      name: setupOptions.name,
      time: setupOptions.time,
      rounds: setupOptions.rounds,
      currentround: 1,
      users: [socket.id]
    }
    io.to(setupOptions.key).emit('recieve_time', setupOptions.time)
  })
  

  socket.on('join_room', (roomKey) => {
    if(roomDetails[roomKey] !== undefined){
      socket.join(roomKey)
  
      roomDetails[roomKey].users.push(socket.id)
  
      socket.emit('recieve_time', roomDetails[roomKey].time)
      socket.emit('set_session_name', roomDetails[roomKey].name)
      
      if (roomDetails[roomKey].rounds > 1) {
        socket.emit('set_round', roomDetails[roomKey].currentround)
      }
    }
  })

  socket.on('start_timer', (roomKey) => {
    if (roomDetails[roomKey].time > 0){
      io.to(roomKey).emit('is_round_in_progress', true)
      let timer = startTimer(roomDetails[roomKey].time, roomKey)
      socket.once('stop_timer', () => {
        clearInterval(timer)
      })
    }
  })

  socket.on('start_new_timer', (time, roomKey) => {
    if (time > 0) {
      let timer = startTimer(time, roomKey) 
      socket.once('stop_timer', () => {
        clearInterval(timer)
      })
    }
  })

  socket.on('update_time', (time, roomKey) => {
    io.to(roomKey).emit('recieve_time', time)
  })

  socket.on('next_round', (roomKey) => {
    roomDetails[roomKey].currentround ++
    io.to(roomKey).emit('recieve_time', roomDetails[roomKey].time)
    io.to(roomKey).emit('set_round', roomDetails[roomKey].currentround)
    io.to(roomKey).emit('is_round_in_progress', false)
  })

  socket.on('end_session', (roomKey) => {
    io.to(roomKey).emit('session_ended', roomDetails[roomKey].name)
    io.in(roomKey).socketsLeave(roomKey)
    delete roomDetails[roomKey]
  })
  
})

server.listen(port,() => {
  console.log(`listening on port ${port}`)
})  


function startTimer(milliseconds, roomKey){
  let time = milliseconds
    const timer = setInterval(() => {
      time = time - 1000
      io.to(roomKey).emit('recieve_time', time)
      if (time === 0){
        clearInterval(timer)
      }
    },1000)
  
  return timer
}