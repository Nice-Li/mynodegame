import React, { useState, useEffect } from 'react';

import socket from '../../until/socket'
import state from '../../store/state'
import request from '../../until/request'

import playAudio from '../../until/playAudio'

import './index.css'


let twiceNum = null

export default ()=>{

  const [isJoin, setIsJoin] = useState(false)
  const [card, setCard] = useState([])
  const [userList, setUserList] = useState([])
  const [isGameover, setGameOver] = useState(true)
  const [isYouTurn, setYouTurn] = useState(false)
  const [showCard, setShowCard] = useState({
    cardNum:0,
    cardColor:0
  })
  const [seletectCard, setSeletectCard] = useState()
  const [youIndex, setYouIndex] = useState()
  const [selectCardIndex, setSelectCardIndex] = useState(null)
  const [errorTips, setErrorTips] = useState(null)
  const [cardColor, setCardColor] = useState(null)
  const [changeCardColor, setChangeCardColor] = useState(false)
  const [passCount, setPassCount] = useState(0)
  const [flag, setFlag] = useState(false)
  const[passCountList, setPassCountList] = useState([])
  const [errorTipsFlag, setErrorTipsFlag] = useState(false)
  const [showScoreFlag, setShowScoreFlag] = useState(false)


  useEffect(()=>{
    
    socket.on('cards/startGame', data => {
      let startFlag = data.list.some(ele=>{
        if(ele.userName === state.name){
          setGameOver(false)
          return true;
        }
        return false
      })
      setShowScoreFlag(false)
      if(!startFlag)  return
      
      let resCard = data.list.filter(ele=>{
        if(ele.userName === state.name){ 
          return true;
        }
        return false
      })
      playAudio(1, 'start')
      
      setCard(resCard[0].card)
      setYouIndex(resCard[0].userId)

      if(resCard[0].userId === 0){
        setYouTurn(true)
      }
      setUserList(data.list.filter(ele=>{
        if(ele.userName !== state.name){
          return true
        }
        return false
      }))
      setPassCountList(l=>{
        return []
      })
    })


    socket.on('cards/error', data=>{
      playAudio(0, 'test')
      setErrorTipsFlag(true)
      setTimeout(()=>{
        setErrorTipsFlag(false)
      }, 1000)
      setErrorTips(data.errorMsg)
      
    })

    socket.on('cards/gameOver', data=>{
      if(data.isGameOver){
        setGameOver(true)
        setCardColor(0)
        setShowCard({
          cardNum:0,
          cardColor:0
        })
        playAudio(0, 'end1')
        setYouTurn(false)
        setSelectCardIndex(6)
        setChangeCardColor(false)
      }

      if(data.countListFlag){
        setShowScoreFlag(true)
        setPassCountList(()=>{
          return data.countList
        })
      }else{
        setErrorTipsFlag(true)
        setShowScoreFlag(false)
      }
      setErrorTips(data.msg)
      setIsJoin(false)
      setPassCount(0)
    })

    socket.on('cards/giveNewCards', data=>{ 
      
      setCard(l=>l.concat(data.card))
    })


    return ()=>{
      socket.emit('userNumberChanged', {
        user:state.name
      })
    }
  },[])

  useEffect(()=>{
    if(isJoin){
      window.onunload = function(){
        playAudio(0, 'test')

        socket.emit('userNumberChanged', {
          user:state.name
        })
            
      }
    }
    return ()=>{
      window.onUnload = false
    }
  },[isJoin])

  useEffect(()=>{

    socket.on('cards/setShowCard', data => {

      if(youIndex === data.turnIndex){
        setYouTurn(true)

      }else{
        setYouTurn(false)
      }

      if(data.cardColor === 'c'){
        playAudio(1, 'meihua')

      }else if(data.cardColor === 'd'){
        playAudio(1, 'fangkuai')

      }else if(data.cardColor === 'h'){
        playAudio(1, 'hongtao')

      }else{
        playAudio(1, 'heitao')
      }

      setShowCard(data.card)
      setCardColor(data.cardColor)

    })

    socket.on('cards/changeCurrentTurnIndex', data=>{
      if(youIndex === data.turnIndex){
        setYouTurn(true)
      }else{
        setYouTurn(false)
      }
      playAudio(1, 'pass')
    })
    

    return ()=>{
      socket.off('cards/setShowCard')
      socket.off('cards/changeCurrentTurnIndex')
    }
  },[youIndex])

  useEffect(()=>{

    socket.on('cards/getScore', data=>{
      socket.emit('cards/postScore', {
        index:data.index,
        passCount:passCount
      })
    })

    return ()=>{
      
      socket.off('cards/getScore')
    }
  },[passCount])


  return <div className="card-sec">
    <div className="drogon-main">
      <div className={`card-box color_${cardColor}`}  >
               
            <div className="card-top">
              {userList.map((ele, index)=>{
                return (
                  <div key={index} className="card-list">
                    <h3>{ele.userName}</h3>
                    <div className="bg-box">
                      <img src={`http://www.zxyow.com/images/cards/nice_0.png`} alt=""/>
                    </div>
                  </div>
                )
              })}
              

            </div>
          


        <div className="card-middle">
          <div className="show-color-box">
            <img src={`http://www.zxyow.com/images/cards/nice_${`${showCard.cardNum}_${showCard.cardColor}`}.png`} alt=""/>
          </div>
         
          <div className="show-card-box">
            <img src={`http://www.zxyow.com/images/cards/nice_${cardColor}.png`} alt=""/>
          </div>
        </div>
{/* 修改成直接图片显示 */}
        { 
          changeCardColor ? 
          <ul className="color-btn">
            {
              [{title:'梅花', nick:'c'},{title:'方片',nick:'d'},{title:'红桃',nick:'h'},{title:'黑花',nick:'s'}].map((ele, index)=>{       
                return (<li key={index} onClick={()=>{
                  // 1.改变花色class
                  let res = card.splice(selectCardIndex, 1)
                  setCardColor(ele.nick)
                  
                  socket.emit('cards/change', {
                    card:res[0],
                    youIndex:youIndex,
                    user:state.name,
                    cardColor:ele.nick
                  })
                  setFlag(false)
                  setErrorTipsFlag(false)
                  setChangeCardColor(false)
                  setSelectCardIndex(6)

                  if(card.length === 0){
                    socket.emit('cards/haveNewCards', {
                      user:state.name,
                      youIndex:youIndex,
                      count:0,
                      auth:false
                    })
                  }
                }}><img src={`http://www.zxyow.com/images/cards/nice_${ele.nick}.png`}  alt=""   /></li>)
              })
            }
              
            
          </ul> : ''
          }
{/* 计分box */}
        {
        showScoreFlag && <div className={"score-box"}>
          {passCountList.map((ele, index)=>{
            return <p key={index}>
              <span>{ele.userName}</span> 的弃牌总和为:{ele.userCount}
              </p>
            })}
        </div> 
        }
{/* error box */}
        {errorTipsFlag && <div className="error-tips-box">
          {errorTips} 
        </div> 
        }

        <div className="card-bottom">
          {
            isYouTurn && !isGameover? (
            <div className="btn-list">
              <button onClick={()=>{
                if(!flag){
                  setErrorTipsFlag(true)
                  playAudio(0, 'test')

                  setErrorTips('请选择卡牌后再出牌！')

                  return 
                }
                
                if(seletectCard.cardNum === 11 || seletectCard.cardNum === showCard.cardNum || seletectCard.cardNum === 0){
                  playAudio(0, 'change')

                  setErrorTipsFlag(true)

                  setErrorTips('请选择需要转变成的底牌花色！')
                  setChangeCardColor(true)
                  setYouTurn(false)
                  return 
                }
                if( cardColor && cardColor !== seletectCard.cardColor){
                  playAudio(0, 'test')

                  setErrorTipsFlag(true)
                  setErrorTips('所选卡牌花色与底牌花色不同！')
                  return 
                }
                
                let res = card.splice(selectCardIndex, 1)
                setFlag(false)
                setSelectCardIndex(6)
                socket.emit('cards/change', {
                  card:res[0],
                  youIndex:youIndex,
                  user:state.name,
                  cardColor:res[0].cardColor
                })

                if(card.length === 0){
                  // 当出牌后 卡牌 为0 自动摸牌
                  socket.emit('cards/haveNewCards', {
                    user:state.name,
                    youIndex:youIndex,
                    count:0,
                    auth:false   
                  })
                }

              }}>出牌</button>

              <button onClick={()=>{
                if(!flag){
                  setErrorTipsFlag(true)
                  playAudio(0, 'test')
                  setErrorTips('请先选择需要弃置的卡牌！')
                  return 
                }
                let res = card.splice(selectCardIndex, 1)
                setPassCount(n=>{
                  return n + res[0].cardNum
                  
                })
                setFlag(false)
                setSelectCardIndex(6)

                  socket.emit('cards/haveNewCards', {
                    user:state.name,
                    youIndex:youIndex,
                    count:card.length,
                    auth:true
                  })          
              
              }}>弃牌</button>

          </div> ) : (
            ''
          )
          }
          
          {
            (isJoin && !isGameover) && (

              <ul>
                { card.map((ele, index) =>{
                  return (<li className={selectCardIndex === index ? 'active' : ''} onClick={(e)=>{
                    if(changeCardColor){
                      return 
                    }
                   
                    setFlag(true)
                    setErrorTipsFlag(false)
                    setSeletectCard(ele)
                    setSelectCardIndex(index)
                  }} key={index}>
                    <img src={`http://www.zxyow.com/images/cards/nice_${ele.cardNum}_${ele.cardColor}.png`} alt=""/>
                  </li>)
                }) }
              </ul>
              
            ) 
          }

          

          {
            isJoin ? (
            <div className='start-btn'>
                <button className="restart-box" onClick={()=>{
                  if(isGameover){
                    twiceNum = 0
                    setShowScoreFlag(false)
                    socket.emit('cards/start')
                    return
                  }
                  return false;
                }}>               
                  开始游戏
              </button>
              <button className="restart-box" onClick={()=>{
                  setShowScoreFlag(false)
                  
                  socket.emit('cards/restart',{
                    user:state.name,
                  })
                  
              }}>               
                重启游戏
              </button>
            </div>
            ) : (
            <div className="join-btn">
              <button className="join-box" onClick={()=>{

                  playAudio(1, 'ready')

                  setErrorTipsFlag(false)
                  request.post('/joinCard', {
                    user:state.name,
                    
                  }).then(val=>{
                    if(val.data === 'ok'){
                      setIsJoin(true)
                    }else{
                      setErrorTipsFlag(true)
                      setErrorTips(val.data)
                      setTimeout(()=>{
                        setErrorTipsFlag(false)
                      }, 500)
                      if(twiceNum === 12){
                        setShowScoreFlag(false)
                        
                        socket.emit('cards/restart',{
                          user:state.name,
                        })
                
                        twiceNum = 0
                      }else{
                        console.log(twiceNum)
                        twiceNum ++
                      }

                    }
                  })
                }}>
                  点这里加入游戏吧！
              </button>
            </div>

            )
          }
          
        </div>
      
      </div>

    </div>

    <div className='changeThemeBtn' onClick={()=>{
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if(document.documentElement.classList.contains('dark')){
          document.documentElement.classList.remove('dark')
        }
        document.documentElement.classList.toggle('light')
      }
      
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        if(document.documentElement.classList.contains('light')){
          document.documentElement.classList.remove('light')
        }
        document.documentElement.classList.toggle('dark')
      }
      
      if (window.matchMedia('(prefers-color-scheme: no-preference)').matches) {
        if(document.documentElement.classList.contains('light', 'dark')){
          document.documentElement.classList.remove('light', 'dark')
        }
        document.documentElement.classList.toggle('dark')
      }
    }}>切换</div>
    
  </div>
}