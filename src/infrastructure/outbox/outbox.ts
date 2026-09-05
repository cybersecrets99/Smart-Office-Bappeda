export interface OutboxEvent{operationId:string;eventName:string;aggregateId:string;occurredAt:string;payload:unknown;attempts:number;deliveredAt?:string;}
const KEY='ekanjoli_outbox_v1';
const read=():OutboxEvent[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}};
const write=(items:OutboxEvent[])=>localStorage.setItem(KEY,JSON.stringify(items));
export function enqueueOutbox(event:Omit<OutboxEvent,'attempts'>){const items=read();if(items.some(i=>i.operationId===event.operationId))return;write([{...event,attempts:0},...items]);}
export function listOutbox(){return read();}
export function markOutboxDelivered(operationId:string){write(read().map(i=>i.operationId===operationId?{...i,deliveredAt:new Date().toISOString()}:i));}
