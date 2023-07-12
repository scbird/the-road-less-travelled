import { Post, Prisma } from '@prisma/client'
import { injectable } from 'tsyringe'
import {
  PostPermission,
  TEAM_PERMISSIONS_BY_SITE_ROLE,
  TeamPermission
} from '../permissions'
import { PermissionsList } from '../types'

@injectable()
export class PostPermissionsHelper {
  can(
    permissions: PermissionsList,
    permission: PostPermission,
    post: Post
  ): boolean {
    switch (permission) {
      case PostPermission.VIEW:
        return this.canView(permissions, post)
      case PostPermission.EDIT:
        return this.canEdit(permissions, post)
      case PostPermission.SHARE:
        return this.canShare(permissions, post)
      case PostPermission.PUBLISH:
        return this.canEdit(permissions, post)
    }
  }

  getFilter(permissions: PermissionsList): Prisma.PostWhereInput {
    // Must match the conditions in canView()
    const conditions: Prisma.PostWhereInput[] = [
      {
        OR: [{ published: true }, { authorId: permissions.user?.id }]
      }
    ]
    const canViewPostsFromAnyTeam = (permissions.user?.siteRoles ?? []).some(
      (siteRole) =>
        (TEAM_PERMISSIONS_BY_SITE_ROLE[siteRole] ?? []).includes(
          TeamPermission.VIEW_POSTS
        )
    )

    if (!canViewPostsFromAnyTeam) {
      const teamIdsWithViewPosts = Object.entries(permissions.teams)
        .filter(([_, teamPermissions]) =>
          teamPermissions.includes(TeamPermission.VIEW_POSTS)
        )
        .map(([teamId]) => teamId)

      conditions.push({
        OR: [
          { sharedWith: { has: permissions.user?.id ?? null } },
          { teamId: { in: teamIdsWithViewPosts } }
        ]
      })
    }

    return { AND: conditions }
  }

  private canView(permissions: PermissionsList, post: Post): boolean {
    // Users can view posts if they have the VIEW_POSTS permission for that team or the
    // post has been directly shared with them.
    // Posts that have not been published yet are only visible to the author

    const canViewTeamPosts = (permissions.teams[post.teamId] ?? []).includes(
      TeamPermission.VIEW_POSTS
    )
    const isSharedWithUser = Boolean(
      permissions.user?.id && post.sharedWith.includes(permissions.user?.id)
    )
    const isAuthor = post.authorId === permissions.user?.id

    return (
      (canViewTeamPosts || isSharedWithUser) && (isAuthor || post.published)
    )
  }

  private canEdit(permissions: PermissionsList, post: Post): boolean {
    if (!this.canView(permissions, post)) {
      return false
    }

    return (
      post.authorId === permissions.user?.id ||
      (permissions.teams[post.teamId] ?? []).includes(
        TeamPermission.EDIT_ANY_POST
      )
    )
  }

  private canShare(permissions: PermissionsList, post: Post): boolean {
    return this.canView(permissions, post)
  }
}
