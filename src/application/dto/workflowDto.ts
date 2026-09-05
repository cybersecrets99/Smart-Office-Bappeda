import { DomainWorkflowState } from '../../domain/workflow/stateMachine';
export interface WorkflowTransitionDto{entityId:string;from:DomainWorkflowState;to:DomainWorkflowState;actorId:string;reason?:string;}
