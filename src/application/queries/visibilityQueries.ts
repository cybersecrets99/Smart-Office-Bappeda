import { UserProfile } from '../../types';
export const canSeeUnit=(user:UserProfile,unitId:string)=>user.scope==='ALL'||user.unit===unitId;
export const visibleByOwnerOrUnit=<T extends {unitId?:string;createdBy?:string}>(items:T[],user:UserProfile)=>items.filter(item=>user.scope==='ALL'||item.createdBy===user.id||item.createdBy===user.name||item.unitId===user.unit);
