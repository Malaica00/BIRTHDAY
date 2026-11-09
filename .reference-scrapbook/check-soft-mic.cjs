const fs=require('fs'),cp=require('child_process');
const root=process.cwd();
const child=cp.spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-sandbox','--remote-debugging-port=9227','--user-data-dir='+root+'/.reference-scrapbook/browser-profile','about:blank'],{windowsHide:true,stdio:'ignore'});
(async()=>{
 let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:9227/json')).json();break;}catch{await new Promise(r=>setTimeout(r,200));}}
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const callbacks=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const c=callbacks.get(m.id);callbacks.delete(m.id);m.error?c.reject(m.error):c.resolve(m.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;callbacks.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await call('Page.enable');
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`window.testRms=.001;window.trackStopped=false;Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>({getTracks:()=>[{stop:()=>window.trackStopped=true}]})}});window.AudioContext=class {constructor(){this.destination={};this.state='running';}async resume(){this.state='running';}async close(){this.state='closed';}createMediaStreamSource(){return {connect(){}};}createGain(){return {gain:{value:0},connect(){}};}createAnalyser(){return {fftSize:2048,connect(){},getFloatTimeDomainData(data){data.fill(window.testRms);}};}};`});
 await call('Page.navigate',{url:'file:///'+root.replaceAll('\\','/')+'/cake.html'});

 await call('Runtime.evaluate',{expression:"new Promise(resolve=>{const poll=()=>{if(document.getElementById('blowButton')&&document.querySelectorAll('.candle-flame').length===2)resolve(true);else setTimeout(poll,100);};poll();})",awaitPromise:true});
 await call('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});

 console.log('Mock active:',(await call('Runtime.evaluate',{expression:'window.testRms',returnByValue:true})).result.value);
 await call('Runtime.evaluate',{expression:"document.getElementById('enableMic').click()"});
 await new Promise(r=>setTimeout(r,1400));
 let state=await call('Runtime.evaluate',{expression:"JSON.stringify({quietDidNotTrigger:!finished,ready:document.getElementById('micStatus').textContent,buttonHidden:document.getElementById('enableMic').hidden})",returnByValue:true});console.log('Before blow:',state.result.value);
 await call('Runtime.evaluate',{expression:'window.testRms=.0014'});
 await new Promise(r=>setTimeout(r,1800));
 state=await call('Runtime.evaluate',{expression:"JSON.stringify({triggered:finished,trackStopped:window.trackStopped,messageVisible:!document.getElementById('wishMessage').hidden})",returnByValue:true});console.log('After gentle blow:',state.result.value);
 await call('Browser.close');ws.close();
})().catch(e=>{console.error(e);child.kill();process.exitCode=1;});
