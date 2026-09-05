import { UserProfile } from '../../types';
import { canAuthorize } from '../authorization/policy';
import { getJobLevel } from '../identity/identity';

export type WorkflowState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'OTP_REQUIRED' | 'SIGNED' | 'ARCHIVED' | 'CLOSED';
export type WorkflowTransition = 'SUBMIT' | 'APPROVE' | 'REQUEST_OTP' | 'SIGN' | 'ARCHIVE' | 'CLOSE' | 'BOUNCE';

const transitionAction: Record<WorkflowTransition, string> = {
  SUBMIT: 'EDIT', APPROVE: 'APPROVE', REQUEST_OTP: 'APPROVE', SIGN: 'APPROVE',
  ARCHIVE: 'APPROVE', CLOSE: 'EDIT', BOUNCE: 'REJECT',
};

const nextState: Record<WorkflowTransition, WorkflowState> = {
  SUBMIT: 'REVIEW', APPROVE: 'APPROVED', REQUEST_OTP: 'OTP_REQUIRED', SIGN: 'SIGNED',
  ARCHIVE: 'ARCHIVED', CLOSE: 'CLOSED', BOUNCE: 'DRAFT',
};

function validState(state: WorkflowState, transition: WorkflowTransition): boolean {
  return {
    SUBMIT: state === 'DRAFT', APPROVE: state === 'REVIEW', REQUEST_OTP: state === 'APPROVED',
    SIGN: state === 'OTP_REQUIRED', ARCHIVE: state === 'SIGNED', CLOSE: state === 'ARCHIVED',
    BOUNCE: state === 'REVIEW' || state === 'APPROVED',
  }[transition];
}

export function canTransition(state: WorkflowState, transition: WorkflowTransition, user: UserProfile): boolean {
  if (!validState(state, transition)) return false;
  if (getJobLevel(user) === 'SUPERADMIN') return true;
  const level = getJobLevel(user);
  if (transition === 'REQUEST_OTP' || transition === 'SIGN' || transition === 'ARCHIVE') {
    return (level === 'KEPALA_BADAN' || level === 'SEKRETARIS') &&
      canAuthorize({ user, action: transitionAction[transition], module: 'layanan-publik' });
  }
  return canAuthorize({ user, action: transitionAction[transition], module: 'layanan-publik' });
}

export function transitionState(state: WorkflowState, transition: WorkflowTransition): WorkflowState {
  if (!validState(state, transition)) throw new Error(`Invalid workflow transition: ${state} -> ${transition}`);
  return nextState[transition];
}
