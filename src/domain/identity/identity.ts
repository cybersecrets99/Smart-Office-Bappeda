import { JobLevel, UnitKerjaCode, UserProfile, UserRole } from '../../types';

export const normalizeRole=(role:UserRole):UserRole=>role==='ADMIN_MAKRO'?'STAF_PERENCANA_MAKRO':role==='ADMIN_EKONOMI'?'STAF_PERENCANA_EKONOMI':role==='ADMIN_SOSBUD'?'STAF_PERENCANA_SOSBUD':role==='ADMIN_FISPRA'?'STAF_PERENCANA_FISPRA':role==='ADMIN_LITBANG'?'STAF_FUNGSIONAL':role==='ADMIN_SEKRET'?'ADMIN_SEKRETARIAT':role;

export const getJobLevel=(user:Pick<UserProfile,'role'|'position'>&Partial<Pick<UserProfile,'jobLevel'>>):JobLevel=>{
 if(user.jobLevel)return user.jobLevel;
 if(user.role==='SUPERADMIN')return 'SUPERADMIN';
 if(user.role==='KEPALA_BADAN'||/kepala badan|kaban/i.test(user.position))return 'KEPALA_BADAN';
 if(user.role==='SEKRETARIS'||/sekretaris/i.test(user.position))return 'SEKRETARIS';
 if(/kabid|kepala bidang/i.test(user.position)||user.role.startsWith('KABID_'))return 'KABID';
 if(/kasubag|kepala sub/i.test(user.position)||user.role.startsWith('KASUBAG_'))return 'KASUBAG';
 if(user.role==='OPR_FRONTOFFICE'||/front office|pelayanan.*registrasi/i.test(user.position))return 'FRONTOFFICE';
 if(user.role.startsWith('STAF_')||user.role==='PEGAWAI')return 'STAF';
 return 'PEGAWAI';
};

export function resolveUnitId(unit:string):UnitKerjaCode{
 if(/kepala badan/i.test(unit))return 'KEPALA_BADAN';
 if(/pelayanan|front.?office/i.test(unit))return 'FRONTOFFICE';
 if(/tata kelola|it/i.test(unit))return 'TATA_KELOLA_IT';
 if(/aset|keuangan/i.test(unit))return 'ASET_KEUANGAN';
 if(/umum|kepegawaian/i.test(unit))return 'UMUM_KEPEGAWAIAN';
 if(/perencanaan.*program/i.test(unit))return 'PERENCANAAN_PROGRAM';
 if(/perencanaan makro/i.test(unit))return 'PERENCANAAN_MAKRO';
 if(/perencanaan ekonomi/i.test(unit))return 'PERENCANAAN_EKONOMI';
 if(/perencanaan sosbud/i.test(unit))return 'PERENCANAAN_SOSBUD';
 if(/perencanaan fispra/i.test(unit))return 'PERENCANAAN_FISPRA';
 if(/litbang|inovasi/i.test(unit))return 'LITBANG_INOVASI';
 return 'SEKRETARIAT';
}

export const sameUnit=(a:Pick<UserProfile,'unit'|'unitId'>,b:Pick<UserProfile,'unit'|'unitId'>)=>a.unitId&&b.unitId?a.unitId===b.unitId:a.unit===b.unit;
