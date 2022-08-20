export default function getRandomList(arr, itemArr){
  itemArr.forEach(ele=>{
    arr.splice(ele, 1, '')
  })

  let finArr = []

  arr.forEach(ele=>{
    if(ele){
      finArr.push({
        num:ele,
        disable:true,
      })
    }else{
      finArr.push({
        num:ele,
        disable:false,
      })
    }
  })

  return finArr
}