export interface DocumentVersion {
  version: number;
  label: string;
  documentId: string;
  createdAt: string;
  createdBy: string;
  status: 'DRAFT' | 'SIGNED' | 'ARCHIVED' | 'CANCELLED';
  hash?: string;
  parentVersion?: number;
}

export interface DocumentLifecycle {
  documentId: string;
  currentVersion: number;
  versions: DocumentVersion[];
}

export function createRevision(lifecycle: DocumentLifecycle, createdBy: string, now = new Date().toISOString()): DocumentVersion {
  const version = lifecycle.currentVersion + 1;
  return { version, label: `Rev.${version}`, documentId: lifecycle.documentId, createdAt: now, createdBy, status: 'DRAFT', parentVersion: lifecycle.currentVersion };
}

export function canDeleteFinalDocument(status: DocumentVersion['status']): boolean { return status === 'DRAFT'; }

export function assertImmutable(status: DocumentVersion['status']): void {
  if (!canDeleteFinalDocument(status)) throw new Error('Final/signed/archived documents are immutable; use Rev./Adendum or cancellation.');
}
