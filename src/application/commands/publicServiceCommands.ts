import { OrganizationUnit, PublicService, PublicServiceSubmission, UserProfile } from '../../types';
import { canAuthorize } from '../../domain/authorization/policy';
import { canProcessService, routePublicService } from '../../domain/routing/serviceRouting';
import { assertTransitionSequence } from '../../domain/workflow/stateMachine';

export function getPublicServiceAssignees(submission: PublicServiceSubmission, service: PublicService, users: UserProfile[], org: OrganizationUnit[] = []) { return routePublicService(service, users, org); }
export function canProcessPublicService(user: UserProfile, service: PublicService) { return canProcessService(user, service); }
export function validatePublicServiceCompletion(user: UserProfile, service: PublicService, submission: PublicServiceSubmission) {
  if (!canAuthorize({ user, action: 'APPROVE', module: 'layanan', resource: { unitId: submission.unitInCharge, serviceCode: service.code, status: submission.status } })) throw new Error('Pengguna tidak memiliki kewenangan finalisasi layanan ini.');
  if (!['SUPERADMIN','KEPALA_BADAN','SEKRETARIS'].includes(user.role)) throw new Error('Penerbitan TTE hanya dapat dilakukan oleh pimpinan.');
  if (submission.status !== 'PROSES') throw new Error('Layanan belum berada pada tahap PROSES.');
  assertTransitionSequence(['APPROVED','OTP_REQUIRED','SIGNED','ARCHIVED']);
}
