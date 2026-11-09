const fs=require('fs'),cp=require('child_process');
const root=process.cwd();
const child=cp.spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-sandbox','--remote-debugging-port=9227','--user-data-dir='+root+'/.reference-scrapbook/browser-profile','about:blank'],{windowsHide:true,stdio:'ignore'});
(async()=>{
 let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:9227/json')).json();break;}catch{await new Promise(r=>setTimeout(r,200));}}
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const callbacks=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const c=callbacks.get(m.id);callbacks.delete(m.id);m.error?c.reject(m.error):c.resolve(m.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;callbacks.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await call('Page.navigate',{url:'file:///'+root.replaceAll('\\','/')+'/Scrapbook.html'});
 await call('Runtime.evaluate',{expression:"new Promise(resolve=>{const poll=()=>{if(typeof leaves!=='undefined'&&leaves.length===8&&document.querySelector('.zine-cover'))resolve(true);else setTimeout(poll,100);};poll();})",awaitPromise:true});
 await call('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});
 await new Promise(r=>setTimeout(r,300));
 for(const page of [0,1,2,3,4,5,6,7]){
 await call('Runtime.evaluate',{expression:'turn('+page+')',awaitPromise:true});
 const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(root+'/.reference-scrapbook/mobile-'+page+'.png',Buffer.from(shot.data,'base64'));
 }
 const report=await call('Runtime.evaluate',{expression:`JSON.stringify({viewport:innerWidth,width:document.body.clientWidth,count:leaves.length,age:/twenty|\\b23\\b|years old/i.test(pages.textContent),images:[...pages.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)})`,returnByValue:true});console.log(report.result.value);
 await call('Runtime.evaluate',{expression:'closeBook()',awaitPromise:true});
 console.log('Restart:',(await call('Runtime.evaluate',{expression:'flippedCount',returnByValue:true})).result.value);
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,300));
 const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(root+'/.reference-scrapbook/desktop.png',Buffer.from(shot.data,'base64'));
 await call('Browser.close');ws.close();
})().catch(e=>{console.error(e);child.kill();process.exitCode=1;});
