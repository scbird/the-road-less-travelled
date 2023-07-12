import { OrgRole } from '@prisma/client'

export enum OrgPermission {
  VIEW_INFO = 'org.viewInfo',
  EDIT_SETTINGS = 'org.editSettings'
}

export const ORG_PERMISSIONS_BY_ORG_ROLE: Record<
  OrgRole,
  readonly OrgPermission[]
> = {
  [OrgRole.ADMIN]: Object.values(OrgPermission),
  [OrgRole.MEMBER]: [OrgPermission.VIEW_INFO]
}
