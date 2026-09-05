export type DomainEventName='SERVICE_VERIFIED'|'SERVICE_BOUNCED'|'SERVICE_FINISHED'|'DOCUMENT_APPROVED'|'DOCUMENT_SIGNED'|'DISPOSITION_COMPLETED'|'SLA_BREACHED';
export interface DomainEvent<T=unknown>{id:string;name:DomainEventName;occurredAt:string;aggregateId:string;payload:T;}
type Handler<T=unknown>=(event:DomainEvent<T>)=>void|Promise<void>;
export class EventBus{private handlers=new Map<DomainEventName,Set<Handler>>();subscribe<T>(name:DomainEventName,handler:Handler<T>){const set=this.handlers.get(name)||new Set<Handler>();set.add(handler as Handler);this.handlers.set(name,set);return()=>set.delete(handler as Handler);}async publish<T>(name:DomainEventName,aggregateId:string,payload:T){const event:DomainEvent<T>={id:crypto.randomUUID(),name,occurredAt:new Date().toISOString(),aggregateId,payload};await Promise.all([...(this.handlers.get(name)||[])].map(handler=>handler(event)));return event;}}
export const eventBus=new EventBus();
