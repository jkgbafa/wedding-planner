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
 {id:'2026-10-20-joshua-assignments',apply:board=>{
  // [owner, status, who/what is handling it (added to the title), extra fields]
  const updates:Record<string,[string,string,string?,Record<string,unknown>?]>={
   'item-070':['Joshua','Done','Joana'],
   'item-068':['Joshua','Done','Abigail Dormekpor & Naa Korklu'],
   'item-071':['Joshua','Done','Joseph'],
   'item-069':['Joshua','Done','Darius'],
   'item-072':['Joshua','Done','Joanna'],
   'item-065':['Joshua','Done'],
   'item-078':['Lucia','Done'],
   'item-079':['Lucia','Done','Tisha'],
   'item-064':['Lucia','Done','Joseph Oware'],
   'item-055':['Lucia','Done'],
   'item-053':['Joshua','Done','Ps Eben & Richie'],
   'item-054':['Joshua','Done','Darius'],
   'item-095':['Lucia','Done'],
   'item-097':['Lucia','Done'],
   'item-059':['Lucia','Done'],
   'item-047':['Joshua','Pending','Bishop Prince’s car'],
   'item-052':['Joshua','Done'],
   'item-048':['Joshua','Pending',undefined,{notes:'20 Oct: not sure yet who is driving the bridesmaids.'}],
   'item-049':['Joshua','Done'],
   'item-050':['Joshua','Pending','Emmanuel'],
   'item-051':['Joshua','Done'],
   'item-075':['Joshua','Pending',undefined,{due:'2026-10-22',notes:'Confirm on Wednesday or Thursday (21–22 Oct).'}],
   'item-076':['Joshua','Pending',undefined,{due:'2026-10-22',notes:'Confirm on Wednesday or Thursday (21–22 Oct).'}],
   'item-074':['Joshua','Pending',undefined,{due:'2026-10-22',notes:'Confirm on Wednesday or Thursday (21–22 Oct).'}],
   'item-062':['Lucia','Pending'],
   'item-096':['Lucia','Pending'],
   'item-061':['Joshua','Pending'],
  };
  const items=board.items.map(i=>{const u=updates[i.id];if(!u)return i;const [owner,status,who,extra]=u;
   return {...i,...extra,owner,status,title:who&&!i.title.includes(who)?i.title+' · '+who:i.title,review:false}});
  return {...board,items};
 }},
 {id:'2026-10-21-drinks-and-cake',apply:board=>{
  const items=board.items.map(i=>
   i.id==='item-016'&&i.title==='Drinks'?{...i,title:'Engagement drinks',event:'Engagement'}:
   i.id==='item-003'&&i.payment!=='Paid'?{...i,payment:'Paid',paid:i.estimate,review:false,evidence:'Reported by Joshua',notes:'Completely paid off (confirmed by Joshua, 21 Oct). Amount assumed to be the GH₵17,000 budget.'}:
   i.id==='top-01'&&i.estimate==null?{...i,currency:'USD',estimate:200,event:'Wedding',notes:'About $200 (21 Oct).'}:i);
  if(!items.some(i=>i.id==='item-016b'))items.splice(items.findIndex(i=>i.id==='item-016')+1||items.length,0,{id:'item-016b',title:'Reception drinks',category:'Food & drinks',owner:'Joshua',status:'Pending',kind:'Expense',currency:'USD',estimate:150,paid:null,payment:'Unpaid',evidence:'Reported by Joshua',notes:'Maybe about $150 (21 Oct). Separate from the engagement drinks.',source:'Joshua · 21 Oct 2026',event:'Wedding',due:'',review:true});
  return {...board,items};
 }},
 {id:'2026-10-21-kaftan-price',apply:board=>({...board,items:board.items.map(i=>i.id==='item-018'&&i.estimate===150?{...i,estimate:200,notes:'Price updated to $200 (21 Oct).'}:i)})},
 {id:'2026-10-21-bride-price-envelopes',apply:board=>({...board,items:board.items.map(i=>i.id==='item-005'&&i.payment==='Paid'?{...i,status:'Pending',payment:'Unpaid',paid:0,review:false,evidence:'Reported by Joshua',notes:'The GH₵2,650 set aside for the envelopes went into the reception food (21 Oct), so it has to be found again.'}:i)})},
 {id:'2026-10-21-shoes-and-shirt',apply:board=>{
  const items=board.items.map(i=>i.id==='item-019'&&i.estimate==null?{...i,currency:'USD',estimate:40,notes:'About $40 (21 Oct).'}:i);
  if(!items.some(i=>i.id==='item-019b'))items.splice(items.findIndex(i=>i.id==='item-019')+1||items.length,0,{id:'item-019b',title:'Groom’s wedding shirt',category:'Attire & beauty',owner:'Joshua',status:'Pending',kind:'Expense',currency:'USD',estimate:30,paid:null,payment:'Unpaid',evidence:'Reported by Joshua',notes:'About $30 (21 Oct).',source:'Joshua · 21 Oct 2026',event:'Wedding',due:'',review:false});
  return {...board,items};
 }},
 {id:'2026-10-21-cake-in-cedis',apply:board=>({...board,items:board.items.map(i=>i.id==='top-01'&&i.currency==='USD'&&i.estimate===200?{...i,currency:'GHS',estimate:2500,review:true,notes:'GH₵2,500 (21 Oct), not $200. Check against the older Cake item recorded as GH₵2,500 paid: if that was never paid, archive one of the two.'}:i)})},
 {id:'2026-10-21-priority-payments',apply:board=>{
  const ids=new Set(['item-019','item-019b','item-016','top-01','item-005']);
  return {...board,items:board.items.map(i=>ids.has(i.id)&&!i.title.startsWith('‼️')?{...i,title:'‼️ '+i.title}:i)};
 }},
 {id:'2026-10-21-engagement-list-breakdowns',apply:board=>{
  // From Lucia's family engagement list. Lines starting with • show under the item in the planner.
  const drinks=['Drinks on Lucia’s family engagement list:','• Wine: 7 bottles (knocking 1, head rum 2, dowry 2, father 1, mother 1)','• Malt: 3 cartons (head rum 1, dowry 2)','• Mineral: 1 carton + 2 crates (head rum 1 carton, dowry 2 crates)'].join('\n');
  const cash=['Cash on Lucia’s family engagement list (adds up to GH₵2,650):','• Knocking fee: GH₵200','• Acceptance: GH₵100','• Head rum (tsir nsa): GH₵500','• Father: GH₵500','• Mother: GH₵500','• Brothers-in-law: GH₵500','• Family: GH₵250','• Thank you: GH₵100','The bride price itself (any amount) is the separate Bride-price cash item.'].join('\n');
  const add=(notes:unknown,text:string)=>String(notes||'').includes(text.split('\n')[0])?String(notes||''):text+(notes?'\n\n'+notes:'');
  return {...board,items:board.items.map(i=>i.id==='item-016'?{...i,notes:add(i.notes,drinks)}:i.id==='item-005'?{...i,notes:add(i.notes,cash)}:i)};
 }},
 {id:'2026-10-29-ticked-payments',apply:board=>{
  // Joshua ticked these as paid; the bride-price cash is archived (kept under Archived items, out of every total).
  const paid=new Set(['top-01','item-018','item-019','item-019b']);
  return {...board,items:board.items.map(i=>
   paid.has(i.id)&&i.payment!=='Paid'?{...i,status:'Done',payment:'Paid',paid:i.estimate,evidence:'Ticked by Joshua',notes:'Paid (ticked by Joshua, 29 Oct).'+(i.notes?'\n\n'+i.notes:'')}:
   i.id==='item-015'?{...i,archived:true,notes:'Taken off the list by Joshua (29 Oct).'+(i.notes?'\n\n'+i.notes:'')}:i)};
 }},
 {id:'2026-10-29-decor-priority',apply:board=>({...board,items:board.items.map(i=>i.id==='item-001'&&!i.title.startsWith('‼️')?{...i,title:'‼️ '+i.title}:i)})},
 {id:'2026-10-29-flower-bouquet',apply:board=>{
  if(board.items.some(i=>i.id==='item-001b'))return board;
  const items=[...board.items];
  items.splice(items.findIndex(i=>i.id==='item-001')+1||items.length,0,{id:'item-001b',title:'‼️ Flower bouquet',category:'Decor & venues',owner:'Joshua',status:'Pending',kind:'Expense',currency:'USD',estimate:200,paid:null,payment:'Unpaid',evidence:'Reported by Joshua',notes:'About $200 (29 Oct).',source:'Joshua · 29 Oct 2026',event:'Wedding',due:'',review:false});
  return {...board,items};
 }},
];

export function applyMigrations<B extends MigBoard>(board:B,applied:string[]=[]):{board:B;migrations:string[];changed:boolean}{
 let next:MigBoard=board;const done=[...applied];
 for(const m of migrations)if(!done.includes(m.id)){next=m.apply(next);done.push(m.id)}
 return {board:next as B,migrations:done,changed:done.length!==applied.length};
}
export const allMigrationIds=migrations.map(m=>m.id);
