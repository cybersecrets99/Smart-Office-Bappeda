import { UserProfile } from '../../types';
import { createDomainEvent, DomainEvent } from '../../domain/events/domainEvents';
import { WorkflowState, canTransition, transitionState, WorkflowTransition } from '../../domain/workflow/stateMachine';

export interface PublicServiceWorkflowRecord {
  id: string;
  workflowState: WorkflowState;
  status: string;
  unitId: string;
  serviceCode: string;
  assignedTo?: string;
}

export function executePublicServiceTransition(
  record: PublicServiceWorkflowRecord,
  transition: WorkflowTransition,
  actor: UserProfile,
  reason?: string,
): { record: PublicServiceWorkflowRecord; event: DomainEvent } {
  if (!canTransition(record.workflowState, transition, actor)) {
    throw new Error(`Unauthorized transition ${transition} for ${actor.role}`);
  }

  const next = transitionState(record.workflowState, transition);
  const status = next === 'REVIEW' ? 'VERIFIKASI'
    : next === 'APPROVED' ? 'PROSES'
    : next === 'CLOSED' ? 'SELESAI'
    : next === 'ARCHIVED' ? 'ARSIP'
    : record.status;

  const eventName = transition === 'BOUNCE' ? 'SERVICE_BOUNCED'
    : transition === 'APPROVE' ? 'DOCUMENT_APPROVED'
    : transition === 'SIGN' ? 'DOCUMENT_SIGNED'
    : transition === 'ARCHIVE' || transition === 'CLOSE' ? 'SERVICE_FINISHED'
    : 'SERVICE_VERIFIED';

  return {
    record: { ...record, workflowState: next, status },
    event: createDomainEvent(eventName, record.id, actor.id, {
      transition,
      reason,
      unitId: record.unitId,
      serviceCode: record.serviceCode,
    }),
  };
}
