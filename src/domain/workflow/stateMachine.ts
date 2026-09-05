export type DomainWorkflowState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'OTP_REQUIRED' | 'SIGNED' | 'ARCHIVED' | 'CLOSED';
const transitions: Record<DomainWorkflowState, DomainWorkflowState[]> = { DRAFT:['REVIEW'], REVIEW:['DRAFT','APPROVED'], APPROVED:['OTP_REQUIRED'], OTP_REQUIRED:['SIGNED'], SIGNED:['ARCHIVED'], ARCHIVED:['CLOSED'], CLOSED:[] };
export function canTransition(from:DomainWorkflowState,to:DomainWorkflowState){return transitions[from].includes(to);}
export function assertTransition(from:DomainWorkflowState,to:DomainWorkflowState){if(!canTransition(from,to))throw new Error(`Transisi workflow tidak valid: ${from} -> ${to}`);}
export function assertTransitionSequence(states:DomainWorkflowState[]){for(let i=1;i<states.length;i++)assertTransition(states[i-1],states[i]);}
