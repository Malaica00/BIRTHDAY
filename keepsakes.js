'use strict';
// Small line illustrations share the same ink and proportions as the invitation.
const birthdayDrawings={
 cherries:'<path d="M29 12c-1 10-8 12-13 22m13-22c0 12 8 13 13 24M28 15c7-10 15-9 18-6-4 7-11 8-18 6Z"/><path d="M24 40c0 7-5 12-11 11S3 43 5 37s11-8 16-3m12 5c0 7 5 12 11 11s10-8 8-14-11-8-16-3"/><path d="m10 36-2 4m32-4-2 4"/>',
 bow:'<path d="M29 29C13 5 0 16 7 29c4 7 13 6 22 0Zm2 0C47 5 60 16 53 29c-4 7-13 6-22 0Z"/><path d="M27 29c-1 9-3 15-10 23l-1-9-8 2m25-16c1 9 3 15 10 23l1-9 8 2"/><ellipse cx="30" cy="29" rx="4" ry="5"/>',
 cake:'<path d="M10 31h40v18H10Zm-4 21h48M10 35q5 9 10 0 5 9 10 0 5 9 10 0 5 9 10 0M18 30v-9m12 9V17m12 13v-9"/><path d="M18 18c-7-6 1-10 0-14 7 7 6 11 0 14Zm12-4c-7-6 1-10 0-14 7 7 6 11 0 14Zm12 4c-7-6 1-10 0-14 7 7 6 11 0 14Z"/>',
 camera:'<rect x="6" y="18" width="48" height="33" rx="5"/><path d="m18 18 4-8h16l4 8M43 25h5"/><circle cx="29" cy="34" r="11"/><path d="M23 34a6 6 0 0 1 6-6"/>',
 letter:'<rect x="5" y="17" width="50" height="34" rx="2"/><path d="m5 19 25 19 25-19M5 51l18-18m32 18L37 33M30 12c-12-9-3-18 0-10 3-8 12 1 0 10Z"/>'
};
function illustration(kind,cls=''){const el=document.createElement('span');el.className='keepsake-illustration '+cls;el.setAttribute('aria-hidden','true');el.innerHTML=`<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${birthdayDrawings[kind]}</svg>`;return el;}
document.querySelectorAll('.scene:not(.collage-scene)').forEach(scene=>{const cake=scene.classList.contains('cake-scene'),gift=scene.classList.contains('gift-scene');scene.append(illustration(cake?'bow':gift?'letter':'cherries','ink-bottom'));});
