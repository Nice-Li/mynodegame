import React, {useEffect, useReducer, useState} from 'react';
import './App.css';

import state from './store/state'
import reducer from './store/reducer'
import {loginAction} from './store/actions'

// import NavRoute from './router/index'
// import DMain from './pages/thirteen/index'
// import DMain from './pages/shudu/index'
import DMain from './pages/colorDrogon/index'

import getName from './until/getRandomName'

const username = localStorage.getItem('name') ? localStorage.getItem('name') : getName()

// const username = getName()

function App() {
  const [login, loginDispatch] = useReducer(reducer, state)
  const [, setUpdate] = useState({})
  useEffect(()=>{

      loginDispatch({type:loginAction, payload:{name:username}})
      setUpdate({})

  },[])

  return (
    <div className="App">
      <footer className="App-footer">{"您好： " + login.name + "，欢迎您！"}</footer>
      <section className="App-main">
      <DMain></DMain>
      </section>
      
    </div>
  );
}

export default App;
