import { RolePermissionConfig, SystemConfiguration, UserProfile } from '../types';
import { getJobLevel, normalizeRole, resolveUnitId } from '../domain/identity/identity';

export const INITIAL_ROLE_PERMISSIONS: RolePermissionConfig[] = [
 {role:'SUPERADMIN',roleLabel:'Super Administrator',category:'ADMIN',allowedModules:['*'],canCreateDisposition:true,canApproveLetters:true,canManageUsers:true,workOnlyMode:false},
 {role:'KEPALA_BADAN',roleLabel:'Kepala Badan',category:'PIMPINAN',allowedModules:['*'],canCreateDisposition:true,canApproveLetters:true,canManageUsers:false,workOnlyMode:false},
 {role:'SEKRETARIS',roleLabel:'Sekretaris Badan',category:'PIMPINAN',allowedModules:['*'],canCreateDisposition:true,canApproveLetters:true,canManageUsers:false,workOnlyMode:false},
 {role:'OPR_FRONTOFFICE',roleLabel:'Operator Front Office',category:'PELAKSANA',allowedModules:['dashboard','layanan','persuratan','arsip'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'ADMIN_SEKRETARIAT',roleLabel:'Admin Sekretariat',category:'SEKRETARIAT',allowedModules:['dashboard','persuratan','disposisi','tugas','perjalanan','aset','rapat','arsip','laporan','governance'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'KASUBAG_UMPEG',roleLabel:'Kasubag Umum & Kepegawaian',category:'SEKRETARIAT',allowedModules:['dashboard','persuratan','disposisi','tugas','rapat','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'KASUBAG_ASETKEU',roleLabel:'Kasubag Aset & Keuangan',category:'SEKRETARIAT',allowedModules:['dashboard','persuratan','disposisi','tugas','perjalanan','aset','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'KASUBAG_PERENCANAAN',roleLabel:'Kasubag Perencanaan & Program',category:'SEKRETARIAT',allowedModules:['dashboard','persuratan','disposisi','tugas','perencanaan','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'KABID_PERENCANAAN_MAKRO',roleLabel:'Kabid Perencanaan Makro',category:'BIDANG_MAKRO',allowedModules:['dashboard','persuratan','disposisi','tugas','perencanaan','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'STAF_PERENCANA_MAKRO',roleLabel:'Staf Perencana Makro',category:'BIDANG_MAKRO',allowedModules:['dashboard','disposisi','tugas','perencanaan'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:true},
 {role:'KABID_PERENCANAAN_EKONOMI',roleLabel:'Kabid Perencanaan Ekonomi',category:'BIDANG_EKONOMI',allowedModules:['dashboard','persuratan','disposisi','tugas','perencanaan','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'STAF_PERENCANA_EKONOMI',roleLabel:'Staf Perencana Ekonomi',category:'BIDANG_EKONOMI',allowedModules:['dashboard','disposisi','tugas','perencanaan'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:true},
 {role:'KABID_PERENCANAAN_SOSBUD',roleLabel:'Kabid Perencanaan Sosbud',category:'BIDANG_SOSBUD',allowedModules:['dashboard','persuratan','disposisi','tugas','perencanaan','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'STAF_PERENCANA_SOSBUD',roleLabel:'Staf Perencana Sosbud',category:'BIDANG_SOSBUD',allowedModules:['dashboard','disposisi','tugas','perencanaan'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:true},
 {role:'KABID_PERENCANAAN_FISPRA',roleLabel:'Kabid Perencanaan Fispra',category:'BIDANG_FISPRA',allowedModules:['dashboard','persuratan','disposisi','tugas','perencanaan','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'STAF_PERENCANA_FISPRA',roleLabel:'Staf Perencana Fispra',category:'BIDANG_FISPRA',allowedModules:['dashboard','disposisi','tugas','perencanaan'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:true},
 {role:'KABID_PERENCANAAN_LITBANG',roleLabel:'Kabid Perencanaan Litbang',category:'BIDANG_LITBANG',allowedModules:['dashboard','persuratan','disposisi','tugas','litbang','arsip'],canCreateDisposition:true,canApproveLetters:false,canManageUsers:false,workOnlyMode:false},
 {role:'STAF_FUNGSIONAL',roleLabel:'Staf Fungsional Litbang',category:'BIDANG_LITBANG',allowedModules:['dashboard','disposisi','tugas','litbang'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:true},
 {role:'PEGAWAI',roleLabel:'Pegawai / Pelaksana',category:'PELAKSANA',allowedModules:['dashboard','disposisi','tugas'],canCreateDisposition:false,canApproveLetters:false,canManageUsers:false,workOnlyMode:true},
];

export const INITIAL_SYSTEM_CONFIGURATION: SystemConfiguration={archiveAutoEnabled:true,archiveDriveFolder:'08_ARSIP',telegramEscalationEnabled:true,otpRequiredForTte:true,offlineQueueEnabled:true};

/** Converts legacy records to the canonical 2D identity without changing display labels. */
export const hydrateUser=(user:UserProfile):UserProfile=>{const role=normalizeRole(user.role);const unitId=user.unitId??resolveUnitId(user.unit);return {...user,role,unitId,jobLevel:user.jobLevel??getJobLevel({...user,role})};};

/** Full operational seed data is intentionally kept separate from the identity/config contract. */
export const INITIAL_USERS:UserProfile[]=[];
