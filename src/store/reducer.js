
import {loginAction,setNumList,setUserNumList } from './actions'

export default (state, action)=>{
  switch(action.type){
    case loginAction:
      return Object.assign(state, action.payload)

    case setNumList:
      return Object.assign(state, action.payload)

    case setUserNumList:
      return Object.assign(state, action.payload)
      
    default:
      return state
  }
}