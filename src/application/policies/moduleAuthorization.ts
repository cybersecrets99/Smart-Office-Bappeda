import { UserProfile, RbacAction } from '../../types';
import { actionAccess } from './moduleAccess';

/**
 * Module-facing authorization facade.
 * UI modules ask for business actions instead of inspecting roles directly.
 */
export const persuratanAccess = {
  registerIncoming: (user: UserProfile) => actionAccess(user, 'CREATE', { module: 'persuratan', operation: 'LETTER_IN' }),
  createOutgoing: (user: UserProfile) => actionAccess(user, 'CREATE', { module: 'persuratan', operation: 'LETTER_OUT' }),
  reviewOutgoing: (user: UserProfile, unitId?: string) => actionAccess(user, 'EDIT', { module: 'persuratan', operation: 'LETTER_OUT_REVIEW', unitId }),
  approveOutgoing: (user: UserProfile, unitId?: string) => actionAccess(user, 'APPROVE', { module: 'persuratan', operation: 'LETTER_OUT_APPROVE', unitId }),
};

export const disposisiAccess = {
  create: (user: UserProfile, unitId?: string) => actionAccess(user, 'CREATE', { module: 'disposisi', unitId }),
  edit: (user: UserProfile, unitId?: string) => actionAccess(user, 'EDIT', { module: 'disposisi', unitId }),
};

export const perjalananAccess = {
  create: (user: UserProfile, unitId?: string) => actionAccess(user, 'CREATE', { module: 'perjalanan', unitId }),
  edit: (user: UserProfile, unitId?: string) => actionAccess(user, 'EDIT', { module: 'perjalanan', unitId }),
  approve: (user: UserProfile, unitId?: string) => actionAccess(user, 'APPROVE', { module: 'perjalanan', unitId }),
};

export const tugasAccess = {
  create: (user: UserProfile, unitId?: string) => actionAccess(user, 'CREATE', { module: 'tugas', unitId }),
  edit: (user: UserProfile, assignedTo?: string, unitId?: string) => actionAccess(user, 'EDIT', { module: 'tugas', assignedTo, unitId }),
};

export function canModuleAction(user: UserProfile, module: string, action: RbacAction, unitId?: string) {
  return actionAccess(user, action, { module, unitId });
}
