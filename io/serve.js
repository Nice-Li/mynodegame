const Koa = require('koa')
const Socket = require('socket.io')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
app.use(bodyParser())

const server = require('http').createServer(app.callback())


const Shudu = require('./shudu')

const io = Socket(server,{
  cors:{
     origin:"http://localhost:3000",
     methods:["GET", "POST"],
     credentals:true
  }
})

let num = 0
let randomNum = 23;

// card section
// let joinCardNumber = null;
let originCards = getOriginCards() //.concat(getOriginCards())
let cardsList = []
let cardUser = []
let cardsStartFlag = false

io.on('connection', socket => {
  
  socket.on('thir/getNum', data => {
    let detail = null, endFlag = false;
    
    num += data.num
    if(num >= randomNum){
      detail = `摇出了 ${data.num}，触发了本次随机数 ${randomNum} ！！！`
      endFlag = true
    }else{
      detail = `摇出了 ${data.num}`
      endFlag = false
    }
    io.emit('thir/setNum', {
      num: num.toFixed(2),
      eventName:data.name,
      eventDetail:detail,
      originNum:data.num,
      resolteNum:randomNum,
      endFlag
    })
    
  })
  socket.on('thir/restart', (data) => {
    num = data.num
    randomNum = getRandomNumber(13, 31)

    io.emit('thir/restart',{
      eventName:data.name,
      eventDetail:`重新开始了游戏`,
      originNum:0,
      resolteNum:randomNum
    })


  })
  socket.on('thir/joinName', data=>{
    io.emit('thir/getLoginName', {
      eventName:data.name,
      eventDetail:'加入了游戏！',
      resolteNum:randomNum
    })
  })
  socket.on('thir/quiteGame', data =>{
    io.emit('thir/getLoginName', {
      eventName:data.name,
      eventDetail:`退出了游戏`
    })
  })

  socket.on('cards/start', data => {
    if(cardsStartFlag) return

    let len = cardUser.length
    if(len < 2){
      socket.emit('cards/error', {errorMsg:'游戏人数少于2人，不能开启游戏...'})
    }else if(len > 7){
      socket.emit('cards/error', {errorMsg:'参与游戏人数不能大于6人...'})
    }else{
      cardsList = getArrRandomList(originCards)
      let list = []
      cardUser = getArrRandomList(cardUser)
      cardUser.forEach((ele, index)=>{
        list.push({
          userId:index,
          userName:ele.userName,
          card:cardsList.splice(0, 5)
        })
        ele.cardsCount = 5
      })

      io.emit('cards/startGame', {
        list:list
      })

      cardsStartFlag = true

    }
  })

  socket.on('cards/change', data=>{
    
    let index = data.youIndex
    cardUser[index].cardsCount -= 1;
     
    let turn = getCurrentTurn(cardUser, cardUser.length, index)

    io.emit('cards/setShowCard', {
      card:data.card,
      turnIndex:turn,
      cardColor:data.cardColor
    })

  })

  socket.on('cards/haveNewCards', data=>{

    let len = cardsList.length;

    if(data.auth){
      let index = data.youIndex;

      let turn = getCurrentTurn(cardUser, cardUser.length, index)
      io.emit('cards/changeCurrentTurnIndex', {
        turnIndex:turn
      })
    }

    if(len === 0 && data.count === 0){
      cardUser[data.youIndex].isGameOver = true;
   
      socket.emit('cards/getScore', {
        index:data.youIndex
      })

      return 
    }

    

    let card = getCurrentCard(len, cardsList, data.count)

    cardUser[data.youIndex].cardsCount = card.length + data.count;
    socket.emit('cards/giveNewCards', {
      card:card,

    })
  })

//  !!!
  socket.on('cards/restart', data=>{
 
    // let stopFlag = cardUser.some((ele)=>{
    //   if(ele.userName === data.user){
    //     return true
    //   }
    //   return false
    // })

    // if(stopFlag){
      cardUser = []
      cardsStartFlag = false
      io.emit('cards/gameOver', {
        isGameOver:true,
        countListFlag:false,
        msg:`${data.user} 重启了游戏，点击加入重新开始游戏吧！`
      })
    // }else{
    //   return 
    // }

    
    
  })

  socket.on('cards/postScore', data=>{
    cardUser[data.index].passCount = data.passCount

    let flag = cardUser.every(ele=>{
      return ele.isGameOver
    })

    if(flag){
      let arr = []
      cardUser.forEach(ele=>{
        arr.push({
          userName:ele.userName,
          userCount:ele.passCount
        })
        ele.isGameOver = false

      })
      io.emit('cards/gameOver', {
        isGameOver:true,
        countList:arr,
        countListFlag:true,
        msg:'本场游戏结束！点加入开始下一场游戏吧！'
      })
      cardsStartFlag = false
      cardUser = []  //  !!!
      originCards = getOriginCards()
    }
  })

  socket.on('userNumberChanged', data => {
    // console.log('window closed')
    // cardUser = cardUser.filter(ele=>{
    //   if(ele.userName === data.user){
    //     return false
    //   }
    //   return true
    // })
    cardUser = []
    cardsStartFlag = false
    io.emit('cards/gameOver',{
      isGameOver:true,
      countList:[],
      msg:`玩家${data.user}退出游戏,请重新开始游戏！`
    })
  })
})




let router = new Router()


router.get('/getShudu', ctx=>{
  setGetReqOrigin(ctx)

  // console.log(Shudu.createNum(new Array(81)))
  ctx.body = Shudu.createNum(new Array(81))
})
.options('/getNewShuduList', ctx=>{
  setOptionsReq(ctx)

  ctx.body = null
})
.post('/getNewShuduList', ctx=>{
  setGetReqOrigin(ctx)
// ctx.request.body.params
  let list = ctx.request.body.list
  let newList = list.map(ele=>{
    return ele.num
  })
  
  ctx.body = Shudu.createNum(newList) 
})
.options('/joinCard', ctx=>{
  setOptionsReq(ctx)
  ctx.body = null
})
.post('/joinCard', ctx =>{
  setGetReqOrigin(ctx)
  if(cardsStartFlag){
    ctx.body = '游戏已开始，请等待游戏结束...'
    return 
  }

  let userName = ctx.request.body.user
  let flag = cardUser.some(ele=>{
    if(ele.userName === userName){
      return true
    }
    return false
  })
  if(!flag){
    cardUser.push({
      userName:ctx.request.body.user,
      cardsCount:0
    })
  }
  
  ctx.body = 'ok'
})



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

app.use(router.routes());
// 处理405 501
app.use(router.allowedMethods());
server.listen('8080')



function getRandomNumber(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getOriginCardsOther(){
  let origin = [];

  ['c', 'd', 'h', 's'].forEach((ele, index)=>{
    for(let i = 1 ; i < 3; i ++ ){
      origin.push({
        cardNum:i,
        cardColor:ele
      })
    }
  })

  origin.push({
    cardNum:0,
    cardColor:'big'
  },{
    cardNum:0,
    cardColor:'small'
  })

  return origin
}

function getArrRandomList(arr){
  let newArr = arr.concat([])
  let len = newArr.length;
  let numArr = []
  for(let i = 0; i < len; i ++){
    let num = Math.floor(Math.random() * newArr.length ) 

    numArr.push(newArr.splice(num, 1))
  }

  return numArr.flat()
}


function getOriginCards(){
  let origin = [];

  ['c', 'd', 'h', 's'].forEach((ele, index)=>{
    for(let i = 1 ; i < 4; i ++ ){
      origin.push({
        cardNum:i,
        cardColor:ele
      })
    }
  })

  origin.push({
    cardNum:0,
    cardColor:'big'
  },{
    cardNum:0,
    cardColor:'small'
  })

  return origin
}





function getCurrentUserIndex(youIndex, len){
  if(youIndex + 1 >= len){
    return 0
  }else{
    return  youIndex + 1
  }
}


function getCurrentCard(len, list, step){
  if(len > 0 && len <= 5 - step){
    return list.splice(0, len)
  }else if(len === 0){
    return []
  }else{
    return list.splice(0, 5 - step)
  }
}



function getCurrentTurn(arr, len, youIndex){
  let turn = getCurrentUserIndex(youIndex, len)
  for(let i = 0 ; i < len; i ++){
    if(arr[turn].isGameOver){
      turn = getCurrentUserIndex(turn, len)
      continue
    }else{
      return turn 
    }
  }
  return turn 
}