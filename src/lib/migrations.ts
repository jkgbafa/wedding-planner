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
 {id:'2026-10-13-joshua-priorities',apply:board=>{
  const base={owner:'Joshua',status:'Pending',kind:'Task',currency:'GHS',estimate:null,paid:null,payment:'Unpaid',evidence:'To confirm',notes:'',source:'Joshua · 13 Oct 2026',event:'Both events',due:'',review:false};
  const rows:[string,string,string,Record<string,unknown>?][]=[
   ['top-01','Wedding cake payment','Food & drinks',{kind:'Expense'}],
   ['top-02','Send payment for Airbnb','Final preparations',{kind:'Expense'}],
   ['top-03','Design save the date','Invitations'],
   ['top-04','Confirm the people we’re sending to','Invitations'],
   ['top-05','Call Desmond to see if he can help with transportation','Transport'],
   ['top-06','Decide whether I’ll wear sandals','Attire & beauty'],
   ['top-07','Respond to the kaftan people and decide what to do','Attire & beauty'],
   ['top-08','Assign people to help with NFC tags','Final preparations'],
   ['top-09','Confirm the wedding sound with Joel','Music & programme'],
   ['top-10','Call MZ to speak to Mother Nina','People & roles'],
   ['top-11','Discuss transportation','Transport'],
   ['top-12','Transportation','Transport'],
   ['top-13','Print the order of service','Music & programme'],
   ['top-14','Call Uncle Kobla','People & roles'],
   ['top-15','Check RSVPs','Invitations'],
   ['top-16','Confirm booking of the hall','Decor & venues'],
  ];
  const ids=new Set(board.items.map(i=>i.id));
  const added=rows.filter(([id])=>!ids.has(id)).map(([id,title,category,extra])=>({...base,id,title,category,...extra}));
  return {...board,items:[...added,...board.items]};
 }},
];

export function applyMigrations<B extends MigBoard>(board:B,applied:string[]=[]):{board:B;migrations:string[];changed:boolean}{
 let next:MigBoard=board;const done=[...applied];
 for(const m of migrations)if(!done.includes(m.id)){next=m.apply(next);done.push(m.id)}
 return {board:next as B,migrations:done,changed:done.length!==applied.length};
}
export const allMigrationIds=migrations.map(m=>m.id);
