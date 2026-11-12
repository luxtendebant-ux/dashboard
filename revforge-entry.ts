/* Revforge W12 integration. Upstream MIT Copyright (c) 2026 Wasabules.
 * Source: https://github.com/Wasabules/revforge/tree/c9c79647f7a0c849f961de53b50337777e3e727b
 * Adaptation: task-based assembly, closed fuel circuit and dashboard palette. */
import {engineLayout,EnginePose,bankToFront,DEG} from './vendor/revforge/engineLayout';
import {EngineScene} from './vendor/revforge/engineScene';
const config:any={cylinders:12,layout:'w',displacementCc:5998,boreMm:84,redlineRpm:6000,fuel:'petrol',aspiration:'natural',airFilter:'stock',camshaft:'dohc',camDurationDeg:240,camLiftMm:10.08,camLsaDeg:110,boxFlywheel:'single_mass'};
export const layout=engineLayout(config),rodLength=layout.rod,radius=layout.crank,banks=[...new Set(layout.cylinders.map(c=>c.betaDeg*DEG))].sort((a,b)=>a-b);
const solved=new EnginePose(layout);
export function cylinder(phase:number,i:number){solved.solve(phase/DEG);const c=layout.cylinders[i];return {beta:c.betaDeg*DEG,bank:c.bank,pinIndex:i,z:c.z,cycle:solved.theta[i]*DEG,crank:{x:solved.pinX[i],y:solved.pinY[i],z:c.z},piston:{x:solved.wristX[i],y:solved.wristY[i],z:c.z},flame:0};}
export const provenance={name:'Revforge',author:'Wasabules',license:'MIT',commit:'c9c79647f7a0c849f961de53b50337777e3e727b',url:'https://github.com/Wasabules/revforge'};
export function model(T:any,software=false){
 const scene=new T.Scene(),surface=(p:any)=>new T.MeshStandardMaterial(p),materials:any={};
 for(const [key,color,metalness,roughness]of [['steel',0xaebbb3,.9,.24],['forged',0x64756b,.86,.32],['casting',0x194936,.55,.43],['alloy',0xd1dacf,.8,.28],['rubber',0x17251d,.1,.8],['brass',0xc9a768,.8,.3],['accent',0x89b79e,.55,.3]]as any[])materials[key]=surface({color,metalness,roughness});
 materials.ghost=surface({color:0xa0c8ae,metalness:.1,roughness:.3,transparent:true,opacity:.065,depthWrite:false,side:T.DoubleSide});materials.light=new T.MeshBasicMaterial({color:0xffffff});
 const stage:any={THREE:T,scene,materials,surface,software},source:any=new EngineScene(stage,layout),pose=new EnginePose(layout),root=new T.Group(),machine=new T.Group();root.add(machine);scene.remove(source.root);machine.add(source.root);
 const titles=['Коленвал, маховик и опоры','12 поршней, кольца и шатуны','Головки, клапаны, распредвалы и ГРМ','Коллекторы и навесное оборудование','Топливный контур: бак, насос, фильтр, 12 форсунок','Гильзы и крышки · проверка соединений'],offsets=[[0,0,360],[0,310,0],[0,320,0],[0,260,0],[-410,0,0],[0,280,0]],parts=titles.map((name,i)=>{const group=new T.Group();group.name=name;source.root.add(group);return {name,group,offset:new T.Vector3(...offsets[i])};});
 const d=source.d,assignment=new Map<any,number>();assignment.set(source.crankGroup,0);for(const k of ['pistons','rings','pins','rods'])assignment.set(d[k],1);for(const k of ['valvesIn','valvesEx','springs','retainers','buckets','rockers','lifters','pushrods','chain','gas','flame','spark','spray','jets'])if(d[k])assignment.set(d[k],2);for(const c of source.cams)assignment.set(c,2);
 for(const n of [...source.root.children]){if(parts.some(p=>p.group===n))continue;const isGlass=n.material===materials.ghost||n.isLineSegments;parts[assignment.get(n)??(isGlass?5:3)].group.add(n);}
 const fuel=parts[4].group,nodes:any={},edges:any[]=[],flow:any[]=[];
 const fuelMat=surface({color:0xb6cfb0,metalness:.45,roughness:.28,transparent:true,opacity:.65}),fittingMat=materials.brass;
 function mesh(g:any,m:any,p:any){const n=new T.Mesh(g,m);n.position.set(...p);fuel.add(n);return n;}
 function cyl(r:number,h:number,p:any,m:any,axis='y'){const n=mesh(new T.CylinderGeometry(r,r,h,16),m,p);if(axis==='z')n.rotation.x=Math.PI/2;return n;}
 function node(id:string,p:any,type='joint'){nodes[id]={id,position:p,type};return id;}
 function edge(a:string,b:string,via:any[]=[],internal=false){const points=[nodes[a].position,...via,nodes[b].position],curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');edges.push({from:a,to:b,curve,internal});if(!internal){const n=new T.Mesh(new T.TubeGeometry(curve,Math.max(12,points.length*8),2.3,8,false),fuelMat);fuel.add(n);}return curve;}
 const bounds=new T.Box3().setFromObject(source.root),tankX=bounds.min.x-100,tankY=-45,z=layout.frontZ*.65;
 mesh(new T.BoxGeometry(65,66,100),materials.casting,[tankX,tankY,z]);mesh(new T.BoxGeometry(69,4,104),materials.alloy,[tankX,tankY+35,z]);cyl(8,6,[tankX,tankY+40,z+20],fittingMat);cyl(11,34,[tankX+47,tankY,z],materials.brass,'z');cyl(12,42,[tankX+47,tankY+78,z],materials.alloy);for(const y of [tankY+56,tankY+100])cyl(14,4,[tankX+47,y,z],materials.forged);
 node('tank',[tankX+32.5,tankY,z],'tank');node('pump-in',[tankX+47,tankY,z+17],'pump');node('pump-out',[tankX+47,tankY,z-17],'pump');node('filter-in',[tankX+47,tankY+56,z],'filter');node('filter-out',[tankX+47,tankY+100,z],'filter');edge('tank','pump-in',[[tankX+43,tankY,z+17]]);edge('pump-in','pump-out',[],true);edge('pump-out','filter-in',[[tankX+64,tankY+15,z-17],[tankX+64,tankY+49,z]]);edge('filter-in','filter-out',[],true);
 const injectorPoints=layout.cylinders.map(c=>{const side=c.intakeSide,p=[0,0];bankToFront(p,c.betaDeg,c.offset+side*84*.42+Math.sin(side*1.05)*84*.63,layout.deck+84*.06+Math.cos(1.05)*84*.63);return [p[0],p[1],c.z];});
 const topY=Math.max(...injectorPoints.map(p=>p[1]))+26,frontZ=Math.max(...injectorPoints.map(p=>p[2]))+55;
 node('split',[tankX+63,topY,frontZ]);const supply=edge('filter-out','split',[[tankX+47,topY-40,z],[tankX+47,topY,frontZ-20]]);
 for(const side of [0,1]){const cs=layout.cylinders.filter(c=>c.bank===side).sort((a,b)=>b.z-a.z),x=side===0?-70:70;node('rail'+side,[x,topY,frontZ],'rail');edge('split','rail'+side,[[x,topY+18,frontZ+10]]);let prev='rail'+side;for(const c of cs){const id='joint'+c.index;node(id,[x,topY,c.z]);edge(prev,id);prev=id;node('injector'+c.index,injectorPoints[c.index],'injector');edge(id,'injector'+c.index,[[injectorPoints[c.index][0],topY-8,c.z]]);}node('cap'+side,[x,topY,cs.at(-1)!.z-30],'cap');edge(prev,'cap'+side);}
 for(const n of Object.values(nodes)as any[])mesh(new T.SphereGeometry(n.type==='cap'?3.5:3,8,6),fittingMat,n.position);
 for(let i=0;i<12;i++){const n=mesh(new T.SphereGeometry(2.6,8,6),new T.MeshBasicMaterial({color:0xf1d491}),[0,0,0]);n.userData.curve=i<6?supply:edges.find(e=>e.to==='injector'+(i-6)*2).curve;flow.push(n);}
 /* A permanent mounting deck makes the incoming components legible. */
 const stand=new T.Mesh(new T.BoxGeometry(bounds.max.x-tankX+130,9,layout.frontZ-layout.rearZ+170),materials.casting);stand.position.set((bounds.max.x+tankX)/2,-layout.crank-layout.bore*.95,(layout.frontZ+layout.rearZ)/2);machine.add(stand);
 machine.scale.setScalar(.006);const theme:any={cool:'#8dbfa7',lineStrong:'#93b4a1'},motion:any={clutchTorque:0,load:.25,heat:.2,turbineAngle:0,turbine2Angle:0,chargerAngle:0,vane:0,vane2:0,gas:{net:{n:0,throttleShare:.25}},painter:{gasRgb(_t:any,k:number,_b:number,out:any){out[0]=k>800?231:123;out[1]=k>800?164:181;out[2]=k>800?70:159;}}};
 let oldPhase=0;
 function animate(phase:number,running:boolean,construction=1,cutaway=true,opts:any={}){
  const telemetry:any={rpm:running?720:0,cranking:!!opts.cranking,cut:!running,stalled:false},clock:any={cycle:((phase/(Math.PI*4))%1+1)%1,turns:phase/(Math.PI*4),rpm:running?720:0,load:.25,burning:running,reduced:false,heat:.2,turbineAngle:0};pose.update(clock,telemetry,null,false,Math.min(.05,Math.abs(phase-oldPhase)/5));oldPhase=phase;for(let i=0;i<12;i++){const cycle=pose.theta[i];pose.flame[i]=running&&cycle<85?Math.sin(cycle/85*Math.PI)*.85:0;pose.gasT[i]=cycle<180?1050-cycle*3:cycle>540?320+(cycle-540)*2:310;pose.gasBurnt[i]=cycle<360?1:0;}pose.gasLive=running;source.update(pose,motion,theme);
  for(let i=0;i<parts.length;i++){const t=Math.max(0,Math.min(1,construction*parts.length-i)),e=t*t*t*(t*(t*6-15)+10),p=parts[i];p.group.visible=t>0;p.group.position.copy(p.offset).multiplyScalar(1-e);p.group.userData.installed=t===1;}
  if(d.chain)d.chain.visible=construction>=.5;materials.ghost.opacity=cutaway?.055:.38;materials.ghost.depthWrite=false;for(const f of flow){f.visible=construction===1&&(running||opts.fueling===true);f.position.copy(f.userData.curve.getPointAt(((opts.flowPhase??phase)*.06+flow.indexOf(f)/6)%1));}
 }
 animate(0,false,1);root.updateMatrixWorld(true);const frame=new T.Box3().setFromObject(root),center=frame.getCenter(new T.Vector3()),size=frame.getSize(new T.Vector3());animate(0,false,0);
 return {root,parts,source,pose,layout,materials,pistons:Array.from({length:12},(_,i)=>({i,mesh:d.pistons})),rods:Array.from({length:12},(_,i)=>({i,mesh:d.rods})),flow,fuelNetwork:{nodes,edges},animate,center,radius:size.length()*.5};
}
