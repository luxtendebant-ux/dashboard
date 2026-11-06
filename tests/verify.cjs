const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const resultDir=require('node:path').join(__dirname,'../work/test-results');fs.mkdirSync(resultDir,{recursive:true});
const values=new Map();
function boot(){const events={},blobs=[];const el={innerHTML:'',textContent:'',inert:false,isConnected:true,style:{},dataset:{},classList:{contains:()=>false,add(){},remove(){},toggle(){}},querySelectorAll:()=>[],querySelector:()=>el,insertAdjacentHTML(){},setAttribute(){},append(){},remove(){},click(){},focus(){}};const ctx={console,structuredClone,crypto:crypto.webcrypto,TextEncoder,Intl,Date,Blob,matchMedia:()=>({matches:false}),setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},URL:{createObjectURL:b=>{blobs.push(b);return 'blob:test'},revokeObjectURL(){}},document:{body:el,getElementById:()=>el,querySelector:()=>el,querySelectorAll:()=>[],createElement:()=>({...el}),addEventListener:(n,f)=>(events[n]??=[]).push(f)},window:{scrollTo(){},addEventListener:(n,f)=>(events[n]??=[]).push(f)}};vm.createContext(ctx);vm.runInContext(code,ctx);return {run:s=>vm.runInContext(s,ctx),events,blobs};}
let app=boot(),count=0;const run=s=>app.run(s);function ok(s,msg){assert(run(s),msg);count++;}function fail(s,re){assert.throws(()=>run(s),re);count++;}
(async()=>{ok('validState(S)&&S.tasks.length===13','initial');
const before=run('S.tasks.length');fail("deleteTaskRecord('t9')",/модератор/);ok('S.tasks.length===13','unauthorized deletion has no effect');
ok("PASSWORD_VERIFIER.iterations===210000 && !('password' in PASSWORD_VERIFIER)",'no plaintext password');
assert.equal(await run("passwordMatches('deliberately-wrong-password')"),false);count++;
run("const personId=addPersonRecord('Алексей <Новый> / 任意名','Любая роль');editPersonRecord('anna','Новое имя Винсента','Новая роль');");
ok("S.people.length===6&&person(personId).name==='Алексей <Новый> / 任意名'",'arbitrary staff name');
fail("addPersonRecord('  ')",/имя/);
run("const projectId=createProjectRecord({name:'JSON и хранение',goal:'Проверить сохранение',due:'2026-11-13'});const payload={title:'Первая задача',description:'Полное заполнение',owner:personId,project:projectId,start:'2026-11-06',due:'2026-11-09',checks:[{text:'Проверить документы'}]};const one=createTaskRecord(payload);const two=createTaskRecord({...payload,title:'Вторая задача',depends:[one]});");
fail("updateTaskRecord(two,{stage:'work'})",/предшествующие/);run("updateTaskRecord(one,{stage:'work'});setCheck(one,0,true);updateTaskRecord(one,{result:'Результат и основания',stage:'review'});updateTaskRecord(one,{stage:'done'});updateTaskRecord(two,{stage:'work'});addComment(two,'Комментарий <b>как текст</b>');");
ok("requireTask(two).comments.length===1",'comment stored');
run("V3.moderator=true;deleteTaskRecord(one)");ok('!S.tasks.some(t=>t.id===one)&&requireTask(two).depends.length===0&&validState(S)','delete completed predecessor, detach dependent');
ok("S.activity[0].text.includes('удалил')",'deletion audit');
run("const file=projectFile(projectId);const fileText=JSON.stringify(file);const parsed=parseFileObject(JSON.parse(fileText));const copyId=importProjectCopy(parsed.state);");
ok("project(copyId).name.includes('(импорт)')&&S.tasks.filter(t=>t.project===copyId).length===1",'project import');
ok("S.tasks.find(t=>t.project===copyId).comments[0].text===requireTask(two).comments[0].text",'project comments retained');
ok("new Set(S.tasks.map(t=>t.id)).size===S.tasks.length",'new ids on import');
ok("!JSON.stringify(workspaceFile()).includes(PASSWORD_VERIFIER.hash)&&!('moderator' in workspaceFile().workspace)",'auth not exported');
run("U.page='team';U.project=projectId;save()");
ok("JSON.parse(localStorage.getItem(KEY)).people.some(p=>p.id===personId)&&!!localStorage.getItem(KEY+'-backup')",'primary and backup copies');
const known=JSON.parse(values.get('compliance-studio-v2'));app=boot();
ok("person('anna').name==='Новое имя Винсента'",'renamed built-in staff survives reload');
assert.deepEqual(JSON.parse(run('JSON.stringify(S.people)')),known.people);count++;
assert.deepEqual(JSON.parse(run('JSON.stringify(S.tasks)')),known.tasks);count++;
assert.deepEqual(JSON.parse(run('JSON.stringify(S.projects)')),known.projects);count++;
assert.deepEqual(JSON.parse(run('JSON.stringify(S.activity)')),known.activity);count++;
ok("!V3.moderator&&U.page==='team'",'moderator logs out; UI restored');
// Page-close and visibility hooks call the same synchronous persistence routine.
assert(app.events.pagehide?.length&&app.events.beforeunload?.length&&app.events.visibilitychange?.length);count++;
app.events.pagehide.forEach(f=>f());
const backup=values.get('compliance-studio-v2-backup');values.set('compliance-studio-v2','{broken');app=boot();
assert.deepEqual(JSON.parse(run('JSON.stringify(S.tasks)')),JSON.parse(backup).tasks);count++;
run("V3.moderator=true;const emptyProjectId=createProjectRecord({name:'Удаление всех',goal:'Тест',due:'2026-11-13'});const last=createTaskRecord({title:'Последняя',description:'',owner:S.people[0].id,project:emptyProjectId,start:'2026-11-06',due:'2026-11-06',checks:[{text:'Шаг'}]});deleteTaskRecord(last);U.project=emptyProjectId;");
ok('validState(S)&&!assemblyReadiness().all','empty project cannot start');
run("const bad=structuredClone(S);bad.tasks[0].due='2026-02-30'");ok('!validState(bad)','malformed import rejected');
// Remaining dependency links and custom staff survive a second project-file round trip.
run("const linkProject=createProjectRecord({name:'Связи JSON',goal:'Сохранить связи',due:'2026-11-13'});const payload={description:'',owner:S.people.find(p=>p.name==='Алексей <Новый> / 任意名').id,start:'2026-11-06',due:'2026-11-09',checks:[{text:'Шаг'}]};const a=createTaskRecord({...payload,project:linkProject,title:'A'});const b=createTaskRecord({...payload,project:linkProject,title:'B',depends:[a]});const linkCopy=importProjectCopy(projectFile(linkProject).workspace);const imported=S.tasks.filter(t=>t.project===linkCopy);");
ok('imported.length===2&&imported[1].depends[0]===imported[0].id','dependencies remapped');
ok("person(imported[0].owner).name==='Алексей <Новый> / 任意名'",'custom names in project file');
// Complete isolated scenario with automatic persistence kept on.
const disk=values.get('compliance-studio-v2');const draftBackup=JSON.stringify({savedDraft:'must survive demonstration'});values.set('compliance-studio-v2-drafts',draftBackup);run('startDemo()');let steps=0;while(run('V2.demo.index<V2.demo.steps.length&&V2.demo.playing')&&steps++<100)run('nextDemo()');ok('assemblyReadiness().all&&V2.pumpRunning&&V2.demo.logs.every(l=>l.result===\'OK\')','full demonstration');assert.equal(values.get('compliance-studio-v2'),disk);count++;assert.equal(values.get('compliance-studio-v2-drafts'),draftBackup);count++;run('exitDemo()');
for(let i=0;i<=720;i++){const m=run('mechanism('+i+'*Math.PI/180)');assert(Math.abs(m.rodLength-178)<1e-8);assert(Math.abs(m.beamLength-134)<1e-8);}count++;
assert(html.includes('data-oil-route')&&html.includes('getPointAtLength')&&html.includes('M118 385V333'));count++;
fs.writeFileSync(require('node:path').join(resultDir,'project-fixture.json'),run('JSON.stringify(projectFile(linkProject),null,2)'));
fs.writeFileSync(require('node:path').join(resultDir,'results.json'),JSON.stringify({passed:count,scenarioSteps:steps,geometrySamples:721,at:new Date().toISOString()},null,2));console.log('PASS',count,'checks;',steps,'scenario commands; 721 geometry samples; persistence, staff, deletion and JSON round trips.');})();
