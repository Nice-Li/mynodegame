import React , {useState} from 'react'
import {BrowserRouter as Router, NavLink} from 'react-router-dom'
import './index.css'

export default ()=>{
  const [linkState,] = useState([
    {link:'/shudu', name:'数独'},
    {link:'/thirteen', name:'十三点'}
  ])


  return <>
    <Router>
      <div className="link-bg">
        {
          linkState.map((ele, index)=>{
            return <NavLink className={`btn-link`} key={index} to={ele.link}>{ele.name}</NavLink>
          })
        }
      </div>

    </Router>
  </>
}