import { RbacAction, UserProfile } from '../../types';
import { getJobLevel } from '../identity/identity';
import { satisfiesAttributes } from './abac';

export interface ResourceContext {
  module: string;
  unitId?: string;
  ownerId?: string;
  assignedTo?: string;
  status?: string;
  serviceCode?: string;
  sensitivity?: 'BIASA' | 'TERBATAS' | 'RAHASIA';
  operation?: string;
}

const actionAllowedByLevel: Record<string, string[]> = {
  SUPERADMIN: ['*'], KEPALA_BADAN: ['VIEW','CREATE','EDIT','APPROVE','REJECT','DOWNLOAD','UPLOAD','EXPORT'],
  SEKRETARIS: ['VIEW','CREATE','EDIT','APPROVE','REJECT','DOWNLOAD','UPLOAD','EXPORT'], KABID: ['VIEW','CREATE','EDIT','REJECT','DOWNLOAD','UPLOAD','EXPORT'],
  KASUBAG: ['VIEW','CREATE','EDIT','DOWNLOAD','UPLOAD','EXPORT'], FRONTOFFICE: ['VIEW','CREATE','EDIT','DOWNLOAD','UPLOAD'],
  STAF: ['VIEW','CREATE','EDIT','DOWNLOAD','UPLOAD'], PEGAWAI: ['VIEW','DOWNLOAD'],
};

export function isSuperadmin(user: UserProfile) { return getJobLevel(user) === 'SUPERADMIN'; }
export function isLeadership(user: UserProfile) { const l = getJobLevel(user); return l === 'KEPALA_BADAN' || l === 'SEKRETARIS'; }
export function isFrontOffice(user: UserProfile) { return getJobLevel(user) === 'FRONTOFFICE'; }
export function isWorkOnly(user: UserProfile) { return getJobLevel(user) === 'PEGAWAI'; }
export function isAssetFinanceKasubag(user: UserProfile) { return getJobLevel(user) === 'KASUBAG' && /aset|keuangan|keu/i.test(`${user.unit} ${user.position}`); }

export function canAuthorize(ctx: { user: UserProfile; action: RbacAction | string; module: string; resource?: Omit<ResourceContext, 'module'> }): boolean {
  const actions = actionAllowedByLevel[getJobLevel(ctx.user)] || [];
  if (!actions.includes('*') && !actions.includes(ctx.action)) return false;
  const resource = ctx.resource;
  if (ctx.module === 'arsip') return ctx.action === 'VIEW' || ctx.action === 'DOWNLOAD';
  if (ctx.module === 'disposisi' && ctx.action === 'CREATE') return isLeadership(ctx.user);
  if (ctx.module === 'disposisi' && ctx.action === 'EDIT') return getJobLevel(ctx.user) === 'KEPALA_BADAN';
  if (ctx.module === 'perjalanan' && (ctx.action === 'CREATE' || ctx.action === 'EDIT' || ctx.action === 'DELETE')) return isAssetFinanceKasubag(ctx.user);
  if (ctx.module === 'perjalanan' && ctx.action === 'APPROVE') return isLeadership(ctx.user);
  if (ctx.module === 'persuratan' && ctx.action === 'CREATE') return resource?.operation === 'LETTER_IN' ? isFrontOffice(ctx.user) : getJobLevel(ctx.user) === 'STAF' || getJobLevel(ctx.user) === 'KABID';
  if (ctx.module === 'persuratan' && ctx.action === 'EDIT' && resource?.operation === 'LETTER_OUT_REVIEW') return getJobLevel(ctx.user) === 'STAF' || getJobLevel(ctx.user) === 'KABID';
  if (ctx.module === 'persuratan' && ctx.action === 'APPROVE' && resource?.operation === 'LETTER_OUT_APPROVE') return isLeadership(ctx.user);
  if (ctx.module === 'persuratan' && ctx.action === 'DELETE') return false;
  if (ctx.module === 'tugas' && ctx.action === 'DELETE') return false;
  if (ctx.module === 'tugas' && ctx.action === 'EDIT') return resource?.assignedTo === ctx.user.id || isLeadership(ctx.user);
  if (ctx.module === 'aset') return isAssetFinanceKasubag(ctx.user);
  if (ctx.module === 'layanan-publik' && ctx.action === 'EDIT') return isFrontOffice(ctx.user) || getJobLevel(ctx.user) === 'STAF' || getJobLevel(ctx.user) === 'KABID';
  if (!resource) return true;
  return satisfiesAttributes(ctx.user, resource);
}

export function canPerform(user: UserProfile, action: RbacAction, resource: ResourceContext): boolean { return canAuthorize({ user, action, module: resource.module, resource }); }
export function canAccessModule(user: UserProfile, moduleId: string, allowedModules: string[] = []): boolean {
  if (isSuperadmin(user) || allowedModules.includes(moduleId)) return true;
  if (moduleId === 'arsip') return true;
  return canAuthorize({ user, action: 'VIEW', module: moduleId });
}
