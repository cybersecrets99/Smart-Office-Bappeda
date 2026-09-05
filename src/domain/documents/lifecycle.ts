export interface DocumentVersion { version:number; label:string; documentId:string; createdAt:string; createdBy:string; status:'DRAFT'|'SIGNED'|'ARCHIVED'|'CANCELLED'; hash?:string; }
export interface DocumentLifecycle { documentId:string; currentVersion:number; versions:DocumentVersion[]; }
export function createRevision(lifecycle: DocumentLifecycle, createdBy:string, now=new Date().toISOString()): DocumentVersion { const version=lifecycle.currentVersion+1; return { version, label:`Rev.${version}`, documentId:lifecycle.documentId, createdAt:now, createdBy, status:'DRAFT' }; }
export function canDeleteFinalDocument(status: DocumentVersion['status']): boolean { return status==='DRAFT'; }
