import { Organization, PrismaClient, Team, User } from '@prisma/client'
import { GraphQLError } from 'graphql/error'
import { injectable } from 'tsyringe'
import { OrgPermission } from '../../auth/permissions'
import { Resolvers } from '../graphql'

@injectable()
export class OrganizationResolver {
  constructor(private readonly prisma: PrismaClient) {}

  resolvers: Resolvers = {
    Organization: {
      teams: async (organization, _, { filters }): Promise<Team[]> => {
        return this.prisma.team.findMany({
          where: { AND: [{ organization }, filters.team] }
        })
      }
    },

    Mutation: {
      setOrgRoles: async (
        _,
        { input: { userEmail, orgId, roles } },
        { can, loaders }
      ): Promise<User> => {
        const org = await loaders.org.load(orgId)
        const user = await this.prisma.user.findFirst({
          where: { email: userEmail }
        })

        if (!can(OrgPermission.SET_USER_ROLES, org)) {
          throw new GraphQLError(
            'You do not have permission to change user roles in this organization',
            { extensions: { code: 'FORBIDDEN' } }
          )
        } else if (!user) {
          throw new GraphQLError('There is no user with that email address', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }

        await this.prisma.userOrganizationRoles.upsert({
          where: {
            userId_organizationId: { userId: user.id, organizationId: orgId }
          },
          create: { userId: user.id, organizationId: orgId, roles },
          update: { roles }
        })

        return user
      }
    },

    Query: {
      organizations: async (_, __, { filters }): Promise<Organization[]> => {
        return this.prisma.organization.findMany({ where: filters.org })
      }
    }
  }
}
