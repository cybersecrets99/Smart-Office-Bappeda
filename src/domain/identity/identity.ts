import { UserProfile, UserRole } from '../../types';

export type JobLevel = 'SUPERADMIN' | 'KEPALA_BADAN' | 'SEKRETARIS' | 'KABID' | 'KASUBAG' | 'STAF' | 'FRONTOFFICE' | 'PEGAWAI';

export const normalizeRole = (role: UserRole): UserRole => {
  if (role === 'ADMIN_MAKRO') return 'STAF_PERENCANA_MAKRO';
  if (role === 'ADMIN_EKONOMI') return 'STAF_PERENCANA_EKONOMI';
  if (role === 'ADMIN_SOSBUD') return 'STAF_PERENCANA_SOSBUD';
  if (role === 'ADMIN_FISPRA') return 'STAF_PERENCANA_FISPRA';
  if (role === 'ADMIN_LITBANG') return 'STAF_FUNGSIONAL';
  if (role === 'ADMIN_SEKRET') return 'ADMIN_SEKRETARIAT';
  return role;
};

export const getJobLevel = (user: Pick<UserProfile, 'role' | 'position'>): JobLevel => {
  if (user.role === 'SUPERADMIN') return 'SUPERADMIN';
  if (user.role === 'KEPALA_BADAN' || /kepala badan|kaban/i.test(user.position)) return 'KEPALA_BADAN';
  if (user.role === 'SEKRETARIS' || /sekretaris/i.test(user.position)) return 'SEKRETARIS';
  if (/kabid|kepala bidang/i.test(user.position) || user.role.startsWith('KABID_')) return 'KABID';
  if (/kasubag|kepala sub/i.test(user.position) || user.role.startsWith('KASUBAG_')) return 'KASUBAG';
  if (user.role === 'OPR_FRONTOFFICE' || /front office/i.test(user.position)) return 'FRONTOFFICE';
  if (user.role.startsWith('STAF_') || user.role === 'PEGAWAI') return 'STAF';
  return 'PEGAWAI';
};

export const sameUnit = (a: Pick<UserProfile, 'unit'>, b: Pick<UserProfile, 'unit'>) => a.unit === b.unit;
