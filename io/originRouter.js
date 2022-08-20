const Router = require('koa-router')
const mongo = require('./mongodb')
const router = new Router()

let url = 'mongodb://zx:@localhost:27017?authMechanism=DEFAULT&authSource=admin';

let dbName = 'secrace'
let colName = null


router.get('/', async ctx=>{
  
  if(+ctx.cookies.get('_ok')){
    colName = 'usr'
    var data = {
      usrname:decodeURIComponent(ctx.cookies.get('usrname'))
    }
    let result = await mongo.mongoFind(url,dbName,colName,data)

    ctx.body = {
      islogin : true,
      usrname: result[0].usrname,
      myid:result[0].myid,
      isjoin:result[0].isjoin
    }
    return 
  }
  ctx.body = 0
})
.get('/login', async ctx=>{

  colName = 'usr'
  var data = {
    usrname:ctx.query.usrname,
    password:ctx.query.password
  }
  let result = await mongo.mongoFind(url,dbName,colName,data)
  if(result.length === 0){
    ctx.body = 0
    return
  } 
  ctx.cookies.set('_ok', 1, {
    'maxAge': 60 * 1000 * 60 * 24 * 11,
    'HttpOnly':true,
    'domain':'zxyow.com',
    'path':'/'
  })

  let cookieUsrName = encodeURIComponent(result[0].usrname)
  ctx.cookies.set('usrname', cookieUsrName, {
    'maxAge': 60 * 1000 * 60 * 24 * 11,
    'HttpOnly':true,
    'domain':'zxyow.com',
    'path':'/'
  })
  ctx.body = {
    islogin:result[0].islogin,
    usrname:result[0].usrname,
    myid:result[0].myid,
    isjoin:result[0].isjoin
  }
})
.post('/register',async ctx=>{
  // 注册
  colName = 'usr'
  let reg = /(\<)(\/?\w*)(\>)/gm

  let usrname = ctx.request.body.params.usrname.replace(reg,($,$1,$2,$3)=>{
    return $1 + $2 + $3
  })
  let data = {usrname:usrname}
  let FindResult = await mongo.mongoFind(url,dbName,colName,data)
  if(!FindResult[0]){
    let countResult = await mongo.mongoFind(url,dbName,colName)
    var countNum = countResult.length
    data = {
      usrname:usrname,
      password:ctx.request.body.params.password,
      isjoin:0,
      islogin:1,
      myid:countNum + 1
    }
    let regResult = await mongo.mongoInsertOne(url,dbName,colName,data)
    ctx.body = regResult.result.ok
  }else{
    ctx.body = 0
  }
})
.get('/join',async ctx=>{
  // 报名参赛
  
  colName = 'usr'
  let filterUp = {
    usrname:ctx.query.usrname,
    myid:Number(ctx.query.myid)
  }

  let FindResult = await mongo.mongoFind(url,dbName,colName,filterUp)
  if(!FindResult[0].isjoin){
    let data = {
      isjoin:1,
    }
    let regResult = await mongo.mongoUpdateOne(url,dbName,colName,filterUp,data)

    ctx.body = regResult.result.ok
  }else{
    ctx.body = 0
  }
})
.get('/singer', async ctx=>{
  // singer路由
  
  colName = 'usr'
  var data = {islogin:1}
  let FindResult = await mongo.mongoFind(url,dbName,colName,data)
  let resultArr = []

  for(let i =0; i < FindResult.length; i ++){
    let  joindata = {
        isjoin:FindResult[i].isjoin,
        id:FindResult[i].myid, 
        singername:FindResult[i].usrname
      }
    data = {singerid:FindResult[i].myid}
    var songres = await mongo.mongoFind(url,dbName,'songs',data)
    if(songres.length === 0) {
      resultArr.push(joindata)
      continue
    }
    var songs = []
    songres.forEach(ele=>{
      if(ele.songid === 1){
        songs.unshift(ele.songs)
        return 
      }
      songs.push(ele.songs)
    })
    resultArr.push(Object.assign(joindata,{ song:songs}))
  }
  ctx.body = resultArr
})
.get('/getscore', async ctx=>{
  // 获取comments集合中的score
  
  colName = 'score'
  let data = {
    singerid:Number(ctx.query.singerid),
    songid:Number(ctx.query.songid)  
  }
  let FindResult = await mongo.mongoFind(url,dbName,colName,data)
  let score = 0
  let len =FindResult.length
  FindResult.forEach(ele=>{
    if(!ele.score){
      return 
    }
    score += Number(ele.score)
  })
  if(!score/len){
    ctx.body = 0
  }else{
    ctx.body = (Math.floor((score / len) * 100)) / 100
  }
})
.post('/songput', async ctx=>{
  // 添加歌曲
  
  colName = 'songs'
  let reg = /(\<)(\/?\w*)(\>)/gm

  song = ctx.request.body.params.song.replace(reg,function($,$1,$2,$3){
    $1 = '&lt'
    $3 = '&rt'
    return $1 + $2 + $3
  })
  let result = null
  let myid = +ctx.request.body.params.myid
  let singerid = +ctx.request.body.params.singerid
  let data = { singerid:singerid,songs:song }
  let filterUp = { 
    myid:myid,
  }

  let FindResult = await mongo.mongoFind(url,dbName,colName,filterUp)
  if(FindResult.length === 0){
    result = await mongo.mongoInsertOne(url,dbName,colName,Object.assign(filterUp,data,{songid:1}))
    if(result.result.ok ){
      ctx.body = 1
    }else{
      ctx.body = -1
    }
    return 
  }else if(FindResult.length === 2){
    ctx.body = 0
    return
  }else{
    filterUp={isjoin:1}
    let usrResult = await mongo.mongoFind(url,dbName,'usr',filterUp)
    let isJoinNumber = []
    
    usrResult.filter(ele=>{
      isJoinNumber.push(ele.myid)
    })
    isJoinNumber.sort(()=>Math.random() - 0.5)
    
    let num = spliceNum(isJoinNumber, 0, 1)
    while(true){
      filterUp={singerid:num}
      data = {
        singerid:num,
        myid:myid,
        songs:song,
        songid:2
      }
      let othersong =await mongo.mongoFind(url,dbName,colName,filterUp)
      var leng = othersong.length
      if(leng === 0){
        result = await mongo.mongoInsertOne(url,dbName,colName,data)
        ctx.body = 0
        return 
      }else if(leng === 1){
        if(othersong[0].singerid === othersong[0].myid){
          result = await mongo.mongoInsertOne(url,dbName,colName,data)
          ctx.body = 0
          return 
        }else{
          num = spliceNum(isJoinNumber, 0, 1)
          continue
        }   
      }else{
        num = spliceNum(isJoinNumber, 0, 1)
        continue
      }   
    }
  }
})
.post('/sendscore',async ctx=>{
  // 打分系统
  
  colName = 'score'
  let filterUp = {
    myid:Number(ctx.request.body.params.myid),
    songid:Number(ctx.request.body.params.songid),
    singerid:Number(ctx.request.body.params.singerid)
  }
  let reg = /(^\d{1,2}(\.\d{0,2})?$)|(^100$)/
  let scoreFlag = reg.test(ctx.request.body.params.score)
  if(scoreFlag){
    let FindResult = await mongo.mongoFind(url,dbName,colName,filterUp)
    if(FindResult.length !== 0){
      ctx.body = 0
      return 
    }
    var data =Object.assign(filterUp, {score:ctx.request.body.params.score})
    let result = await mongo.mongoInsertOne(url,dbName,colName,data)
    ctx.body = result.result.ok
  }else{
    ctx.body = 0;
  }

})
.post('/sendcomment', async ctx=>{
  // 发送评论
 
  colName = 'comments'
  let reg = /(\<)(\/?\w*)(\>)/gm
  let comment = ctx.request.body.params.comment.replace(reg,($,$1,$2,$3)=>{
    return $1 + $2 + $3
  })
  let T = new Date()
  let Year = T.getFullYear()
  let Mon = T.getMonth() + 1;
  Mon = Mon < 10 ? '0' + Mon : Mon
  let Day = T.getDate()
  Day = Day < 10 ? '0' + Day : Day
  let H = T.getHours()
  H = H < 10 ? '0' + H : H
  let M = T.getMinutes()
  M = M < 10 ? '0' + M : M
  let S = T.getSeconds()
  S = S < 10 ? '0' + S : S
  let data = {
    myid: +ctx.request.body.params.myid, 
    comment:comment,
    songid:+ctx.request.body.params.songid,
    singerid:+ctx.request.body.params.singerid,
    date:Year + '-' + Mon + '-' + Day + ' ' + H + ':' + M +  ':' + S
  }

  let regResult = await mongo.mongoInsertOne(url,dbName,colName,data)
  ctx.body = regResult.result.ok
})
.get('/getcomment', async ctx=>{
  // 获取评论
  colName = 'comments'
  let data = {
    singerid:+ctx.query.singerid, 
    songid:+ctx.query.songid
  }
  let limitnum = 10;
  let skipnum = Number(ctx.query.skipnum);
  let type = {date: -1}

  let comResult = await mongo.mongoSortSkipLimit(url,dbName,colName,data,type,skipnum,limitnum)

  let newcomarr = []
  comResult.forEach(ele=>{
    if(!ele.date){
      return
    }
    newcomarr.push({comment:ele.comment,date:ele.date})
  })
  ctx.body = newcomarr
})








function spliceNum(arr, start, end){
  return arr.splice(start, end)[0]
}


// function randomNum(max,min){
//   return Math.floor(Math.random()*(max - min + 1)) + min 
// }

module.exports = router
