import { UserProfile } from '../../types';
import { getJobLevel, sameUnit } from '../identity/identity';

export interface AttributeContext { unitId?: string; ownerId?: string; assignedTo?: string; serviceCode?: string; sensitivity?: 'BIASA'|'TERBATAS'|'RAHASIA'; status?: string; year?: number; }

export function satisfiesAttributes(user: UserProfile, resource: AttributeContext): boolean {
  const level = getJobLevel(user);
  if (level === 'SUPERADMIN' || user.scope === 'ALL') return true;
  if (resource.ownerId === user.id || resource.assignedTo === user.id) return true;
  if (resource.unitId && sameUnit(user, { unit: resource.unitId })) return resource.sensitivity !== 'RAHASIA' || level === 'KEPALA_BADAN' || level === 'SEKRETARIS';
  if (level === 'KEPALA_BADAN') return true;
  return level === 'SEKRETARIS' && resource.sensitivity !== 'RAHASIA';
}
