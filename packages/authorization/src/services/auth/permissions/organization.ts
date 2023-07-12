import { OrgRole, SiteRole } from '@prisma/client'

export enum OrgPermission {
  VIEW_INFO = 'org.viewInfo',
  SET_USER_ROLES = 'org.setUserRoles'
}

export const ORG_PERMISSIONS_BY_SITE_ROLE: Partial<
  Record<SiteRole, OrgPermission[]>
> = {
  [SiteRole.ADMIN]: Object.values(OrgPermission)
}

export const ORG_PERMISSIONS_BY_ORG_ROLE: Record<
  OrgRole,
  readonly OrgPermission[]
> = {
  [OrgRole.ADMIN]: Object.values(OrgPermission),
  [OrgRole.MEMBER]: [OrgPermission.VIEW_INFO]
}
