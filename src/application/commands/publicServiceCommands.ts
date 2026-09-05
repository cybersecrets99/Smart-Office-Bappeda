import { PublicService, PublicServiceSubmission, UserProfile } from '../../types';
import { routePublicService } from '../../domain/routing/smartRouting';
export function getPublicServiceAssignees(submission:PublicServiceSubmission,service:PublicService,users:UserProfile[]){return routePublicService(service,users);}
