// Runs google-drive/Code.gs against in-memory stand-ins for Apps Script services,
// then drives it through src/lib/drive-store.ts the way the planner does.
import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import ts from 'typescript';
const tmp=mkdtempSync(new URL('../.test-runtime-',import.meta.url).pathname);
const js=(file,out,fix=s=>s)=>writeFileSync(tmp+'/'+out,ts.transpileModule(fix(readFileSync(file,'utf8')),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
try {
 // Apps Script stand-ins
 const files={},props={};let n=0;
 const file=id=>({getBlob:()=>({getDataAsString:()=>files[id]}),setContent:t=>{files[id]=t},getId:()=>id});
 const gs={PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty:(k,v)=>{props[k]=v}})},
  DriveApp:{getFileById:id=>{if(!(id in files))throw Error('missing');return file(id)},createFile:(name,t)=>{const id='f'+(++n);files[id]=t;return file(id)}},
  LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
  ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({setMimeType:()=>t})},JSON,Array,Date};
 vm.createContext(gs);vm.runInContext(readFileSync('google-drive/Code.gs','utf8'),gs);
 let reachable=true;
 globalThis.fetch=async(url,init={})=>{if(!reachable)throw TypeError('offline');const text=init.method==='POST'?gs.doPost({postData:{contents:init.body}}):gs.doGet();return new Response(text)};

 js('src/lib/validation.ts','validation.mjs');js('src/lib/migrations.ts','migrations.mjs');
 const initial=readFileSync('src/lib/initial-board.json','utf8');
 js('src/lib/local-store.ts','local-store.mjs',s=>s.replace("import initial from './initial-board.json';",'const initial='+initial+';').replace("'./validation'","'./validation.mjs'").replace("'./migrations'","'./migrations.mjs'"));
 js('src/lib/drive-store.ts','drive-store.mjs',s=>s.replace("'./local-store'","'./local-store.mjs'").replace("'./validation'","'./validation.mjs'").replace("'./migrations'","'./migrations.mjs'").replace('(import.meta.env.VITE_SYNC_URL as string|undefined)',"''"));
 const {localRequest}=await import(tmp+'/local-store.mjs');
 const {driveRequest}=await import(tmp+'/drive-store.mjs');
 const req=(path,init)=>driveRequest(path,init,'https://script.example/exec');
 const put=(board,version)=>req('/api/board',{method:'PUT',body:JSON.stringify({board,version})});

 // An edit made in this browser before Drive was set up is carried into Drive on first load.
 const local=await(await localRequest('/api/board')).json();local.board.items[0].title='Entered before syncing';
 assert.equal((await localRequest('/api/board',{method:'PUT',body:JSON.stringify(local)})).status,200);
 const first=await(await req('/api/board')).json();
 assert.equal(first.board.items[0].title,'Entered before syncing');assert.equal(first.version,1);
 assert.deepEqual(first.migrations,['2026-10-13-joshua-corrections','2026-10-13-joshua-priorities','2026-10-20-joshua-assignments','2026-10-21-drinks-and-cake','2026-10-21-kaftan-price','2026-10-21-bride-price-envelopes','2026-10-21-shoes-and-shirt','2026-10-21-cake-in-cedis','2026-10-21-priority-payments','2026-10-21-engagement-list-breakdowns','2026-10-29-ticked-payments','2026-10-29-decor-priority','2026-10-29-flower-bouquet']);

 // Saved edits come back on the next load (another device reads the same file).
 const b=structuredClone(first.board);b.items[1].status='Done';
 const saved=await put(b,first.version);assert.equal(saved.status,200);
 assert.equal((await(await req('/api/board')).json()).board.items[1].status,'Done');
 assert.equal(JSON.parse(files.f1).version,2);

 // Stale saves are refused instead of overwriting, invalid boards never reach Drive.
 assert.equal((await put(first.board,first.version)).status,409);
 const bad=structuredClone(b);bad.items[0].paid=-1;assert.equal((await put(bad,2)).status,400);
 assert.equal(JSON.parse(files.f1).version,2);

 // A board saved in Drive before a migration existed gets it once.
 const old=JSON.parse(files.f1);old.migrations=['2026-10-13-joshua-corrections'];old.board.items=old.board.items.filter(i=>!i.id.startsWith('top-'));files.f1=JSON.stringify(old);
 const migrated=await(await req('/api/board')).json();
 assert.equal(migrated.board.items[0].title,'‼️ Wedding cake payment');assert.equal(migrated.version,3);
 assert.equal((await(await req('/api/board')).json()).version,3);

 // Offline: a clear error, nothing written.
 reachable=false;const off=await put(migrated.board,3);assert.equal(off.status,503);reachable=true;
 assert.equal(JSON.parse(files.f1).version,3);
 console.log('PASS: Drive seeding from browser, shared saves, conflicts, validation, migrations, offline');
} finally {rmSync(tmp,{recursive:true,force:true})}
