'use strict';
const vinylButton=document.getElementById('record');
const vinylArtwork=vinylButton.querySelector('img');
vinylArtwork.src='assets/vinly.png?v=2';
vinylArtwork.alt='A black vinyl record with silver stars and a red centre label';
const birthdayMusic=document.getElementById('birthdayMusic');
birthdayMusic.volume=.65;
let vinylStarting=false;
function updateVinyl(playing){vinylButton.classList.toggle('is-spinning',playing);vinylButton.setAttribute('aria-pressed',String(playing));vinylButton.setAttribute('aria-label',playing?'Pause birthday music':'Play birthday music');vinylButton.title=playing?'Pause birthday music':'Play birthday music';const label=document.getElementById('playLabel');if(label)label.textContent=playing?'PAUSE ?':'PLAY ?';const help=document.getElementById('musicHelp');if(help)help.textContent=playing?'Now playing ? Birthday music-box edition':'Tap the record to play. Tap again to pause.';}
vinylButton.addEventListener('click',async()=>{
 if(vinylStarting)return;
 if(!birthdayMusic.paused){birthdayMusic.pause();return;}
 vinylStarting=true;
 try{await birthdayMusic.play();}
 catch{updateVinyl(false);document.getElementById('announcement').textContent='Music could not play. Tap the record to try again.';}
 finally{vinylStarting=false;}
});
birthdayMusic.addEventListener('play',()=>{updateVinyl(true);document.getElementById('announcement').textContent='Playing a birthday music-box tune. Tap the record again to pause.';});
birthdayMusic.addEventListener('pause',()=>{updateVinyl(false);document.getElementById('announcement').textContent='Birthday music paused.';});
birthdayMusic.addEventListener('error',()=>{updateVinyl(false);document.getElementById('announcement').textContent='The birthday music could not load. Tap the record to try again.';});
window.addEventListener('pagehide',()=>birthdayMusic.pause());
document.addEventListener('visibilitychange',()=>{if(document.hidden)birthdayMusic.pause();});
