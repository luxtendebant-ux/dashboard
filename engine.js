(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./revforge-w12.cjs'));else root.W12=factory(root.RevforgeW12);})(typeof globalThis!=='undefined'?globalThis:this,function(R){
'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*x*(x*(x*6-15)+10);
/* Software projection uses the very same meshes and instance matrices as WebGL. */
function softwareRenderer(T,canvas){
 const ctx=canvas.getContext?.('2d'),point=new T.Vector3(),normal=new T.Vector3(),center=new T.Vector3(),temp=new T.Vector3(),matrix=new T.Matrix4(),world=new T.Matrix4(),light=new T.Vector3(-.5,.8,.6).normalize(),color=new T.Color(),instanceColor=new T.Color();
 function render(scene,camera){if(!ctx)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const faces=[];
  scene.traverseVisible(o=>{if(!o.isMesh||Array.isArray(o.material)||o.material.opacity<.03)return;const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,index=g.index,m=o.material,count=o.isInstancedMesh?o.count:1;
   for(let instance=0;instance<count;instance++){if(o.isInstancedMesh){o.getMatrixAt(instance,matrix);world.multiplyMatrices(o.matrixWorld,matrix);if(o.instanceColor)o.getColorAt(instance,instanceColor);else instanceColor.setHex(0xffffff);}else{world.copy(o.matrixWorld);instanceColor.setHex(0xffffff);}const nm=new T.Matrix3().getNormalMatrix(world);
    for(let i=0;i<(index?index.count:p.count);i+=3){const points=[];normal.set(0,0,0);center.set(0,0,0);let depth=0,skip=false;for(let j=0;j<3;j++){const k=index?index.getX(i+j):i+j;point.fromBufferAttribute(p,k).applyMatrix4(world);center.add(point);point.project(camera);if(point.z>1||point.z< -1)skip=true;points.push([(point.x*.5+.5)*w,(-point.y*.5+.5)*h]);depth+=point.z;if(n)normal.add(temp.fromBufferAttribute(n,k).applyMatrix3(nm));}if(skip)continue;normal.normalize();temp.copy(camera.position).sub(center.multiplyScalar(1/3));if(normal.dot(temp)<0&&m.side!==T.DoubleSide)continue;color.copy(m.color).multiply(instanceColor).multiplyScalar(m.isMeshBasicMaterial?1:.54+.46*Math.max(0,normal.dot(light)));faces.push({points,depth,color:'#'+color.getHexString(),alpha:m.opacity});}
   }
  });faces.sort((a,b)=>b.depth-a.depth);for(const f of faces){ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.beginPath();ctx.moveTo(...f.points[0]);ctx.lineTo(...f.points[1]);ctx.lineTo(...f.points[2]);ctx.closePath();ctx.fill();}ctx.globalAlpha=1;
 }
 return {setSize(w,h){if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}},render};
}
function createViewport(){
 let engine=null,host=null,canvas=null,frame=0,last=0,phase=0,shown=0,startup=0,flowPhase=0,lastPaint=0,state={progress:0,ready:false,paused:false,speed:1,cutaway:true},drag=null,orbit=-.7,pitch=.38,zoom=1,mode='unavailable',stage='assembly',observer=null;
 function init(){if(canvas)return;canvas=document.createElement('canvas');if(typeof THREE!=='undefined'){
  const T=THREE,scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,80);let renderer,software=false;try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;mode='webgl';}catch{canvas=document.createElement('canvas');renderer=softwareRenderer(T,canvas);mode='software';software=true;}
  const assembly=R.model(T,software);scene.add(assembly.root);scene.add(new T.HemisphereLight(0xf4f0db,0x254a35,3.1));for(const [x,y,z,color,power]of [[-5,7,5,0xffe6bd,4.5],[5,3,-3,0xb5e2cd,3.8],[2,4,6,0xe4eddb,2]]){const l=new T.DirectionalLight(color,power);l.position.set(x,y,z);scene.add(l);}if(!software){const faces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'#d5dfcf');g.addColorStop(.45,i===2?'#f4f1da':'#8caa95');g.addColorStop(1,'#294738');x.fillStyle=g;x.fillRect(0,0,64,64);x.fillStyle='#f5f1dc';x.fillRect(i%2?10:40,6,9,48);return c;});const environment=new T.CubeTexture(faces);environment.needsUpdate=true;scene.environment=environment;}engine={renderer,scene,camera,assembly};
 }
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','W12 Revforge: 12 поршней, клапаны, замкнутый цепной привод, топливный бак, насос, фильтр, рампы и форсунки');if(canvas.style)canvas.style.touchAction='pan-y';
 canvas.addEventListener?.('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,orbit,pitch};canvas.setPointerCapture?.(e.pointerId);});canvas.addEventListener?.('pointermove',e=>{if(!drag)return;orbit=drag.orbit+(e.clientX-drag.x)*.007;pitch=Math.max(-.1,Math.min(.95,drag.pitch+(e.clientY-drag.y)*.004));schedule();});canvas.addEventListener?.('pointerup',()=>drag=null);canvas.addEventListener?.('pointercancel',()=>drag=null);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(tick);}
 function tick(t){frame=0;if(!host?.isConnected){last=0;return;}const dt=last?Math.min(.075,Math.max(0,(t-last)/1000)):0;last=t;shown+=(clamp(state.progress)-shown)*(1-Math.exp(-dt*3));if(Math.abs(shown-state.progress)<.001)shown=clamp(state.progress);
  const assembled=shown===1&&state.ready;if(!assembled){startup=0;stage='assembly';}else if(!state.paused){startup+=dt;stage=startup<.8?'priming':startup<2?'cranking':'running';}else stage='paused';const rotating=assembled&&!state.paused&&startup>=.8;
  if(rotating)phase+=dt*state.speed*(1+4*ease(clamp((startup-.8)/1.2)));if(assembled&&!state.paused)flowPhase+=dt*(stage==='priming'?2:4);
  const w=Math.max(260,host.clientWidth||640),h=Math.max(260,host.clientHeight||440);if(engine&&(mode==='webgl'||t-lastPaint>=90||!lastPaint)){
   const {renderer,camera,scene,assembly}=engine;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const r=assembly.radius*(w/h<1.1?3.6:2.55)*zoom,c=assembly.center;camera.position.set(c.x+Math.sin(orbit)*r,c.y+Math.sin(pitch)*r*.82,c.z+Math.cos(orbit)*r);camera.lookAt(c);assembly.animate(phase,rotating,shown,state.cutaway,{fueling:assembled&&!state.paused,flowPhase,cranking:stage==='cranking'});renderer.render(scene,camera);lastPaint=t;
  }
  host.dataset.engineMode=mode;host.dataset.engineStage=stage;const label=host.querySelector('[data-engine-status]'),index=Math.min(5,Math.floor(shown*6));if(label)label.textContent=mode==='unavailable'?'Не удалось загрузить трёхмерную модель':stage==='running'?'W12 работает · 12 цилиндров':stage==='cranking'?'Стартер → вращение коленвала → зажигание':stage==='priming'?'Насос → фильтр → рампы · заполнение магистрали':stage==='paused'?'Пауза · механизм остановлен':shown===1?'Узлы установлены · ожидается приёмка общей задачи':(engine?.assembly.parts[index]?.name||'Подготовка сборки')+' · '+Math.round(state.progress*100)+'%';
  if((assembled&&!state.paused)||Math.abs(shown-state.progress)>.0001)schedule();
 }
 function bind(target,next){state={...state,...next};if(!target)return;init();if(host!==target){observer?.disconnect();host=target;host.append(canvas);if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(schedule);observer.observe(host);}last=0;lastPaint=0;}schedule();}
 function view(name){orbit=name==='front'?0:name==='side'?-Math.PI/2:-.7;pitch=name==='front'?.12:name==='side'?.2:.38;zoom=1;lastPaint=0;schedule();}
 return {bind,view,refresh(){lastPaint=0;schedule();},get info(){return {mode,phase,shown,ready:state.ready,stage,startup,source:R.provenance};}};
}
return {...R,createViewport,softwareRenderer};
});
