import { UserProfile, PublicServiceSubmission } from '../../types';
import { executePublicServiceTransition, PublicServiceWorkflowRecord } from '../services/publicServiceWorkflow';
import { WorkflowTransition } from '../../domain/workflow/stateMachine';

export function transitionPublicService(
  submission: PublicServiceSubmission,
  actor: UserProfile,
  transition: WorkflowTransition,
  reason?: string,
): { submission: PublicServiceSubmission; eventName: string } {
  const record: PublicServiceWorkflowRecord = {
    id: submission.id,
    workflowState: submission.workflowState ?? 'DRAFT',
    status: submission.status,
    unitId: submission.assignedUnitId ?? actor.unit,
    serviceCode: submission.serviceCode,
    assignedTo: submission.assignedTo,
  };
  const result = executePublicServiceTransition(record, transition, actor, reason);
  return {
    submission: { ...submission, workflowState: result.record.workflowState, status: result.record.status },
    eventName: result.event.name,
  };
}
