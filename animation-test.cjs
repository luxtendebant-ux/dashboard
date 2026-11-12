'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
async function main(){const {createCanvas}=require('@napi-rs/canvas'),frames=new Map(),label={textContent:''},host={isConnected:true,clientWidth:760,clientHeight:440,dataset:{},append(){},querySelector(){return label;}};let frame=0,time=0,canvas;
const context={Math,console,window:{devicePixelRatio:1},document:{createElement(){canvas=createCanvas(760,440);canvas.setAttribute=()=>{};return canvas;}},requestAnimationFrame(fn){frames.set(++frame,fn);return frame;}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'engine.js'),'utf8')+';globalThis.viewport=W12.createViewport();',context);const v=context.viewport,results=[];
function tick(n){for(let i=0;i<n;i++){time+=1000/30;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));}}
function test(name,fn){try{fn();results.push({name,passed:true});}catch(e){results.push({name,passed:false,error:e.message});}}
test('Engine parts assemble progressively without premature rotation',()=>{v.bind(host,{progress:.5,ready:false,paused:false});tick(90);assert(v.info.shown>.49&&v.info.shown<=.5);assert.equal(v.info.phase,0);});
test('Engine actually rotates after assembly and acceptance',()=>{v.bind(host,{progress:1,ready:true,paused:false,speed:1});tick(150);assert.equal(v.info.shown,1);assert(v.info.phase>1);assert(label.textContent.includes('работает'));});
test('Pause freezes phase and increased speed changes motion',()=>{v.bind(host,{paused:true});const frozen=v.info.phase;tick(30);assert.equal(v.info.phase,frozen);v.bind(host,{paused:false,speed:2});tick(30);assert(v.info.phase-frozen>5.5);});
test('Full assembly without final acceptance keeps engine stopped',()=>{v.bind(host,{progress:1,ready:false});const phase=v.info.phase;tick(30);assert.equal(v.info.phase,phase);assert(canvas.toBuffer('image/png').length>1000);});
return {results,passed:results.filter(x=>x.passed).length,total:results.length,type:'controlled animation frames in real Canvas 2D fallback; not browser WebGL'};}
module.exports=main;if(require.main===module)main().then(r=>{console.log(JSON.stringify(r,null,2));if(r.passed!==r.total)process.exitCode=1;});
