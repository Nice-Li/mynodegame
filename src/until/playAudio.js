
import state from '../store/state'

import startMp3 from '../static/start.mp3'
import readyMp3 from '../static/ready.mp3'
import pushMp3 from '../static/push.mp3'
import end1Mp3 from '../static/end1.mp3'
import passMp3 from '../static/pass.mp3'
import fangkuaiMp3 from '../static/fangkuai.mp3'
import meihuaMp3 from '../static/meihua.mp3'
import hongtaoMp3 from '../static/hongtao.mp3'
import heitaoMp3 from '../static/heitao.mp3'
import changeMp3 from '../static/change.mp3'

import testMp3 from '../static/C.mp3'


export default function playAudio(num, str){
  let res = null
  switch (str) {
    case 'start':
      res = startMp3
      break;
    case 'ready':
      res = readyMp3
      break;
    case 'end1':
      res = end1Mp3
      break;
    case 'change':
      res = changeMp3
      break;
    case 'push':
      res = pushMp3
      break;
    case 'pass':
      res = passMp3
      break;
    case 'fangkuai':
      res = fangkuaiMp3
      break;
    case 'meihua':
      res = meihuaMp3
      break;
    case 'hongtao':
      res = hongtaoMp3
      break;
    case 'heitao':
      res = heitaoMp3
      break;
    default:
      res = testMp3
      
  }
  if(!!num){
    state.audioItemDemo_1.src = res
    state.audioItemDemo_1.play()
  }else{
    state.audioItemDemo_2.src = res
    state.audioItemDemo_2.play()
  }
  res = null
  
}