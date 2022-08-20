import firstNameList from './firstNameList'




function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function toName(str) {
  return String.fromCodePoint(parseInt(str, 16))
}

export default function getName() {
  let forLen = randomNum(1, 2)
  let name = firstNameList[randomNum(0, firstNameList.length - 1)]
  for (let i = 0; i < forLen; i++) {
    let unicodeNum = ""
    unicodeNum = randomNum(0x4e00, 0x9fa5).toString(16)
    name += toName(unicodeNum)
  }

  localStorage.setItem("name", `${name}`)
  return `${name}`
}