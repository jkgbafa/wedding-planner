import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import ts from 'typescript';
const tmp=mkdtempSync(new URL('../.test-runtime-',import.meta.url).pathname);
try {
 const validation=readFileSync('src/lib/validation.ts','utf8');
 writeFileSync(tmp+'/validation.mjs',ts.transpileModule(validation,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 const initial=readFileSync('src/lib/initial-board.json','utf8');
 const source=readFileSync('src/lib/local-store.ts','utf8').replace("import initial from './initial-board.json';",'const initial='+initial+';').replace("'./validation'","'./validation.mjs'");
 writeFileSync(tmp+'/store.mjs',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 const {localRequest:request}=await import(tmp+'/store.mjs');
 const start=await (await request('/api/board')).json();
 assert.equal(start.board.items.length,103);
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
 console.log('PASS: initial data, persisted edits, version conflicts, validation, uploaded file roundtrip');
} finally {rmSync(tmp,{recursive:true,force:true})}
