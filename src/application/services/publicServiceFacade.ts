import { UserProfile, PublicServiceSubmission } from '../../types';
import { resolveServiceRoute } from '../../domain/routing/serviceRouting';
import { transitionPublicService } from '../commands/publicServiceCommands';
import { WorkflowTransition } from '../../domain/workflow/stateMachine';

export function preparePublicServiceSubmission(submission: PublicServiceSubmission) {
  const route = resolveServiceRoute(submission.serviceCode, submission.unitInCharge);
  return { ...submission, assignedUnitId: submission.assignedUnitId ?? route.unitId, workflowState: submission.workflowState ?? 'DRAFT' };
}

export function applyPublicServiceTransition(submission: PublicServiceSubmission, actor: UserProfile, transition: WorkflowTransition, reason?: string) {
  return transitionPublicService(preparePublicServiceSubmission(submission), actor, transition, reason);
}
