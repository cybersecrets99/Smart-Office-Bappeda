import { RbacAction, UserProfile } from '../../types';
import { ResourceContext, canAuthorize } from '../../domain/authorization/policy';

export interface CommandContext { actor: UserProfile; requestId?: string; reason?: string; }

export function assertAuthorized(context: CommandContext, action: RbacAction | string, module: string, resource?: Omit<ResourceContext, 'module'>): void {
  if (!canAuthorize({ user: context.actor, action, module, resource })) {
    throw new Error(`Unauthorized command: ${module}.${action}`);
  }
}

export function authorize<T>(context: CommandContext, action: RbacAction | string, module: string, resource: Omit<ResourceContext, 'module'> | undefined, execute: () => T): T {
  assertAuthorized(context, action, module, resource);
  return execute();
}
