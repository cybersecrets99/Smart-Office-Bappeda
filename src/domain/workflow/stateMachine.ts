import { UserProfile, UserRole } from '../../types';

export type WorkflowState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'OTP_REQUIRED' | 'SIGNED' | 'ARCHIVED' | 'CLOSED';
export type WorkflowTransition = 'SUBMIT' | 'APPROVE' | 'REQUEST_OTP' | 'SIGN' | 'ARCHIVE' | 'CLOSE' | 'BOUNCE';

const leadership: UserRole[] = ['KEPALA_BADAN', 'SEKRETARIS'];
const reviewers: UserRole[] = [
  'KEPALA_BADAN', 'SEKRETARIS', 'KABID_PERENCANAAN_MAKRO', 'KABID_PERENCANAAN_EKONOMI',
  'KABID_PERENCANAAN_SOSBUD', 'KABID_PERENCANAAN_FISPRA', 'KABID_PERENCANAAN_LITBANG',
  'KABID_PERENCANAAN', 'KABID_LITBANG', 'STAF_PERENCANA_MAKRO', 'STAF_PERENCANA_EKONOMI',
  'STAF_PERENCANA_SOSBUD', 'STAF_PERENCANA_FISPRA', 'STAF_LITBANG'
];

export function canTransition(state: WorkflowState, transition: WorkflowTransition, user: UserProfile): boolean {
  if (user.role === 'SUPERADMIN') return true;
  switch (transition) {
    case 'SUBMIT': return state === 'DRAFT';
    case 'APPROVE': return state === 'REVIEW' && reviewers.includes(user.role);
    case 'REQUEST_OTP': return state === 'APPROVED' && leadership.includes(user.role);
    case 'SIGN': return state === 'OTP_REQUIRED' && leadership.includes(user.role);
    case 'ARCHIVE': return state === 'SIGNED' && leadership.includes(user.role);
    case 'CLOSE': return state === 'ARCHIVED' && leadership.includes(user.role);
    case 'BOUNCE': return state === 'REVIEW' || state === 'APPROVED';
    default: return false;
  }
}

export function transitionState(state: WorkflowState, transition: WorkflowTransition): WorkflowState {
  const next: Record<WorkflowTransition, WorkflowState> = {
    SUBMIT: 'REVIEW', APPROVE: 'APPROVED', REQUEST_OTP: 'OTP_REQUIRED', SIGN: 'SIGNED',
    ARCHIVE: 'ARCHIVED', CLOSE: 'CLOSED', BOUNCE: 'DRAFT'
  };
  if (!canTransitionState(state, transition)) throw new Error(`Invalid workflow transition: ${state} -> ${transition}`);
  return next[transition];
}

function canTransitionState(state: WorkflowState, transition: WorkflowTransition): boolean {
  return {
    SUBMIT: state === 'DRAFT', APPROVE: state === 'REVIEW', REQUEST_OTP: state === 'APPROVED',
    SIGN: state === 'OTP_REQUIRED', ARCHIVE: state === 'SIGNED', CLOSE: state === 'ARCHIVED',
    BOUNCE: state === 'REVIEW' || state === 'APPROVED'
  }[transition];
}
