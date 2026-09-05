import { OrganizationUnit, PublicService, PublicServiceSubmission, UserProfile } from '../../types';
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases: Record<string, string[]> = {
  'sekretariat': ['sekretariat'], 'bidang perencanaan makro': ['makro','perencanaanmakro'],
  'bidang perencanaan ekonomi': ['ekonomi','perencanaanekonomi'], 'bidang perencanaan sosbud': ['sosbud','perencanaansosbud'],
  'bidang perencanaan fispra': ['fispra','perencanaanfispra'], 'bidang litbang & inovasi': ['litbang','penelitiandanpengembangan','inovasi']
};
export function resolveServiceUnit(service: Pick<PublicService, 'unitInCharge'>, org: OrganizationUnit[] = []): string {
  const wanted = normalize(service.unitInCharge); const match = org.find(unit => normalize(unit.name) === wanted); return match?.id || service.unitInCharge;
}
export function routePublicService(service: Pick<PublicService, 'code' | 'unitInCharge'>, users: UserProfile[], org: OrganizationUnit[] = []): UserProfile[] {
  const unitId = resolveServiceUnit(service, org); const accepted = new Set([normalize(service.unitInCharge), ...(aliases[service.unitInCharge] || []).map(normalize)]);
  return users.filter(user => { if (user.role === 'SUPERADMIN' || user.role === 'OPR_FRONTOFFICE') return false; const unit = normalize(user.unit); return unit === normalize(unitId) || accepted.has(unit); });
}
export function rerouteSubmission(submission: PublicServiceSubmission, service: PublicService, users: UserProfile[], org: OrganizationUnit[] = []): UserProfile[] { return routePublicService(service, users, org); }
