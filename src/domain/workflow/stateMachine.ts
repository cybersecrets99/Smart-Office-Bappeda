export type DomainWorkflowState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'OTP_REQUIRED' | 'SIGNED' | 'ARCHIVED' | 'CLOSED';
const transitions: Record<DomainWorkflowState, DomainWorkflowState[]> = {
  DRAFT: ['REVIEW'], REVIEW: ['DRAFT','APPROVED'], APPROVED: ['OTP_REQUIRED'], OTP_REQUIRED: ['SIGNED'], SIGNED: ['ARCHIVED'], ARCHIVED: ['CLOSED'], CLOSED: []
};
export function canTransition(from: DomainWorkflowState, to: DomainWorkflowState): boolean { return transitions[from].includes(to); }
export function assertTransition(from: DomainWorkflowState, to: DomainWorkflowState): void { if (!canTransition(from, to)) throw new Error(`Transisi workflow tidak valid: ${from} -> ${to}`); }
