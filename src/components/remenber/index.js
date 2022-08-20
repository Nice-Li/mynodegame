import React from 'react';

import './index.css'

export default (props)=>{
  const flagName = localStorage.getItem('name')

  return (<div className="rem-box">
    {
      props.list.map((ele, index)=>{
        return <p key={`${index}thisismykey`}  >
           <span className={flagName === ele.eventName ? `NC1-text event-name` : "event-name"}>{`${ele.eventName} `}</span>
          <span >{`${ele.eventDetail} `}</span>
          
          </p>
      })
    }
  </div>)
}