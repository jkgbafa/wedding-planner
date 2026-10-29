import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import ts from 'typescript';
const tmp=mkdtempSync(new URL('../.test-runtime-',import.meta.url).pathname);
try {
 const validation=readFileSync('src/lib/validation.ts','utf8');
 writeFileSync(tmp+'/validation.mjs',ts.transpileModule(validation,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 const migrations=readFileSync('src/lib/migrations.ts','utf8');
 writeFileSync(tmp+'/migrations.mjs',ts.transpileModule(migrations,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 const initial=readFileSync('src/lib/initial-board.json','utf8');
 const source=readFileSync('src/lib/local-store.ts','utf8').replace("import initial from './initial-board.json';",'const initial='+initial+';').replace("'./validation'","'./validation.mjs'").replace("'./migrations'","'./migrations.mjs'");
 writeFileSync(tmp+'/store.mjs',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 const {localRequest:request}=await import(tmp+'/store.mjs');
 const start=await (await request('/api/board')).json();
 assert.equal(start.board.items.length,100);assert.equal(start.board.items[0].title,'‼️ Wedding cake payment');
 const board=structuredClone(start.board);board.items[0].title='Persistence verification';
 const put=(b,v)=>request('/api/board',{method:'PUT',body:JSON.stringify({board:b,version:v})});
 assert.equal((await put(board,start.version)).status,200);
 const saved=await (await request('/api/board')).json();
 assert.equal(saved.board.items[0].title,'Persistence verification');assert.equal(saved.version,start.version+1);
 assert.equal((await put(start.board,start.version)).status,409);
 const bad=structuredClone(board);bad.items[0].paid=-1;assert.equal((await put(bad,saved.version)).status,400);
 const form=new FormData();form.set('file',new File(['wedding source'],'source.md',{type:'text/markdown'}));
 const upload=await request('/api/files',{method:'POST',body:form});assert.equal(upload.status,200);
 const {id}=await upload.json();assert.equal(await (await request('/api/files?id='+id)).text(),'wedding source');
 const files=await(await request('/api/files')).json();assert.equal(files.length,1);assert.equal(files[0].blob,undefined);
 // A browser saved before the corrections gets them once, keeping its own edits.
 const {applyMigrations}=await import(tmp+'/migrations.mjs');
 const old={items:[{id:'item-003',title:'Reception food · Capitol',owner:'Joshua'},{id:'item-024',title:'x',owner:'Joshua'},{id:'item-030',title:'Stickers',owner:'Lucia'},{id:'item-090',title:'Fans',owner:'Lucia'},{id:'item-056',title:'Joint',owner:'Joshua & Lucia'},{id:'mine',title:'My new task',owner:'Joshua'}]};
 const m=applyMigrations(old,[]);
 assert.equal(m.board.items[0].title,'‼️ Wedding cake payment');assert.equal(m.board.items.length,23);assert.ok(m.board.items.some(i=>i.title==='Reception drinks'));
 assert.deepEqual(m.board.items.slice(16,20).map(i=>i.id+':'+i.owner+':'+i.title),['item-003:Joshua:Reception food · Sister Doris','item-030:Joshua:Stickers','item-056:Joshua & Lucia:Joint','mine:Joshua:My new task']);
 assert.equal(applyMigrations(m.board,m.migrations).changed,false);
 // 20 Oct: assignments and completions land on an already-saved board without duplicating names.
 const saved20=applyMigrations({items:[{id:'item-070',title:'Assign ushers and protocol lead',owner:'',status:'Not started'},{id:'item-075',title:'Confirm church booking and decor rules',owner:'',status:'Pending',due:''}]},['2026-10-13-joshua-corrections','2026-10-13-joshua-priorities']);
 assert.deepEqual(saved20.board.items.slice(0,2).map(i=>[i.title,i.owner,i.status]),[['Assign ushers and protocol lead · Joana','Joshua','Done'],['Confirm church booking and decor rules','Joshua','Pending']]);
 assert.equal(saved20.board.items[1].due,'2026-10-22');
 // 21 Oct: engagement vs reception drinks, cake priced; running twice adds nothing.
 const d=applyMigrations({items:[{id:'top-01',title:'Wedding cake payment',owner:'Joshua',estimate:null,currency:'GHS'},{id:'item-016',title:'Drinks',owner:'Joshua'}]},['2026-10-13-joshua-corrections','2026-10-13-joshua-priorities','2026-10-20-joshua-assignments']);
 assert.deepEqual(d.board.items.slice(0,3).map(i=>i.title+':'+(i.estimate??'')+(i.currency??'')),['‼️ Wedding cake payment:2500GHS','‼️ Engagement drinks:','Reception drinks:150USD']);
 console.log('PASS: initial data, migrations, persisted edits, version conflicts, validation, uploaded file roundtrip');
} finally {rmSync(tmp,{recursive:true,force:true})}
