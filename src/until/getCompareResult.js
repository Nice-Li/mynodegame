export default function getCompareResult(fir, fin){
  let place = fir
  let input = fin
  return place.every((ele, index)=>{
    if(input[index].num && ele !== input[index].num){
      return false
    }
    return true;
  })
 }