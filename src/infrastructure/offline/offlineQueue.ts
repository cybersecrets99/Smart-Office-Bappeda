export interface OfflineOperation{operationId:string;entityId:string;version:number;timestamp:string;userId:string;payload:unknown;}
const KEY='ekanjoli_offline_queue_v1';
const read=():OfflineOperation[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}};
const write=(items:OfflineOperation[])=>localStorage.setItem(KEY,JSON.stringify(items));
export function enqueueOffline(operation:OfflineOperation){const items=read();if(!items.some(i=>i.operationId===operation.operationId))write([...items,operation]);}
export function listOfflineQueue(){return read();}
export function removeOffline(operationId:string){write(read().filter(i=>i.operationId!==operationId));}
