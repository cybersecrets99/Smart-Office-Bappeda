import { PublicServiceSubmission, UserProfile } from '../../types';
import { getJobLevel, sameUnit } from '../../domain/identity/identity';

export interface VisibilityResource {
  unitId?: string;
  ownerId?: string;
  assignedTo?: string;
  serviceCode?: string;
  sensitivity?: 'BIASA' | 'TERBATAS' | 'RAHASIA';
}

export function canViewResource(user: UserProfile, resource: VisibilityResource): boolean {
  const level = getJobLevel(user);
  if (level === 'SUPERADMIN' || user.scope === 'ALL') return true;
  if (resource.ownerId === user.id || resource.assignedTo === user.id) return true;
  if (resource.unitId && sameUnit(user, { unit: resource.unitId })) {
    return resource.sensitivity !== 'RAHASIA' || level === 'KEPALA_BADAN' || level === 'SEKRETARIS';
  }
  if (level === 'KEPALA_BADAN') return true;
  if (level === 'SEKRETARIS') return resource.sensitivity !== 'RAHASIA';
  return false;
}

export function visiblePublicSubmissions(user: UserProfile, submissions: PublicServiceSubmission[]) {
  return submissions.filter(s => canViewResource(user, {
    unitId: s.assignedUnitId,
    assignedTo: s.assignedTo,
    serviceCode: s.serviceCode,
  }));
}
