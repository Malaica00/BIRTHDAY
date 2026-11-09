'use strict';
const $ = id => document.getElementById(id);
const scenes = [...document.querySelectorAll('.scene')].map(scene=>scene.id);
let stage = document.querySelector('.scene.active').id;
function showScene(id) {
 stage = id;
 scenes.forEach(name => {$(name).hidden = name !== id; $(name).classList.toggle('active', name === id);});
 if (id === 'collageScene') {
  const origin = {x:$('story').clientWidth*.5,y:$('story').clientHeight*.55};
  document.querySelectorAll('#collageScene .sticker').forEach(sticker => {
   sticker.style.setProperty('--burst-x',`${origin.x-sticker.offsetLeft-sticker.offsetWidth/2}px`);
   sticker.style.setProperty('--burst-y',`${origin.y-sticker.offsetTop-sticker.offsetHeight/2}px`);
  });
 }
 if (id === 'collageScene') {
  $(id).tabIndex = -1;
  $(id).focus({preventScroll:true});
  return;
 }
 const focusTarget = $(id).querySelector('button,a');
 focusTarget?.focus({preventScroll:true});
}

let confettiCleanup;
function celebrate(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const container=$('confetti');if(!container)return;
 clearTimeout(confettiCleanup);
 const colors=['#d5ad62','#fff0c4','#a04252','#e4c585','#8f293e','#f4dfab'];
 const fragment=document.createDocumentFragment();
 const count=innerWidth<600?300:440;
 for(let i=0;i<count;i++){
  const bit=document.createElement('i');
  const kind=['foil','sparkle','foil','star','glitter','foil'][i%6];bit.className='confetto '+kind;
  bit.style.setProperty('--color',colors[i%colors.length]);
  bit.style.left=(Math.random()*100)+'%';
  bit.style.setProperty('--size',(kind==='glitter'?2+Math.random()*3:5+Math.random()*8)+'px');
  bit.style.setProperty('--x',((Math.random()-.5)*260)+'px');
  bit.style.setProperty('--y',(innerHeight+100)+'px');
  bit.style.setProperty('--r',((Math.random()-.5)*1600)+'deg');
  bit.style.setProperty('--delay',(Math.floor(i/(count/3))*1.15+Math.random()*.8)+'s');
  bit.style.setProperty('--duration',(3.2+Math.random()*2.2)+'s');fragment.append(bit);
 }
 container.replaceChildren(fragment);
 confettiCleanup=setTimeout(()=>container.replaceChildren(),9000);
}
