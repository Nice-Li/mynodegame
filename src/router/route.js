import React  from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import './index.css'
import Thirteen from '../pages/thirteen/index'
import Shudu from '../pages/shudu/index'

export default ()=>{

  return <>
    <Router>
      <Switch>
        <Route exact path='/thirteen' component={Thirteen}/>
        <Route exact path='/shudu' component={Shudu}/>
      </Switch>
    </Router>
  </>
}