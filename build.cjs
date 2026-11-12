'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),base=__dirname,read=p=>fs.readFileSync(path.join(base,p),'utf8');
const safe=s=>s.replace(/<\/script/gi,'<\\/script');
const excel=read('node_modules/exceljs/dist/exceljs.min.js'),three=read('node_modules/three/build/three.min.js');
const licenses='\n/*\n'+read('node_modules/exceljs/LICENSE').replace(/\*\//g,'* /')+'\n'+read('node_modules/three/LICENSE').replace(/\*\//g,'* /')+'\n*/';
const code=['core.js','excel.js','migration.js','engine.js','admin.js','app.js'].map(file=>read(file).replace('__ADMIN_VERIFIER__',read('admin-verifier.json'))).join('\n');new vm.Script(code);const html=read('shell.html').replace('__STYLE__',read('style.css')).replace('__LIBRARIES__',()=>safe(excel+'\n'+three+licenses)).replace('__APPLICATION__',()=>safe(code));
fs.writeFileSync(path.join(base,'index.html'),html);if(process.env.DASHBOARD_OUTPUT_DIR){const out=path.resolve(process.env.DASHBOARD_OUTPUT_DIR);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html);}console.log(JSON.stringify({bytes:Buffer.byteLength(html),version:'legal-w12-5.1',offlineLibraries:true}));
