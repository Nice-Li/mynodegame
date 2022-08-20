
  let timer = null;
  let audioContext = window.AudioContext || window.webkitAudioContext 
  let ctx = new audioContext()

  function getNum(count){
    let start = 440;
    if(count === 34){
      return start
    }
    
    if(count > 34){
      return start * Math.pow(Math.pow(2, 1/12), count - 34) 
    }
    if(count < 34){
      return start / Math.pow(Math.pow(2, 1/12), Math.abs(count - 34))
    }
    
  }



  function getNoise(ctx, val, time = 1, long = 1){
 
    let o = ctx.createOscillator()
    let g = ctx.createGain()
  
    o.connect(g);
    o.type = 'sine'
    o.frequency.value = val
  
    g.connect(ctx.destination)
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01)
  
    o.start()
  
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + long)
  
    o.stop(ctx.currentTime + time + long)
  }
  
  
  function getFVAl(res, index = 0){
    clearTimeout(timer)
    if(index > res.length - 1){
      return
    }
    getNoise(ctx, res[index].val, res[index].time)

    timer = setTimeout(()=>{
      index ++
      getFVAl(res, index)
    }, res[index].time * 1000) 
  }

  export default function getMusic(opt){
    let res = null
    if(typeof opt !== "object" ){
      let v = getNum(opt)
      res = [
        {
          val:v,
          time:1
        }
      ]
    }else{
      res = opt.map((ele)=>{
        let v = getNum(ele.num)
        return {
          val:v, 
          time:ele.time
        }
      })
    }
    
    getFVAl(res)
  }









