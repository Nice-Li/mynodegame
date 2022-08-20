


export default function getRandomIndex(arr = [], num = 0, origin){
  if(origin){
    return origin
  }
  let resArr = []
  for(let j =0; j < num; j ++){
    let randomNum = Math.floor(Math.random() * arr.length)
    resArr.push(arr.splice(randomNum,1))
  }
  return resArr.flat()
}