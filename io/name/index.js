function debanuce(back){
  let t1 = new Date().getTime()
  return function(){
    let t2 = new Date().getTime()
    if(t2 - t1 >= 500){
      back.call(null)
    }else{
      return
    }
    t1 = t2
  }
}
function createRandomNameList(t, val){
  let str = ``
  let list = []
  let flag = null

  for(let i = 0; i < t;  i ++){
    if(!val){
      let num = randomBetween(1, 2)
      if(num === 1){
        str = `xx`
      }else{
        str = `xxx`
      }
    }else{
      str = val
    }
    list.push(getRandomName(firstNameList, lastNameList, str))
    
  }

  return list
}

function showRomdonNameList(list){
  let str = ``
  list.forEach(ele=>{
    str += `<li>${ele}</li>`
  })

  return str;
}

function randomBetween(min,max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// create one name
function getRandomName(arr1, arr2, rule){
  
  let str = '',
    len1 = arr1.length, 
    len2 = arr2.length,
    len3 = rule.length,
    reg = /[a-z|A-Z]/;

  for(let i = 0; i < len3; i ++){
    if(reg.test(rule[i])){
      if(i === 0){
        str += arr1[randomBetween(0, len1-1)]
      }else{
        str += arr2[randomBetween(0, len2-1)]
      }
    }else{
      str += rule[i]
    }
  }

  return str
}