'use strict';
const sources = window.birthdayMemories;
let current = 0;
let busy = false;
let leaves = [];
let flippedCount = 0;
const pages = document.getElementById('pages');
const book = document.getElementById('book');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const photo = (n, cls = '') => `<div class="photo ${cls}"><img src="${sources[n % sources.length]}" alt="Scrapbook memory ${n + 1}" draggable="false"></div>`;
const image = n => `<img src="${sources[n % sources.length]}" alt="Scrapbook memory ${n + 1}" draggable="false">`;
function render(){
 const frame=(n,cls)=>`<figure class="zine-photo ${cls}">${image(n)}<span class="paper-tape" aria-hidden="true"></span></figure>`;
 const head=text=>`<header>${text}</header>`;
 const foot=n=>`<footer><span>AAFRHA / WITH LOVE</span><span>${String(n).padStart(2,'0')}</span></footer>`;
 const spread=(cls,kicker,title,quote,a,b,n)=>`<section class="page zine-page ${cls}" aria-label="${title}">${head(kicker)}<h2>${title}</h2><p class="zine-quote">&ldquo;${quote}&rdquo;</p><div class="torn-swatch" aria-hidden="true"></div>${frame(a,'photo-one')}${frame(b,'photo-two')}<span class="zine-spark" aria-hidden="true">&#10035;</span>${foot(n)}</section>`;
 const content=[
  `<section class="page zine-page zine-cover" aria-label="AAFRHA, a birthday zine">${head('A BIRTHDAY ZINE / ONE COPY ONLY')}<div class="cover-title-paper"><h1>AAFRHA</h1><p>in every version.</p></div><span class="cover-stamp">FOR YOU</span>${frame(13,'cover-photo')}<p class="cover-quote">&ldquo;I&rsquo;d choose you in every version of growing up.&rdquo;</p><span class="zine-spark" aria-hidden="true">&#10035;</span>${foot(1)}</section>`,
  spread('zine-burgundy','01 / SIDE A','In on the joke.','Half the fun is knowing I only have<br>to look at you.',3,10,2),
  spread('zine-cream','02 / SIDE B','The good days.','Sometimes a good day is just a whole<br>afternoon with nowhere else to be.',2,5,3),
  spread('zine-blush','03 / NO FILTER','Fully ourselves.','I love that we can be a little too much<br>and still have room for more.',4,6,4),
  spread('zine-cream zine-small','04 / THE IN-BETWEEN','The small stuff.','The best part of having you around is<br>how little it takes to make a day good.',7,1,5),
  spread('zine-red','05 / A NEW CHAPTER','Room to grow.','I hope you take up every bit of space<br>you used to apologise for.',8,12,6),
  spread('zine-cream zine-bonus','06 / BONUS TRACK','More of this.','May we always have something to look<br>forward to and something to laugh about.',9,11,7),
  `<section class="page zine-page zine-finale" aria-label="Happy birthday, AAFRHA">${head('07 / KEEP THIS ONE')}${frame(0,'final-photo')}<div class="final-letter"><h2>Happy birthday, AAFRHA.</h2><p>&ldquo;Whatever this new chapter brings,<br>I&rsquo;m so glad I get to hear all about it.&rdquo;</p><span>Love, Gayatri</span><i aria-hidden="true">&#10035;</i></div>${foot(8)}</section>`
 ];
 const template=document.createElement('template');template.innerHTML=content.join('');
 leaves=[...template.content.children].map((sheet,i)=>{
  sheet.dataset.pageIndex=i;sheet.classList.add('leaf-front');
  const leaf=document.createElement('div');leaf.className='book-leaf';
  const reverse=document.createElement('div');reverse.className='page leaf-back page-verso';reverse.setAttribute('aria-hidden','true');
  leaf.append(sheet,reverse);return leaf;
 });
 pages.replaceChildren(...leaves);flippedCount=Math.min(flippedCount,leaves.length-1);
 buildDots();layoutBook();update();
}
const stage = document.createElement('div');stage.className='book-stage';
book.before(stage);stage.append(book);
function layoutBook(){
 const width=Math.max(140,Math.min(440,stage.clientWidth-20,(window.innerHeight-180)*.75));
 book.style.setProperty('--leaf-width',width+'px');book.style.setProperty('--leaf-height',(width/.75)+'px');
 book.style.setProperty('--book-scale',1);book.style.setProperty('--book-shift','0px');
 book.classList.remove('is-spread');book.classList.toggle('is-back-cover',flippedCount===leaves.length-1);
}
function update(){
  leaves.forEach((leaf,i)=>{
    const flipped=i<flippedCount;
    leaf.classList.toggle('is-flipped',flipped);
    leaf.style.setProperty('--leaf-depth',((flipped?i:leaves.length-i)*.4)+'px');
    if(!leaf.classList.contains('is-moving'))leaf.style.zIndex=flipped?i+1:leaves.length-i;
  });
  const visible=[flippedCount];
  current=visible[0];
  pages.querySelectorAll('.leaf-front').forEach(page=>page.setAttribute('aria-hidden',String(!visible.includes(Number(page.dataset.pageIndex)))));
  previous.disabled=busy||flippedCount===0;next.disabled=busy;
  next.setAttribute('aria-label',flippedCount===leaves.length-1?'Close and restart scrapbook':'Turn to the next page');
  document.getElementById('counter').textContent=visible.map(i=>String(i+1).padStart(2,'0')).join(' / ')+' of '+String(leaves.length).padStart(2,'0');
  document.querySelectorAll('.dots button').forEach((dot,i)=>{
    dot.classList.toggle('active',i===flippedCount);dot.disabled=busy;
    dot.setAttribute('aria-current',i===flippedCount?'page':'false');
  });
  book.setAttribute('aria-label',flippedCount===0?'Scrapbook front cover. Tap to open.':flippedCount===leaves.length-1?'Scrapbook back cover. Tap to close and start again.':'Open scrapbook. Tap or swipe to turn the page.');
  document.querySelector('.hint').textContent=flippedCount===0?'tap the cover to open':flippedCount===leaves.length-1?'tap to close and start again':'tap to turn, or swipe left and right';
  layoutBook();
}
function animateLeaf(index,flipped){
  const leaf=leaves[index];
  leaf.classList.add('is-moving');leaf.style.zIndex=100+index;
  leaf.classList.toggle('is-flipped',flipped);
  return new Promise(resolve=>{
    let timer;
    function finish(){clearTimeout(timer);leaf.removeEventListener('transitionend',done);leaf.classList.remove('is-moving');resolve();}
    function done(event){if(event.target===leaf&&event.propertyName==='transform')finish();}
    leaf.addEventListener('transitionend',done);
    timer=setTimeout(finish,matchMedia('(prefers-reduced-motion: reduce)').matches?0:800);
  });
}
async function turn(target){
  if(busy||target<0||target>=leaves.length||target===flippedCount)return;
  busy=true;book.classList.add('is-turning');update();
  while(flippedCount!==target){
    const forward=target>flippedCount,index=forward?flippedCount:flippedCount-1;
    flippedCount+=forward?1:-1;layoutBook();
    await animateLeaf(index,forward);update();
  }
  busy=false;book.classList.remove('is-turning');update();
}
async function closeBook(){
  if(busy||!flippedCount)return;
  busy=true;book.classList.add('is-turning');update();
  const turns=[];
  for(let i=flippedCount-1;i>=0;i--){
    turns.push(animateLeaf(i,false));
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,85));
  }
  flippedCount=0;layoutBook();await Promise.all(turns);
  busy=false;book.classList.remove('is-turning');update();
}
function forward(){if(flippedCount===leaves.length-1)closeBook();else turn(flippedCount+1);}
previous.addEventListener('click',()=>turn(flippedCount-1));next.addEventListener('click',forward);
function buildDots(){
 document.getElementById('dots').innerHTML=Array.from({length:leaves.length},(_,i)=>'<button type="button" aria-label="'+(i===0?'Front cover':i===leaves.length-1?'Back cover':'Page '+(i+1))+'" data-page="'+i+'"></button>').join('');
}
document.getElementById('dots').addEventListener('click',event=>{const dot=event.target.closest('button');if(dot)turn(Number(dot.dataset.page));});
document.addEventListener('keydown',event=>{
  if(event.target.matches('input,textarea,select,button,a'))return;
  if(event.key==='ArrowRight'||((event.key==='Enter'||event.key===' ')&&event.target===book)){event.preventDefault();forward();}
  if(event.key==='ArrowLeft'){event.preventDefault();turn(flippedCount-1);}
});
let pointerStart=null,suppressClick=false;
book.addEventListener('pointerdown',event=>{if(busy||event.button!==0)return;pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};book.setPointerCapture(event.pointerId);});
book.addEventListener('pointerup',event=>{
  if(!pointerStart)return;
  const start=pointerStart;pointerStart=null;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.3){
    suppressClick=true;if(dx<0)forward();else turn(flippedCount-1);
    setTimeout(()=>suppressClick=false,0);
  }
});
book.addEventListener('pointercancel',()=>pointerStart=null);
book.addEventListener('click',()=>{if(!suppressClick)forward();});
let lastStageWidth=0;
new ResizeObserver(()=>{if(lastStageWidth!==stage.clientWidth){lastStageWidth=stage.clientWidth;layoutBook();}}).observe(stage);
window.addEventListener('resize',layoutBook);
render();
