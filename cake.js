'use strict';
let finished=false;
let stream=null,context=null,micFrame=0,micPending=false,micGeneration=0;
function stopMicrophone(){
 micGeneration++;cancelAnimationFrame(micFrame);stream?.getTracks().forEach(track=>track.stop());stream=null;
 if(context){context.close().catch(()=>{});context=null;}
 micPending=false;
}
function extinguish(){
 if(finished||stage!=='cakeScene')return;
 finished=true;stopMicrophone();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 $('cakeInstructions').hidden=true;
 $('cakeScene').classList.add('candles-out');
 if(!reduced)$('cakeScene').classList.add('wish-in-progress');
 function revealWish(){
  $('cakeScene').classList.remove('wish-in-progress');
  $('wishHeading').hidden=true;
  $('cakeImage').alt='Birthday cake with the candles blown out';
  $('birthdayHeading').hidden=false;
  $('wishMessage').hidden=false;
  celebrate();
  $('announcement').textContent='Happy Birthday AAFRHA! May your wish find its way to you.';
  setTimeout(()=>{$('nextGift').hidden=false;$('nextGift').focus({preventScroll:true});},reduced?0:1200);
 }
 if(reduced)revealWish();else setTimeout(revealWish,1400);
}
$('blowButton').addEventListener('click',extinguish);
function createBlowDetector(start){
 const samples=[];let ambient=.001,held=0,last=start;
 return (rms,now)=>{
  const elapsed=Math.min(80,Math.max(0,now-last));last=now;
  if(now-start<600){
   samples.push(rms);
   return {ready:false,level:0,triggered:false};
  }
  if(samples.length){
   samples.sort((a,b)=>a-b);
   ambient=samples[Math.floor((samples.length-1)*.1)];samples.length=0;
  }
  const threshold=Math.max(.0004,ambient*1.12+.00008);
  const active=rms>threshold;
  held=active?held+elapsed:Math.max(0,held-elapsed*.5);
  if(!active)ambient=ambient*.985+Math.min(rms,ambient)*.015;
  return {ready:true,level:Math.min(100,rms/threshold*85),triggered:held>=80};
 };
}
$('enableMic').addEventListener('click',async()=>{
 if(micPending||stream||finished)return;
 micPending=true;const generation=micGeneration;
 $('micStatus').textContent='Allow microphone access, then wait for the ready message.';$('enableMic').disabled=true;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('unavailable');
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)throw new Error('unavailable');
  const audioContext=new AudioContext();context=audioContext;
  audioContext.resume().catch(()=>{});
  const input=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
  if(generation!==micGeneration||finished||stage!=='cakeScene'){input.getTracks().forEach(track=>track.stop());return;}
  stream=input;
  await audioContext.resume();
  if(generation!==micGeneration||finished)return;
  micPending=false;const analyser=audioContext.createAnalyser();analyser.fftSize=2048;
  audioContext.createMediaStreamSource(stream).connect(analyser);
  const silentOutput=audioContext.createGain();silentOutput.gain.value=0;
  analyser.connect(silentOutput);silentOutput.connect(audioContext.destination);
  const data=new Float32Array(analyser.fftSize);
  const listenStarted=performance.now();
  const detect=createBlowDetector(listenStarted);
  let lastSound=listenStarted;
  $('micStatus').textContent='One quiet moment... getting ready.';$('breathMeter').hidden=false;$('enableMic').hidden=true;
  function listen(now){
   if(!stream||finished||generation!==micGeneration)return;
   analyser.getFloatTimeDomainData(data);
   const rms=Math.sqrt(data.reduce((sum,v)=>sum+v*v,0)/data.length);
   const breath=detect(rms,now);
   $('breathLevel').style.width=breath.level+'%';
   if(rms>.0001)lastSound=now;
   if(breath.ready)$('micStatus').textContent=now-lastSound>3000?'No sound reaching the microphone. Check your input or tap below.':now-listenStarted>5000?'Listening. Try a short puff close to your microphone.':'Ready! Blow gently near your microphone.';
   if(breath.triggered){extinguish();return;}
   micFrame=requestAnimationFrame(listen);
  }
  micFrame=requestAnimationFrame(listen);
 }catch(error){
  if(generation!==micGeneration)return;
  stopMicrophone();$('breathMeter').hidden=true;$('enableMic').hidden=false;$('enableMic').disabled=false;
  $('micStatus').textContent=error.name==='NotAllowedError'?'Microphone blocked. Allow access in your browser, then try again or tap below.':!window.isSecureContext?'Microphone needs HTTPS or localhost. Tap below to make your wish.':'Microphone unavailable. Try again or tap below to make your wish.';
 }
});
$('nextGift').addEventListener('click',()=>{stopMicrophone();window.location.assign('gift.html');});

window.addEventListener('pagehide',stopMicrophone);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(stream||micPending)){stopMicrophone();$('enableMic').hidden=false;$('enableMic').disabled=false;$('breathMeter').hidden=true;$('micStatus').textContent='tap to enable your microphone again';}});

const cakeArt=document.querySelector('.cake-art');
[[43.2,22.5],[57.3,22.5]].forEach(([x,y],index)=>{
 for(const type of ['candle-flame','candle-smoke']){
  const part=document.createElement('span');part.className=type;part.setAttribute('aria-hidden','true');
  part.style.setProperty('--left',x+'%');part.style.setProperty('--top',y+'%');
  part.style.setProperty('--out-delay',(index*350)+'ms');
  part.style.setProperty('--smoke-delay',(450+index*350)+'ms');
  cakeArt.append(part);
 }
});
