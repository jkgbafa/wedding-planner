import {localRequest} from './local-store';
import {driveRequest,syncUrl} from './drive-store';
export const serverMode=import.meta.env.VITE_STORAGE_MODE==='server';
export const driveMode=!serverMode&&!!syncUrl;
export function apiRequest(path:string,init?:RequestInit){return serverMode?fetch(path,init):driveMode?driveRequest(path,init):localRequest(path,init)}
export function assetPath(name:string){return import.meta.env.BASE_URL+name}
export function dashboardUrl(){return window.location.origin+import.meta.env.BASE_URL}
export async function downloadSource(id:string,name:string){const r=await apiRequest('/api/files?id='+encodeURIComponent(id));if(!r.ok)throw Error('Could not download this file.');const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
