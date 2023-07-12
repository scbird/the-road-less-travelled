import { OrgRole, TeamRole } from '@prisma/client'

export enum TeamPermission {
  /** Users can view basic info about this team */
  VIEW_INFO = 'team.viewInfo',
  /** User can view posts by this team */
  VIEW_POSTS = 'team.viewPosts',
  /** User can create a new post */
  CREATE_POST = 'team.createPost',
  /** User can edit any post owned by this team */
  EDIT_ANY_POST = 'team.editAnyPost',
  /** User can delete posts */
  DELETE_POST = 'team.deletePost'
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
  [OrgRole.ADMIN]: Object.values(TeamPermission),
  [OrgRole.MEMBER]: [TeamPermission.VIEW_INFO]
}
