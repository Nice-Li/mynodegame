const Koa = require('koa')
// const mongo = require('./mongodb')
const bodyParser = require('koa-bodyparser')

const router = require('./router')

const server = new Koa()

server.use(bodyParser())


server.use(router.routes() ); // 将路由与实例挂钩

server.use(router.allowedMethods())

server.listen(8080, ()=>{
  console.log('8080 running')
})