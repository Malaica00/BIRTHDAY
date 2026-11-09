'use strict';
const order = [0,1,2,3,4,5,6,7,8];
let selected = null;
let puzzleSolved = false;
const board = $('puzzle');
// Every shared edge is generated once and traced in reverse by its neighbour.
function edge(x,y,dx,dy,tab) {
 const point=(t,n=0)=>`${x+dx*t-dy/Math.hypot(dx,dy)*n},${y+dy*t+dx/Math.hypot(dx,dy)*n}`;
 if(!tab)return [`L ${point(1)}`];
 return [`L ${point(.35)}`,`C ${point(.46)} ${point(.38,tab*13)} ${point(.5,tab*13)}`,`C ${point(.62,tab*13)} ${point(.54)} ${point(.65)}`,`L ${point(1)}`];
}
function piecePath(index){
 const col=index%3,row=Math.floor(index/3),x=col*100,y=row*75;
 const vertical=(r,c)=>(r+c)%2?1:-1;
 const horizontal=(r,c)=>(r+c)%2?-1:1;
 return [`M ${x},${y}`,
 ...edge(x,y,100,0,row?horizontal(row-1,col):0),
 ...edge(x+100,y,0,75,col<2?vertical(row,col):0),
 ...edge(x+100,y+75,-100,0,row<2?-horizontal(row,col):0),
 ...edge(x,y+75,0,-75,col?-vertical(row,col-1):0),'Z'].join(' ');
}
function drawPuzzle() {
 const scale=board.clientWidth/300;
 const scaleY=board.dataset.fitSlot==='true'?board.parentElement.clientHeight/225:scale;
 board.style.height=(225*scaleY)+'px';
 board.replaceChildren(...order.map((piece,index)=>{
  const button=document.createElement('button');button.className='puzzle-piece';button.type='button';
  const x=index%3*100,y=Math.floor(index/3)*75,path=piecePath(index),pad=15;
  button.dataset.index=index;
  button.style.cssText=`left:${(x-pad)*scale}px;top:${(y-pad)*scaleY}px;width:${130*scale}px;height:${105*scaleY}px;`;
  // Use the same silhouette for hit testing so tabs respond to touch too.
  const outline=[];
  let cursor;
  for(const segment of path.matchAll(/([MLC])\s*([^MLCZ]+)/g)){
   const points=[...segment[2].matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(p=>[Number(p[1]),Number(p[2])]);
   if(segment[1]==='C'){
    const start=cursor;
    for(let step=1;step<=16;step++){
     const t=step/16,u=1-t;
     outline.push([0,1].map(axis=>u*u*u*start[axis]+3*u*u*t*points[0][axis]+3*u*t*t*points[1][axis]+t*t*t*points[2][axis]));
    }
   }else outline.push(points[0]);
   cursor=points.at(-1);
  }
  button.style.setProperty('--piece-outline','polygon('+outline.map(([px,py])=>((px-x+pad)/130*100)+'% '+((py-y+pad)/105*100)+'%').join(',')+')');
  // Paint the photo directly on the piece; SVG only draws its seam.
  // This avoids the browser's anonymous button layout shifting SVG images.
  button.style.backgroundImage="url('assets/Puzzle.jpeg')";
  button.style.backgroundSize=(300/130*100)+'% '+(225/105*100)+'%';
  button.style.backgroundPosition=((piece%3*100-pad)/(300-130)*100)+'% '+((Math.floor(piece/3)*75-pad)/(225-105)*100)+'%';
  button.innerHTML=`<svg viewBox="${x-pad} ${y-pad} 130 105" preserveAspectRatio="none" aria-hidden="true"><path class="piece-seam" d="${path}"/></svg>`;

  button.setAttribute('aria-label',`Position ${index+1}, photo piece ${piece+1}. Select to swap.`);
  button.setAttribute('aria-pressed',String(index===selected));
  button.classList.toggle('selected',index===selected);button.classList.toggle('correct',piece===index);
  return button;
 }));
}
function swap(a,b) {
 if(puzzleSolved)return;
 [order[a],order[b]]=[order[b],order[a]];selected=null;drawPuzzle();
 if(order.every((piece,i)=>piece===i)) {
  puzzleSolved=true;board.classList.add('solved');$('puzzleHint').textContent='you did it! a little wish is on its way�';
  $('announcement').textContent='Puzzle solved! Make a wish and blow out your candles.';
  setTimeout(()=>window.location.assign('cake.html'),1000);
 }
}
board.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||puzzleSolved)return;
 const index=Number(button.dataset.index);
 if(selected===null){selected=index;drawPuzzle();board.children[index].focus({preventScroll:true});}
 else if(selected===index){selected=null;drawPuzzle();board.children[index].focus({preventScroll:true});}
 else{swap(selected,index);board.children[index].focus({preventScroll:true});}
});
let drag=null,ignoreClick=false;
board.addEventListener('pointerdown',event=>{
 const tile=event.target.closest('button');if(!tile||puzzleSolved||event.button!==0)return;
 event.preventDefault();
 tile.focus({preventScroll:true});
 drag={index:Number(tile.dataset.index),x:event.clientX,y:event.clientY,id:event.pointerId};tile.setPointerCapture(event.pointerId);
});
board.addEventListener('pointerup',event=>{
 if(!drag)return;const start=drag;drag=null;
 if(Math.hypot(event.clientX-start.x,event.clientY-start.y)<12)return;
 const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.puzzle-piece');
 if(target&&board.contains(target)){swap(start.index,Number(target.dataset.index));ignoreClick=true;setTimeout(()=>ignoreClick=false,0);}
});
board.addEventListener('click',event=>{if(ignoreClick){event.stopImmediatePropagation();event.preventDefault();}},true);
board.addEventListener('pointercancel',()=>{drag=null;});
drawPuzzle();

const shuffleButton=document.getElementById('shufflePuzzle');
shuffleButton.addEventListener('click',()=>{
 if(puzzleSolved)return;
 for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 if(order.every((piece,index)=>piece===index))[order[0],order[1]]=[order[1],order[0]];
 selected=null;drawPuzzle();
 shuffleButton.textContent='Shuffle again';
 $('puzzleHint').textContent='Tap two pieces to swap, or drag them into place';
 $('announcement').textContent='Pieces shuffled. Put the photo back together.';
});

// Resize only when the available width changes; clicks never change geometry.
let puzzleWidth=board.clientWidth;
new ResizeObserver(()=>{
 const width=board.clientWidth;
 if(width===puzzleWidth)return;
 puzzleWidth=width;drawPuzzle();
}).observe(board);
