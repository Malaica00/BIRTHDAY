'use strict';
(() => {
 const intro=document.getElementById('scratchIntro');
 const canvas=document.getElementById('scratchCanvas');
 const story=document.getElementById('story');
 const context=canvas.getContext('2d',{willReadFrequently:true});
 let drawing=false,finished=false,last=null,distance=0;
 document.body.classList.add('scratch-puzzle-page');
 const slot=document.getElementById('scratchPuzzleSlot');
 const puzzle=document.getElementById('puzzle');
 slot.append(puzzle);
 puzzle.dataset.fitSlot='true';
 const controls=document.getElementById('scratchPuzzleControls');
 controls.append(document.getElementById('shufflePuzzle'),document.getElementById('puzzleHint'));
 const preview=document.querySelector('.preview-button');if(preview)controls.append(preview);
 intro.append(document.getElementById('announcement'));
 puzzle.inert=true;controls.hidden=true;
 document.getElementById('shufflePuzzle').click();
 drawPuzzle();
 new ResizeObserver(()=>drawPuzzle()).observe(slot);
 story.inert=true;
 const keepsakes=document.querySelector('.keepsakes');
 if(keepsakes)keepsakes.inert=true;
 const ratio=Math.min(window.devicePixelRatio||1,2);
 // Keep the scratch surface at a stable resolution, independent of window resizing.
 canvas.width=800*ratio;canvas.height=600*ratio;
 function paintBirthday(){
  if(finished||drawing||distance>0)return;
  context.globalCompositeOperation='source-over';
  context.clearRect(0,0,canvas.width,canvas.height);
  context.fillStyle='#3e131b';context.fillRect(0,0,canvas.width,canvas.height);
  // Scalloped stamp edge, cut out of the scratchable coating.
  context.globalCompositeOperation='destination-out';
  const step=64*ratio,radius=18*ratio;
  for(let x=step/2;x<canvas.width;x+=step){for(const y of [0,canvas.height]){context.beginPath();context.arc(x,y,radius,0,Math.PI*2);context.fill();}}
  for(let y=step/2;y<canvas.height;y+=step){for(const x of [0,canvas.width]){context.beginPath();context.arc(x,y,radius,0,Math.PI*2);context.fill();}}
  context.globalCompositeOperation='source-over';
  context.fillStyle='#fff3d6';context.textAlign='center';context.textBaseline='middle';
  const family='"Birthday Script", "Kunstler Script", "Great Vibes", cursive';
  function lettering(text,size,cx,cy,maxWidth){
   context.font=(size*ratio)+'px '+family;
   let metrics=context.measureText(text);
   const inkWidth=metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight;
   if(inkWidth>canvas.width*maxWidth){
    context.font=(size*ratio*canvas.width*maxWidth/inkWidth)+'px '+family;
    metrics=context.measureText(text);
   }
   const offset=(metrics.actualBoundingBoxLeft-metrics.actualBoundingBoxRight)/2;
   context.fillText(text,canvas.width*cx+offset,canvas.height*cy);
  }
  lettering('Its',180,.38,.25,.7);
  lettering('your',158,.56,.47,.72);
  lettering('Birthday!!!',186,.5,.76,.9);
 }
 paintBirthday();
 document.fonts.load('100px "Birthday Script"').then(paintBirthday);
 function reveal(){
  if(finished)return;
  finished=true;drawing=false;
  canvas.style.opacity='0';
  document.getElementById('scratchInstruction').textContent='Solve the puzzle to make your birthday wish.';
  document.querySelector('.scratch-eyebrow').hidden=false;
  canvas.style.pointerEvents='none';
  puzzle.inert=false;controls.hidden=true;
  document.body.classList.remove('scratch-pending');
  canvas.hidden=true;
  puzzle.children[0].focus({preventScroll:true});
 }
 function point(event){const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)/rect.width*canvas.width,y:(event.clientY-rect.top)/rect.height*canvas.height};}
 function scratch(event){
  if(!drawing||finished)return;
  const next=point(event),radius=canvas.width*.065;
  context.globalCompositeOperation='destination-out';
  context.lineWidth=radius*2;context.lineCap='round';context.lineJoin='round';
  context.beginPath();context.moveTo(last.x,last.y);context.lineTo(next.x,next.y);context.stroke();
  context.beginPath();context.arc(next.x,next.y,radius,0,Math.PI*2);context.fill();
  distance+=Math.hypot(next.x-last.x,next.y-last.y);last=next;
  if(distance<canvas.width*.15)return;
  distance=0;
  const data=context.getImageData(0,0,canvas.width,canvas.height).data;
  let clear=0,total=0;
  for(let i=3;i<data.length;i+=64){total++;if(data[i]<100)clear++;}
  if(clear/total>.42)reveal();
 }
 canvas.addEventListener('pointerdown',event=>{
  if(finished||event.button!==0)return;
  event.preventDefault();drawing=true;last=point(event);canvas.setPointerCapture(event.pointerId);scratch(event);
 });
 canvas.addEventListener('pointermove',scratch);
 canvas.addEventListener('pointerup',()=>{drawing=false;last=null;});
 canvas.addEventListener('pointercancel',()=>{drawing=false;last=null;});
})();
