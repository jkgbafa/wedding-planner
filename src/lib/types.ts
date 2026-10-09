export type Status = 'Not started' | 'Pending' | 'Done';
export type Payment = 'Unpaid' | 'Part paid' | 'Paid' | 'Unconfirmed' | 'Unallocated';
export type Item = {id:string; title:string; category:string; event:string; owner:string; status:Status; kind:'Task'|'Expense'; currency:'GHS'|'USD'; estimate:number|null; paid:number|null; payment:Payment; evidence:string; notes:string; source:string; due:string; review:boolean; archived?:boolean};
export type Board = {items:Item[]; budgets:{GHS:number|null;USD:number|null}; weddingDate:string; ceremonyTime:string; categories:string[]};
export type Snapshot = {board:Board;version:number;updatedAt:string;updatedBy:string};
export const categories=['Attire & beauty','Decor & venues','Food & drinks','Transport','Music & programme','Media','Tradition & gifts','People & roles','Invitations','Final preparations'];
export function totals(items:Item[],currency:'GHS'|'USD') {const all=items.filter(i=>!i.archived&&i.kind==='Expense'&&i.currency===currency); const tracked=all.filter(i=>i.payment!=='Unallocated');return {paid:tracked.reduce((s,i)=>s+(i.payment==='Unconfirmed'?0:(i.paid??0)),0), remaining:tracked.reduce((s,i)=>s+(i.payment==='Unconfirmed'||i.payment==='Paid'?0:Math.max(0,(i.estimate??0)-(i.paid??0))),0), uncertain:tracked.filter(i=>i.payment==='Unconfirmed').reduce((s,i)=>s+(i.estimate??0),0), unpriced:tracked.filter(i=>i.estimate===null&&i.payment!=='Paid').length, paidUnknown:tracked.filter(i=>i.payment==='Paid'&&i.paid===null).length, unallocated:all.filter(i=>i.payment==='Unallocated').reduce((s,i)=>s+(i.paid??0),0)};}
export const money=(n:number|null,c='GHS')=>n===null?'Not recorded':(c==='GHS'?'GH₵ ':'$')+n.toLocaleString('en-US',{maximumFractionDigits:2});

export function assignedTo(item:Item,name:string){return item.owner.split(/\s*(?:&|,|\/|\band\b)\s*/i).some(owner=>owner.trim().toLowerCase()===name.trim().toLowerCase());}
