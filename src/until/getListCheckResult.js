let arrOrigin = [1,2,3,4,5,6,7,8,9]

export default (arr)=>{
  // checkNum(arr, checkPlaceNum)
  return checkNum(arr)
}


function getCheckNum(check){
  let input = check;
  let checkRow = [],checkCol = [], checkItem = [];
  for(let i = 0; i < 9; i ++){
    let row = []
    for(let j = 0 ; j < 9; j ++){
      row.push(input[i * 9 + j] || input[i * 9 + j] )
    }
    checkRow.push(row)
  }

  let flatCheck = checkRow.flat();

  for(let i = 0; i < 9; i ++){
    let col = []
    for(let j = 0 ; j < 9; j ++){
      col.push(flatCheck[i + 9 * j])
    }
    checkCol.push(col)
  }

  for(let i = 0; i < 9; i += 3){
    for(let k = 0; k < 9; k += 3){
      let item = []
      for(let j = 0 ; j < 3; j ++){
        item.push(flatCheck[i + 9 * (j + k)], flatCheck[i + 1 + 9 * (j + k)], flatCheck[i + 2 + 9 * (j + k)])
      }
      checkItem.push(item)
    }
  }

  return {
    checkRow,
    checkCol,
    checkItem
  }
}


function checkLastNum(check){
  let arr = arrOrigin;
  return  check.every(ele=>{
    return arr.every(item=>{
      return ele.includes(item)
    })
  })
}

function checkNum(check){
  let res = getCheckNum(check)
  let rowResult = checkLastNum(res.checkRow)
  let colResult = checkLastNum(res.checkCol)
  let itemResult = checkLastNum(res.checkItem)
  return rowResult && colResult && itemResult
}

