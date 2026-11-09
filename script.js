const gift = document.getElementById('gift');
const replay = document.getElementById('replay');
const collage = document.getElementById('collage');
const announcement = document.getElementById('announcement');
const confetti = document.getElementById('confetti');
document.getElementById('enjoyGift').addEventListener('click', () => gift.click());
let opened = false;
let cleanupTimer;

document.querySelectorAll('.piece').forEach((piece, i) => {
  piece.style.setProperty('--i', i);
  piece.style.setProperty('--from-x', `${(3 - i) * 35}px`);
  piece.style.setProperty('--from-y', `${i < 3 ? 200 : -70}px`);
});

function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#c7392d', '#d8b65b', '#77977b', '#e4a7b5', '#7e91ab'];
  confetti.replaceChildren();
  for (let i = 0; i < 115; i++) {
    const bit = document.createElement('i');
    bit.className = 'confetto';
    bit.style.setProperty('--c', colors[i % colors.length]);
    bit.style.setProperty('--x', `${(Math.random() - .5) * innerWidth * 1.3}px`);
    bit.style.setProperty('--y', `${(Math.random() - .25) * innerHeight * 1.2}px`);
    bit.style.setProperty('--r', `${Math.random() * 1000 - 500}deg`);
    bit.style.borderRadius = i % 3 === 0 ? '50%' : '0';
    confetti.appendChild(bit);
  }
  clearTimeout(cleanupTimer);
  cleanupTimer = setTimeout(() => confetti.replaceChildren(), 3300);
}

gift.addEventListener('click', () => {
  if (opened) return;
  opened = true;
  document.body.classList.add('opening');
  gift.disabled = true;
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1700;
  setTimeout(() => {
  document.body.classList.remove('opening');
  document.body.classList.add('opened');
  collage.setAttribute('aria-hidden', 'false');
  announcement.textContent = 'Surprise! Happy birthday! Here’s to more life, more love, and more cake.';
  celebrate();
  camera.focus({ preventScroll: true });
  }, delay);
});

replay?.addEventListener('click', () => {
  resetStickers();
  opened = false;
  document.body.classList.remove('opened', 'opening');
  gift.disabled = false;
  collage.setAttribute('aria-hidden', 'true');
  announcement.textContent = 'Your present is wrapped again. Open it for another surprise!';
  confetti.replaceChildren();
  gift.focus({ preventScroll: true });
});

const cake = document.querySelector('.cake');
const cat = document.querySelector('.cat');
const disco = document.querySelector('.disco');
const camera = document.querySelector('.camera');
const photoDialog = document.getElementById('photoDialog');
const photoStack = document.getElementById('photoStack');

// Flame positions follow the candle tips in the supplied cake image.
[[25.5,8],[32.5,8],[38,5],[40.5,2],[46.5,3],[50,0],[57,4],[59.5,7],[64.5,7],[71,6],[76.5,6]].forEach(([x,y],i) => {
  const flame = document.createElement('span');
  flame.className = 'flame';
  flame.setAttribute('aria-hidden','true');
  flame.style.setProperty('--fx', `${x}%`);
  flame.style.setProperty('--fy', `${y}%`);
  flame.style.setProperty('--delay', `${i * -0.13}s`);
  cake.appendChild(flame);
});

function toggleSticker(button, className, on, off) {
  const active = button.classList.toggle(className);
  button.setAttribute('aria-pressed', String(active));
  announcement.textContent = active ? on : off;
}
cake.addEventListener('click', () => toggleSticker(cake, 'is-lit', 'Make a wish! The birthday candles are glowing.', 'The candles are out. Tap the cake to light them again.'));
cat.addEventListener('click', () => toggleSticker(cat, 'is-dancing', 'The party cat is dancing!', 'The party cat has stopped dancing.'));
disco.addEventListener('click', () => toggleSticker(disco, 'is-spinning', 'The disco ball is spinning!', 'The disco ball has stopped spinning.'));

// Use the supplied birthday artwork as snapshots; replace these sources with personal photos whenever desired.
const snapshots = [
  {src:'assets/cat.png', caption:'party animal', tilt:'-12deg'},
  {src:'assets/love.png', caption:'all the love', tilt:'3deg'},
  {src:'assets/cake.png', caption:'a sweet little wish', tilt:'13deg'},
  {src:'assets/disco.png', caption:'dance all night', tilt:'-8deg'},
  {src:'assets/birthday.png', caption:'your kind of day', tilt:'6deg'},
  {src:'assets/camera.png', caption:'keep the memories', tilt:'-6deg'},
  {src:'assets/gift-transparent.png', caption:'just for you', tilt:'9deg'}
];
let scrapbookLayer = 10;
const personalPhotos = [];
function makeMovable(frame) {
  let drag;
  const clamp = (n, max) => Math.max(0, Math.min(n, max));
  function place(x,y) {
    frame.style.left = `${clamp(x, photoStack.clientWidth - frame.offsetWidth)}px`;
    frame.style.top = `${clamp(y, photoStack.clientHeight - frame.offsetHeight)}px`;
  }
  frame.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    frame.focus({preventScroll:true});
    frame.style.zIndex = ++scrapbookLayer;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,left:frame.offsetLeft,top:frame.offsetTop};
    frame.setPointerCapture(event.pointerId);
    frame.classList.add('dragging');
  });
  frame.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    place(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y);
  });
  function finish() {drag = null; frame.classList.remove('dragging');}
  frame.addEventListener('pointerup', finish);
  frame.addEventListener('pointercancel', finish);
  frame.addEventListener('lostpointercapture', finish);
  frame.addEventListener('keydown', event => {
    const steps = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if (!steps[event.key]) return;
    event.preventDefault();
    const [x,y] = steps[event.key];
    const distance = event.shiftKey ? 25 : 10;
    frame.style.zIndex = ++scrapbookLayer;
    place(frame.offsetLeft + x*distance, frame.offsetTop + y*distance);
  });
}
function renderScrapbook() {
  photoStack.replaceChildren();
  scrapbookLayer = 10;
  const photos = personalPhotos.length ? personalPhotos : snapshots;
  photos.forEach((photo,i) => {
    const frame = document.createElement('figure');
    frame.className = 'snapshot';
    frame.tabIndex = 0;
    frame.setAttribute('role','group');
    frame.setAttribute('aria-label', `${photo.caption}. Drag to move, or use the arrow keys.`);
    const layouts = [
      {x:11,y:23,w:38,h:27,r:-15},
      {x:47,y:22,w:38,h:27,r:10},
      {x:5,y:43,w:38,h:27,r:13},
      {x:57,y:42,w:38,h:27,r:-12},
      {x:14,y:61,w:38,h:27,r:-9},
      {x:49,y:61,w:38,h:27,r:12},
      {x:31,y:41,w:38,h:27,r:-5}
    ];
    const layout = layouts[i % layouts.length];
    frame.style.left = `${layout.x}%`;
    frame.style.top = `${layout.y}%`;
    frame.style.width = `${layout.w}%`;
    frame.style.height = `${layout.h}%`;
    frame.style.setProperty('--tilt', `${layout.r}deg`);
    frame.style.zIndex = i + 1;
    frame.style.setProperty('--delay', `${i * .14}s`);
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.caption;
    image.draggable = false;
    const caption = document.createElement('figcaption');
    caption.textContent = photo.caption;
    frame.append(image, caption);
    photoStack.appendChild(frame);
    makeMovable(frame);
  });
}
camera.addEventListener('click', () => {
  renderScrapbook();
  photoDialog.showModal();
});
document.getElementById('scrapbookUpload').addEventListener('change', event => {
  const files = [...event.target.files].filter(file => file.type.startsWith('image/')).slice(0,12);
  if (!files.length) return;
  personalPhotos.forEach(photo => URL.revokeObjectURL(photo.src));
  personalPhotos.splice(0, personalPhotos.length, ...files.map((file,i) => ({
    src:URL.createObjectURL(file), caption:`Memory ${i+1}`
  })));
  photoStack.classList.add('has-personal-photos');
  renderScrapbook();
  event.target.value = '';
});
document.getElementById('closePhotos').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', event => {
  const rect = photoDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) photoDialog.close();
});
photoDialog.addEventListener('close', () => camera.focus({preventScroll:true}));

function resetStickers() {
  [cake,cat,disco].forEach(button => {
    button.classList.remove('is-lit','is-dancing','is-spinning');
    button.setAttribute('aria-pressed','false');
  });
  if (photoDialog.open) photoDialog.close();
}
