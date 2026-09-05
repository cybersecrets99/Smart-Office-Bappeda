export type DomainEventName = 'SERVICE_VERIFIED' | 'SERVICE_BOUNCED' | 'SERVICE_FINISHED' | 'DOCUMENT_APPROVED' | 'DOCUMENT_SIGNED' | 'DISPOSITION_COMPLETED' | 'SLA_BREACHED';

export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  name: DomainEventName;
  aggregateId: string;
  occurredAt: string;
  actorId: string;
  payload: T;
}

export const createDomainEvent = <T>(name: DomainEventName, aggregateId: string, actorId: string, payload: T): DomainEvent<T> => ({
  id: crypto.randomUUID(), name, aggregateId, occurredAt: new Date().toISOString(), actorId, payload
});
