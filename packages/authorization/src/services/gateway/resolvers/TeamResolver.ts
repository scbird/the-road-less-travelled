import { Organization, Post, PrismaClient, Team, User } from '@prisma/client'
import { GraphQLError } from 'graphql/error'
import { injectable } from 'tsyringe'
import { TeamPermission } from '../../auth/permissions'
import { Resolvers } from '../graphql'

@injectable()
export class TeamResolver {
  constructor(private readonly prisma: PrismaClient) {}

  resolvers: Resolvers = {
    Query: {
      teams: async (_, __, { filters }): Promise<Team[]> => {
        return this.prisma.team.findMany({ where: filters.team })
      }
    },

    Mutation: {
      setTeamRoles: async (
        _,
        { input: { userEmail, teamId, roles } },
        { can, loaders }
      ): Promise<User> => {
        const team = await loaders.team.load(teamId)
        const user = await this.prisma.user.findFirst({
          where: { email: userEmail }
        })

        if (!can(TeamPermission.SET_USER_ROLES, team)) {
          throw new GraphQLError(
            'You do not have permission to change user roles in this team',
            { extensions: { code: 'FORBIDDEN' } }
          )
        } else if (!user) {
          throw new GraphQLError('There is no user with that email address', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }

        await this.prisma.userTeamRoles.upsert({
          where: { userId_teamId: { userId: user.id, teamId } },
          create: { userId: user.id, teamId, roles },
          update: { roles }
        })

        return user
      }
    },

    Team: {
      organization: async (
        { organizationId },
        _,
        { loaders }
      ): Promise<Organization> => {
        return loaders.org.load(organizationId)
      },

      posts: async ({ id }, _, { filters }): Promise<Post[]> => {
        return this.prisma.post.findMany({
          where: { AND: [{ teamId: id }, filters.post] }
        })
      }
    }
  }
}
