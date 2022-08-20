const cluster = require('cluster');
const sticky = require('sticky-session');
const Koa = require('koa')
const Socket = require('socket.io')
const Router = require('koa-router')
const app = new Koa()


const router = new Router()

// const server = require('http').createServer(app.callback())

const server = require('http').createServer(function(req, res) {
  res.end('worker: ' + cluster.worker.id);
});
const io = Socket(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true
  }
})

let sid = null;

io.on('connection', socket => {
 sid = socket.id;
  console.log('connection server')
  socket.on('test1', data=>{
    console.log('listen test1 event')
    socket.emit('getA', {
      a:data.a
    })
  })
})

router.options('/socket.io', (ctx)=>{
  setOptionsReq(ctx)
})
.post('/socket.io', (ctx)=>{
  setGetReqOrigin(ctx)
  ctx.cookies.set('io', sid)
  ctx.body = 123
})
.get('/test', ctx=>{
  ctx.body = 234
})


app.use(router.routes());
// 处理405 501
app.use(router.allowedMethods());

if (!sticky.listen(server, 8080)) {
  // Master code
  server.once('listening', function() {
    console.log('server started on 8080 port');
  });
} else {
  // Worker code
  console.log('other')
}



function setGetReqOrigin(ctx){
  ctx.set("Access-Control-Allow-Origin",'*')

}
function setOptionsReq(ctx){
  ctx.set("Access-Control-Allow-Origin", '*')
  ctx.set("Access-Control-Allow-Methods", " GET, OPTIONS, POST");
  ctx.set('Access-Control-Allow-Headers','content-type')
  ctx.set("Access-Control-Max-Age", "2592000");
  // ctx.set('Access-Control-Allow-Credentials', 'true')
}