import { UserProfile, PublicServiceSubmission } from '../../types';
import { resolveServiceRoute } from '../../domain/routing/serviceRouting';

export function getServiceAssigneeCandidates(service: PublicServiceSubmission, users: UserProfile[]): UserProfile[] {
  const route = resolveServiceRoute(service.serviceCode, service.category);
  return users.filter((user) => {
    if (user.unit !== route.unitId) return false;
    return user.role === 'KEPALA_BADAN' || user.role === 'SEKRETARIS' || user.role === 'KABID' || user.role === 'STAF' || user.role === 'FRONTOFFICE';
  });
}
