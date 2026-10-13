// One-time corrections applied to every saved planner (browser or server) as well as the starting data.
// Each migration runs once per saved copy; its id is recorded in the snapshot's `migrations` list.
type MigItem={id:string;title:string;owner:string;[k:string]:unknown};
type MigBoard={items:MigItem[];[k:string]:unknown};
type Migration={id:string;apply:(board:MigBoard)=>MigBoard};

const onlyLucia=(owner:string)=>owner.trim().toLowerCase()==='lucia';

export const migrations:Migration[]=[
 {id:'2026-10-13-joshua-corrections',apply:board=>{
  const removed=new Set(['item-024','item-026','item-027','item-028','item-058']);
  const toJoshua=new Set(['item-030','item-041']);
  const items=board.items
   .map(i=>toJoshua.has(i.id)?{...i,owner:'Joshua'}:i.id==='item-003'&&i.title==='Reception food · Capitol'?{...i,title:'Reception food · Sister Doris'}:i)
   .filter(i=>!removed.has(i.id)&&!onlyLucia(i.owner));
  return {...board,items};
 }},
];

export function applyMigrations<B extends MigBoard>(board:B,applied:string[]=[]):{board:B;migrations:string[];changed:boolean}{
 let next:MigBoard=board;const done=[...applied];
 for(const m of migrations)if(!done.includes(m.id)){next=m.apply(next);done.push(m.id)}
 return {board:next as B,migrations:done,changed:done.length!==applied.length};
}
export const allMigrationIds=migrations.map(m=>m.id);
