import getRandomIndex from './getRandomIndex'

export default function (current){
  
  let indexArr = []
  current.forEach((ele, index)=>{
    if(!ele.num){
      indexArr.push(index)
    }
  })
  return getRandomIndex(indexArr, 1)[0]
}
