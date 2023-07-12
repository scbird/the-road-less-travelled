import { Post, Prisma } from '@prisma/client'
import { Service } from 'typedi'
import { PostPermission, TeamPermission } from '../permissions'
import { PermissionsList } from '../types'

@Service()
export class PostPermissionsHelper {
  can(permissions: PermissionsList, permission: PostPermission, post: Post) {
    switch (permission) {
      case PostPermission.VIEW:
        return this.canView(permissions, post)
      case PostPermission.EDIT:
        return this.canEdit(permissions, post)
      case PostPermission.DELETE:
        return this.canDelete(permissions, post)
    }
  }

  getFilter(permissions: PermissionsList): Prisma.PostWhereInput {
    const teamIdsWithViewPosts = Object.entries(permissions.teams)
      .filter(([_, teamPermissions]) =>
        teamPermissions.includes(TeamPermission.VIEW_POSTS)
      )
      .map(([teamId]) => teamId)

    // Must match the conditions in canView()
    return {
      AND: [
        {
          OR: [
            { sharedWith: { has: permissions.userId } },
            { teamId: { in: teamIdsWithViewPosts } }
          ]
        },
        {
          OR: [{ published: true }, { authorId: permissions.userId }]
        }
      ]
    }
  }

  private canView(permissions: PermissionsList, post: Post): boolean {
    // Users can view posts if they have the VIEW_POSTS permission for that team or the
    // post has been directly shared with them.
    // Posts that have not been published yet are only visible to the author

    const canViewTeamPosts = (permissions.teams[post.teamId] ?? []).includes(
      TeamPermission.VIEW_POSTS
    )
    const isSharedWithUser = post.sharedWith.includes(permissions.userId)
    const isAuthor = post.authorId === permissions.userId

    return (
      (canViewTeamPosts || isSharedWithUser) && (isAuthor || post.published)
    )
  }

  private canEdit(permissions: PermissionsList, post: Post): boolean {
    if (!this.canView(permissions, post)) {
      return false
    }

    return (
      post.authorId === permissions.userId ||
      (permissions.teams[post.teamId] ?? []).includes(
        TeamPermission.EDIT_ANY_POST
      )
    )
  }

  private canDelete(permissions: PermissionsList, post: Post): boolean {
    if (!this.canView(permissions, post)) {
      return false
    }

    return (
      post.authorId === permissions.userId ||
      (permissions.teams[post.teamId] ?? []).includes(
        TeamPermission.DELETE_POST
      )
    )
  }
}
