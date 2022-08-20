

let createNumber = 0,
    place = [],
    oldPlace = [],
    createFlag = true,
    chance = 0,
    arrOrigin = [1,2,3,4,5,6,7,8,9];

  function createNum(initArr){

    createNumber ++
    place = []
    createFlag = true
    let arr = arrOrigin;

    let res = getCheckNum(initArr);
    let checkRow = res.checkRow;
    let checkCol = res.checkCol;
    let checkItem = res.checkItem;

    for(let i = 0; i < 9; i ++){
      if(!createFlag){
        break;
      }
      let j = Math.floor(i / 3)
      let res = createNumFn(arr, checkRow[i], checkCol, checkItem[j],checkItem[j + 3], checkItem[j + 6])
      place.push(res)
    }
  
    if(createFlag){
      
      createNumber = 0
      let resflag = checkNum(place.flat())
      if(resflag){
        return place.flat()
      }else{
        return 0
      }
    }else{
      if(createNumber >= 3000){
        createNumber = 0;

        return 0
      }
      return createNum(initArr)
    }

  }

  function createNumFn(arr, row, col, ...args ){
    if(createFlag){
      let res = row;  
      for(let j = 0; j < 9; j ++){
        if(res[j]){
          continue;
        }
        let deleteArr = col[j].concat([]);
        deleteArr.push(...args[Math.floor(j / 3)])
        let fin = getRandomItem(getNotInNumber(deleteArr.concat(res), arr),1)[0]
        if(!fin){
          chance ++;       
          if(chance >= 100){
            chance = 0
            createFlag = false;
            break;
          }else{
            return createNumFn(arr, row, col, ...args)        

          }
        }
        args[Math.floor(j / 3)].push(fin);
        col[j].push(fin)
        res[j] = fin;    
      }
      return res;
    }

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


  function tipsInitFn(){
    let comFlag = comparePlace();
    if(comFlag){
      setTipsNum()
    }else{
      createNum()
    }
   }

   function setTipsNum(){
    let input = this.input;
    let judgeArr = []
    let place = this.oldPlace;
    place.flat().forEach((ele, index)=>{
      if(!(+input[index].value)){
        judgeArr.push(index)
      }
    })
    let res = this.getRandomItem(judgeArr, 1)[0]
    let dom = input[res]
    if(dom){
      dom.value = (place.flat())[res];
      dom.setAttribute('disabled', true);
      dom.style.color = 'rgb(116, 14, 199)'
    }
   }

   function comparePlace(){
    let place = this.oldPlace.flat();
    let input = this.input;
    return place.every((ele, index)=>{
      if(input[index] && ele !== input[index]){
        return false
      }
      return true;
    })
   }


  // 判断b数组中，a数组不包含的值
  function getNotInNumber(a,b){
    return b.filter(ele=>{
      if(a.includes(ele)){
        return false
      }
      return true
    })
  }
  

  function getRandomItem(arr = [], num = 0){
    let newArr = []
    for(let j =0; j < num; j ++){
      let randomNum = Math.floor(Math.random() * arr.length)
      newArr.push(arr.splice(randomNum,1))
    }
    return newArr.flat()
  }
  
  function debounce(fn, delay){
    let timer = null;
    return function(...args){
      clearTimeout(timer)
      timer = setTimeout(()=>{
        fn.apply(this, args)
      }, delay)
    }
  }

module.exports = {
  createNum
}



