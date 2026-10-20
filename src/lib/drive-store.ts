// Shared planner saved in Google Drive through the Apps Script in google-drive/Code.gs.
// Uploaded source files stay in this browser.
import {localRequest} from './local-store';
import {applyMigrations} from './migrations';
import {boardSchema} from './validation';
export const syncUrl=(import.meta.env.VITE_SYNC_URL as string|undefined)||'';
const offline='Could not reach your Google Drive planner. Check your connection and refresh. Nothing was changed.';
async function call(url:string,body?:unknown){const r=await fetch(url,body===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});if(!r.ok)throw Error(offline);return await r.json() as any}
const reply=(d:any)=>d.error?Response.json({error:d.error},{status:d.status||400}):Response.json(d);
export async function driveRequest(path:string,init:RequestInit={},url=syncUrl):Promise<Response>{if(path!=='/api/board')return localRequest(path,init);try{
 if((init.method||'GET')==='PUT'){const input=JSON.parse(String(init.body));const valid=boardSchema.safeParse(input.board);if(!valid.success)return Response.json({error:valid.error.issues[0].message},{status:400});return reply(await call(url,{board:valid.data,version:input.version}))}
 let d=await call(url);
 // First connection: start the shared planner from this browser's saved copy so nothing entered so far is lost.
 if(!d.board){const local=await(await localRequest('/api/board')).json() as any;const seeded=await call(url,{board:local.board,version:0,migrations:local.migrations});d=seeded.error?await call(url):seeded}
 const m=applyMigrations(d.board,d.migrations);if(m.changed){const n=await call(url,{board:m.board,version:d.version,migrations:m.migrations});d=n.error?await call(url):n}
 return Response.json(d)}catch{return Response.json({error:offline},{status:503})}}
