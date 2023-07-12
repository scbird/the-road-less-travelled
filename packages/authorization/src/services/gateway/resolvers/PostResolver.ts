import { Post, PrismaClient, Team, User } from '@prisma/client'
import { GraphQLError } from 'graphql/error'
import { prop, uniq } from 'ramda'
import { injectable } from 'tsyringe'
import { PostPermission, TeamPermission } from '../../auth/permissions'
import { Resolvers } from '../graphql'

@injectable()
export class PostResolver {
  constructor(private readonly prisma: PrismaClient) {}

  resolvers: Resolvers = {
    Query: {
      posts: async (_, __, { filters }): Promise<Post[]> => {
        return this.prisma.post.findMany({ where: filters.post })
      }
    },

    Mutation: {
      createPost: async (_, { input }, { permissions, can }): Promise<Post> => {
        if (!can(TeamPermission.CREATE_POST, input.teamId)) {
          throw new GraphQLError(
            'You are not authorised to create posts for this team',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }

        return this.prisma.post.create({
          data: {
            teamId: input.teamId,
            title: input.title,
            authorId: (permissions.user as User).id,
            content: input.content ?? undefined
          }
        })
      },

      sharePost: async (
        _,
        { input: { postId, userEmails } },
        { can, loaders }
      ): Promise<Post> => {
        const post = await loaders.post.load(postId)

        if (!can(PostPermission.SHARE, post)) {
          throw new GraphQLError(
            'You do not have permission to share this post',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }

        const users = await this.prisma.user.findMany({
          where: { email: { in: userEmails as string[] } }
        })

        post.sharedWith = uniq([...post.sharedWith, ...users.map(prop('id'))])

        await this.prisma.post.update({
          where: { id: post.id },
          data: post
        })

        return post
      },

      editPost: async (
        _,
        { input: { postId, title, content } },
        { can, loaders }
      ): Promise<Post> => {
        const post = await loaders.post.load(postId)

        if (!can(PostPermission.EDIT, post)) {
          throw new GraphQLError(
            'You do not have permission to edit this post',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }

        return this.prisma.post.update({
          where: { id: postId },
          data: {
            title: title ?? undefined,
            content: content ?? undefined
          }
        })
      },

      publishPost: async (
        _,
        { input: { postId } },
        { can, loaders }
      ): Promise<Post> => {
        const post = await loaders.post.load(postId)

        if (!can(PostPermission.PUBLISH, post)) {
          throw new GraphQLError(
            'You do not have permission to publish this post',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }

        return this.prisma.post.update({
          where: { id: post.id },
          data: { published: true }
        })
      }
    },

    Post: {
      author: async (post): Promise<User> => {
        return this.prisma.user.findFirstOrThrow({
          where: { id: post.authorId }
        })
      },

      team: async (post: Post, _, { filters }): Promise<Team> => {
        return this.prisma.team.findFirstOrThrow({
          where: { AND: [{ id: post.teamId }, filters.team] }
        })
      },

      sharedWith: async ({ sharedWith }): Promise<User[]> => {
        return this.prisma.user.findMany({ where: { id: { in: sharedWith } } })
      }
    }
  }
}
