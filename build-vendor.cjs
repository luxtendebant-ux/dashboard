'use strict';
const path=require('node:path'),fs=require('node:fs'),esbuild=require('esbuild'),base=__dirname,banner='/* Revforge adapted under MIT. Copyright (c) 2026 Wasabules. See vendor/revforge/LICENSE. */';
for(const [format,outfile]of [['iife','revforge-w12.js'],['cjs','revforge-w12.cjs']])esbuild.buildSync({entryPoints:[path.join(base,'revforge-entry.ts')],bundle:true,format,globalName:format==='iife'?'RevforgeW12':undefined,target:'es2020',minify:true,legalComments:'inline',banner:{js:banner},outfile:path.join(base,outfile)});
console.log(JSON.stringify({revforge:'c9c79647f7a0c849f961de53b50337777e3e727b',bytes:fs.statSync(path.join(base,'revforge-w12.js')).size}));
