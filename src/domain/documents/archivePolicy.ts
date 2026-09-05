export interface ArchivePolicyInput {
  isFinal: boolean;
  isArchived: boolean;
  existingVersion?: number;
}

export function assertArchiveAllowed(input: ArchivePolicyInput): void {
  if (!input.isFinal) throw new Error('Dokumen belum final dan tidak boleh diarsipkan.');
  if (input.isArchived) throw new Error('Dokumen arsip bersifat immutable. Gunakan Revisi/Adendum.');
}

export function nextRevision(existingVersion = 0): number {
  return existingVersion + 1;
}

export function revisionLabel(version: number): string {
  return version <= 0 ? 'Rev.0' : `Rev.${version}`;
}
