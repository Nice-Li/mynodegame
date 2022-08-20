

function randomAccess(min,max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}
function getRandomName(NameLength){
  let name = LastName[randomAccess(0, LastName.length - 1)]
  for(let i = 0;i<NameLength;i++){
    let unicodeNum  = ""
    unicodeNum = randomAccess(0x4e00,0x9fa5).toString(16)
    name += toName(unicodeNum)
  }
  return name
}


function toUni(str){
  return str.codePointAt(0).toString(16)
}

function toName(str){
  return String.fromCodePoint(parseInt(str, 16))
}

function getForName(num){
  for(let i = 0 ; i < num; i ++){
    console.log(getRandomName(randomAccess(1, 2)))
  }
}