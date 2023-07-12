import { OrgRole, SiteRole, TeamRole } from '@prisma/client'

export enum TeamPermission {
  /** Users can view basic info about this team */
  VIEW_INFO = 'team.viewInfo',
  /** User can view posts by this team */
  VIEW_POSTS = 'team.viewPosts',
  /** User can create a new post */
  CREATE_POST = 'team.createPost',
  /** User can edit any post owned by this team */
  EDIT_ANY_POST = 'team.editAnyPost',
  /** Set the roles a user has with this team */
  SET_USER_ROLES = 'team.setUserRoles'
}

export const TEAM_PERMISSIONS_BY_TEAM_ROLE: Record<
  TeamRole,
  readonly TeamPermission[]
> = {
  [TeamRole.ADMIN]: Object.values(TeamPermission),
  [TeamRole.VIEWER]: [TeamPermission.VIEW_INFO, TeamPermission.VIEW_POSTS],
  [TeamRole.SUBMITTER]: [
    TeamPermission.VIEW_INFO,
    TeamPermission.VIEW_POSTS,
    TeamPermission.CREATE_POST
  ]
}

export const TEAM_PERMISSIONS_BY_ORG_ROLE: Partial<
  Record<OrgRole, readonly TeamPermission[]>
> = {
  [OrgRole.ADMIN]: [
    TeamPermission.VIEW_INFO,
    TeamPermission.VIEW_POSTS,
    TeamPermission.SET_USER_ROLES
  ],
  [OrgRole.MEMBER]: [TeamPermission.VIEW_INFO]
}

export const TEAM_PERMISSIONS_BY_SITE_ROLE: Partial<
  Record<SiteRole, readonly TeamPermission[]>
> = {
  [SiteRole.ADMIN]: Object.values(TeamPermission)
}
