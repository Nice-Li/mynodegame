const Koa = require('koa')

const Socket = require('socket.io')

const app = new Koa()

const server = require('http').createServer(app.callback())

const io = Socket(server)
// const io = Socket(app)

// const origin = 'http://localhost:3000'

// server.on('request', (req, res)=>{
//   console.log('request')
//   if(req.url === '/'){
//     console.log('/ insert')

//     res.end('http')
//   }
// })
let num = 0

io.on('connection', socket => {
  console.log('connection')
  
  socket.on('event', data => {
    num += data.num
    io.emit('msg', {num: num})
  })
})


server.listen('8080',()=>{console.log('8080 running')})