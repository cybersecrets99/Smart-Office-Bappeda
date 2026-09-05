import { RbacAction, UserProfile } from '../../types';
import { getJobLevel, sameUnit } from '../identity/identity';

export interface ResourceAttributes { unitId?: string; ownerId?: string; serviceCode?: string; status?: string; year?: number; sensitivity?: string; }
export interface AuthorizationContext { user: UserProfile; action: RbacAction | string; module: string; resource?: ResourceAttributes; }
const actionAllowedByLevel: Record<string, string[]> = {
  SUPERADMIN: ['*'], KEPALA_BADAN: ['VIEW','CREATE','EDIT','APPROVE','REJECT','DOWNLOAD','UPLOAD','EXPORT'],
  SEKRETARIS: ['VIEW','CREATE','EDIT','APPROVE','REJECT','DOWNLOAD','UPLOAD','EXPORT'], KABID: ['VIEW','CREATE','EDIT','REJECT','DOWNLOAD','UPLOAD','EXPORT'],
  KASUBAG: ['VIEW','CREATE','EDIT','DOWNLOAD','UPLOAD','EXPORT'], FRONTOFFICE: ['VIEW','CREATE','EDIT','DOWNLOAD','UPLOAD'],
  STAF: ['VIEW','CREATE','EDIT','DOWNLOAD','UPLOAD'], PEGAWAI: ['VIEW','DOWNLOAD']
};
export function canAuthorize(ctx: AuthorizationContext): boolean {
  const actions = actionAllowedByLevel[getJobLevel(ctx.user)] || [];
  if (!actions.includes('*') && !actions.includes(ctx.action)) return false;
  if (!ctx.resource?.unitId || ctx.user.scope === 'ALL') return true;
  if (ctx.resource.ownerId && ctx.resource.ownerId === ctx.user.id) return true;
  return sameUnit(ctx.user, { unit: ctx.resource.unitId });
}
