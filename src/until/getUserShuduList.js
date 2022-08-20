import getRandomIndex from './getRandomIndex'
import getRandomList from './getRandomList'
import getOriginIndex from './getOriginIndex' 

export default function getUserShuduList(arr, count, originIndex){
  let NArr = arr.concat([])
  if(originIndex){
    return getRandomList(NArr, getRandomIndex(originIndex, getOriginIndex(81), count) )
  }
  return getRandomList(NArr, getRandomIndex(getOriginIndex(81), count) )
}