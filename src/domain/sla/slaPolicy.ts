import { SlaStatus } from '../../types';
export function calculateSlaStatus(totalHours:number, remainingHours:number):SlaStatus { if(remainingHours<=0)return 'OVERDUE'; if(totalHours>0&&remainingHours/totalHours<=0.25)return 'WARNING'; return 'ON_TRACK'; }
export function escalationThreshold(totalHours:number, remainingHours:number):75|100|null { if(remainingHours<=0)return 100; if(totalHours>0&&remainingHours/totalHours<=0.25)return 75; return null; }
