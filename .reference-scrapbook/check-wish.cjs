const fs=require('fs'),cp=require('child_process');
const root=process.cwd();
const child=cp.spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-sandbox','--remote-debugging-port=9227','--user-data-dir='+root+'/.reference-scrapbook/browser-profile','about:blank'],{windowsHide:true,stdio:'ignore'});
(async()=>{
 let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:9227/json')).json();break;}catch{await new Promise(r=>setTimeout(r,200));}}
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const callbacks=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const c=callbacks.get(m.id);callbacks.delete(m.id);m.error?c.reject(m.error):c.resolve(m.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;callbacks.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await call('Page.navigate',{url:'file:///'+root.replaceAll('\\','/')+'/cake.html'});

 await call('Runtime.evaluate',{expression:"new Promise(resolve=>{const poll=()=>{if(document.getElementById('blowButton')&&document.querySelectorAll('.candle-flame').length===2)resolve(true);else setTimeout(poll,100);};poll();})",awaitPromise:true});
 await call('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});
 await call('Runtime.evaluate',{expression:"document.getElementById('blowButton').click();document.getElementById('blowButton').click()"});
 await new Promise(r=>setTimeout(r,600));
 let state=await call('Runtime.evaluate',{expression:"JSON.stringify({dim:getComputedStyle(document.querySelector('.wish-dimmer')).opacity,flames:[...document.querySelectorAll('.candle-flame')].map(f=>getComputedStyle(f).opacity),messageHidden:document.getElementById('wishMessage').hidden})",returnByValue:true});console.log('During:',state.result.value);
 let shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(root+'/.reference-scrapbook/wish-during.png',Buffer.from(shot.data,'base64'));
 await new Promise(r=>setTimeout(r,2200));
 state=await call('Runtime.evaluate',{expression:"JSON.stringify({dim:getComputedStyle(document.querySelector('.wish-dimmer')).opacity,flames:[...document.querySelectorAll('.candle-flame')].map(f=>getComputedStyle(f).opacity),message:document.getElementById('wishMessage').hidden===false,gift:document.getElementById('nextGift').hidden===false})",returnByValue:true});console.log('After:',state.result.value);
 shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(root+'/.reference-scrapbook/wish-after.png',Buffer.from(shot.data,'base64'));
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await call('Page.reload');await new Promise(r=>setTimeout(r,1600));
 state=await call('Runtime.evaluate',{expression:"extinguish();JSON.stringify({message:!document.getElementById('wishMessage').hidden,dim:getComputedStyle(document.querySelector('.wish-dimmer')).display})",returnByValue:true});console.log('Reduced motion:',state.result.value);
 await call('Browser.close');ws.close();
})().catch(e=>{console.error(e);child.kill();process.exitCode=1;});
