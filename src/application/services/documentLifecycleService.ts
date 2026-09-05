import { DocumentLifecycle, DocumentVersion, createRevision, canDeleteFinalDocument } from '../../domain/documents/lifecycle';

export function createDocumentRevision(lifecycle: DocumentLifecycle, actorId: string): DocumentVersion {
  return createRevision(lifecycle, actorId);
}

export function assertDocumentMutable(version: DocumentVersion): void {
  if (!canDeleteFinalDocument(version.status)) {
    throw new Error('Final/signed/archived documents are immutable; use Rev./Adendum or cancellation.');
  }
}
