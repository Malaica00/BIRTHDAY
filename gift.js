'use strict';
let opening=false;
function unwrap(){
 if(opening||stage!=='giftScene')return;
 opening=true;$('present').disabled=true;$('unwrap').disabled=true;
 $('giftScene').classList.add('unwrapping');
 setTimeout(()=>{showScene('collageScene');celebrate();$('announcement').textContent='Surprise! Tap the camera to print a film strip, or the memory book to open your scrapbook.';},matchMedia('(prefers-reduced-motion: reduce)').matches?0:750);
}
$('present').addEventListener('click',unwrap);$('unwrap').addEventListener('click',unwrap);
const letterDialog=$('note');
let letterTrigger=null,letterAnimationFrame;
function openBirthdayLetter(event){
 if(letterDialog.open)return;
 letterTrigger=event.currentTarget;
 letterDialog.classList.remove('is-open');letterDialog.showModal();
 letterAnimationFrame=requestAnimationFrame(()=>requestAnimationFrame(()=>{if(letterDialog.open)letterDialog.classList.add('is-open');}));
 $('announcement').textContent='Your envelope opens with a personal birthday letter and your photo.';
}
$('envelope').addEventListener('click',openBirthdayLetter);
letterDialog.addEventListener('close',()=>{cancelAnimationFrame(letterAnimationFrame);letterDialog.classList.remove('is-open');letterTrigger?.focus({preventScroll:true});});
[['disco','is-spinning'],['cat','is-dancing']].forEach(([id,cls])=>$(id).addEventListener('click',()=>{$(id).classList.toggle(cls);$(id).setAttribute('aria-pressed',String($(id).classList.contains(cls)));}));
$('love').addEventListener('click',openBirthdayLetter);$('closeNote').addEventListener('click',()=>$('note').close());
$('note').addEventListener('click',event=>{if(event.target===$('note')){const r=$('note').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('note').close();}});
const cameraDialog = $('cameraDialog');
const cameraMemories=window.birthdayMemories;
let cameraMemoryIndex=0;
const filmPhotos=cameraMemories.map((memory,index)=>{
 const photo=document.createElement('img');photo.className='printed-memory printed-memory-'+index;
 photo.alt='Photo memory '+(index+1)+' in your instant-camera strip';
 document.querySelector('.film-paper').append(photo);return photo;
});
const filmPaper=document.querySelector('.film-paper');
const filmRepeats=filmPhotos.map(photo=>{
 const repeat=photo.cloneNode();repeat.alt='';repeat.setAttribute('aria-hidden','true');filmPaper.append(repeat);return repeat;
});
function setFilmSpeed(){
 if(!cameraDialog.open)return;
 const distance=filmPhotos.length*(filmPhotos[0].getBoundingClientRect().height+12);
 filmPaper.style.setProperty('--film-duration',(distance/12)+'s');
}
new ResizeObserver(setFilmSpeed).observe(document.querySelector('.print-window'));
$('camera').addEventListener('click',()=>{
 if(cameraDialog.open)return;
 filmPhotos.forEach((photo,index)=>{photo.src=cameraMemories[(cameraMemoryIndex+index)%cameraMemories.length];});
 filmRepeats.forEach((photo,index)=>{photo.src=filmPhotos[index].src;});
 cameraMemoryIndex=(cameraMemoryIndex+3)%cameraMemories.length;
 document.querySelector('.print-window').scrollTop=0;
 cameraDialog.showModal();
 setFilmSpeed();
 $('announcement').textContent='Your camera is printing a little strip of memories.';
});
$('closeCamera').addEventListener('click',()=>cameraDialog.close());
cameraDialog.addEventListener('click',event=>{
 if(event.target!==cameraDialog)return;
 const r=cameraDialog.getBoundingClientRect();
 if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)cameraDialog.close();
});
cameraDialog.addEventListener('close',()=>$('camera').focus({preventScroll:true}));
