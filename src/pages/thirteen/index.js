import React,{useState, useEffect, useReducer} from 'react'
import socket from '../../until/socket'
import getMusic from  '../../until/getMusic'
import './index.css'
import RemBox from '../../components/remenber/index'


import state from '../../store/state'
import reducer from '../../store/reducer'


function getANumber(min, max){
  return Math.round(Math.random() * (max - min ) * 100 + Math.floor(Math.random() * 50 + 25) ) / 400
}


export default (props)=>{

  const [randomNum, setRandomNum] = useState(0)
  const [isJoin, setJoin] = useState(false)
  const [num, setNum ] = useState(0)
  const [endFlag, setEndFlag] = useState(false)
  const [remList, setRemList] = useState([])
  const [login, ] = useReducer(reducer, state)

  useEffect(()=>{
    

    socket.on('thir/setNum', data=>{
      setRemList(l=>{
        
        let r = l.concat([])
        r.unshift(data)
        return r
      })
      setNum(data.num)
      setRandomNum(data.resolteNum)
      if (data.endFlag ){
        setEndFlag(data.endFlag) 
      }
    })

    socket.on('thir/restart', (data)=>{
      setRemList([{
        eventName:data.eventName,
        eventDetail:data.eventDetail
      }])
      setNum(data.originNum)
      setRandomNum(data.resolteNum)
      setEndFlag(false)
    })
    socket.on('thir/getLoginName', data=>{
      setRemList(l=>{
        let r = l.concat([])
        r.unshift(data)
        return r
      })
      setRandomNum(data.resolteNum)
    })
    return ()=>{
      socket.off('thir/setNum')
      socket.off('thir/restart')
      socket.off('thir/getLoginName')

    }
  },[])




  return <>
    <p className="number-show">{num}</p>

    <RemBox list={remList} />

    <div className='btn-box'>
    
    {isJoin ? 
    <>
      <button className='btn-click' onClick={
        (e)=>{
          if(endFlag){
            return 
          }
          getMusic(num)
          let RNum = getANumber(num, randomNum)
          socket.emit('thir/getNum', {num:RNum, name:login.name})
        }
      }>参与一次</button>

      <button className='btn-click' onClick={
        (e)=>{

          if(endFlag){
            getMusic(15)
            setEndFlag(false)
            socket.emit('thir/restart', {num:0,name:login.name})
          }

        }
      }>再来一局</button>
    </>

    : 
    <button className='btn-click' onClick={()=>{
      setJoin(true)
      socket.emit('thir/joinName', {name:login.name})
    }}>{`${login.name} 快点这里加入游戏吧！`}</button>
    }
    </div>

  

  </>
}