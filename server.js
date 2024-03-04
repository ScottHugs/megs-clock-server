
const express = require('express')
const app = express()
const port = 3365

app.use(express.static('client'))

let time = 0

function timer (seconds){
  const updateTime = () => time = timer
  for (let timer = seconds*1000; timer !== 0; timer = timer - 1000) {
    setInterval(updateTime, 1000)
    console.log(time)
  }
}

timer(5)

app.get('/test', (req, res) => {
  res.send('its working')
})


app.listen(port,() => {
  console.log(`listening on port ${port}`)
})