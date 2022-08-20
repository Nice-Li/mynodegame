
const Koa = require('koa')
const Socket = require('socket.io')

const bodyParser = require('koa-bodyparser')
const router = require('./router')
const Shudu = require('./shudu')

const app = new Koa()

app.use(bodyParser())




const server = require('http').createServer(app.callback())

const io = Socket(server,{path:'/'})

let num = 0
let randomNum = 23;



let originCards = getOriginCards().concat(getOriginCards())
let cardsList = []
let cardUser = []


io.on('connection', socket => {
  
  socket.on('thir/getNum', data => {
    let detail = null;
    
    num += data.num
    if(num >= randomNum){
      detail = `触发了本次节点！！！`
    }else{
      detail = `摇出了 ${data.num}`
    }
    io.emit('thir/setNum', {
      num: num.toFixed(2),
      eventName:data.name,
      eventDetail:detail,
      originNum:data.num,
      resolteNum:randomNum
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

  socket.on('crads/start', data => {
    let len = cardUser.length
    if(len < 2){
      io.emit('cards/error', {errorMsg:'游戏人数少于2人，不能开启游戏...'})
    }else if(len > 7){
      io.emit('cards/error', {errorMsg:'参与游戏人数过多，请矜持...'})
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
  socket.on('cards/giveUp', data=>{
    if(cardsList.length === 0 && data.count === 0){
      cardUser[data.youIndex].isGameOver = true;


      socket.emit('cards/getScore', {
        index:data.youIndex
      })

    }

    let index = data.youIndex;
    cardUser[index].cardsCount -= 1;

     let turn = getCurrentTurn(cardUser, cardUser.length, index)
    let list = []
    let newArr = cardUser.slice(index).concat(cardUser.slice(0, index))

    newArr.forEach(ele=>{

      let len = cardsList.length;
      let card = getCurrentCard(len, cardsList, ele.cardsCount)

      ele.cardsCount = 5

      list.push({
        userName:ele.userName,
        card:card,
      })
    })


    io.emit('cards/getNewCards', {
      list:list,
      turnIndex:turn
    })

  })

  socket.on('cards/getGameModeHard', data=>{
    
      io.emit('cards/setGameModeHard', {
        mode:data.mode
      })
    
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
        msg:'欢迎加入游戏...'
      })

      originCards = getOriginCards()
    }
  })

  socket.on('userNumberChanged', data => {
    cardUser = cardUser.filter(ele=>{
      if(ele.userName === data.user){
        return false
      }
      return true
    })

    io.emit('cards/gameOver',{
      isGameOver:true,
      countList:[],
      msg:`玩家${data.user}退出游戏,请重新开始游戏！`
    })
  })
})


router.get('/getShudu', ctx=>{
  ctx.body = Shudu.createNum(new Array(81))
})
.post('/getNewShuduList', ctx=>{
  let list = ctx.request.body.list
  let newList = list.map(ele=>{
    return ele.num
  })
  
  ctx.body = Shudu.createNum(newList) 
})
.post('/joinCard', ctx =>{

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
    for(let i = 1 ; i < 14; i ++ ){
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

