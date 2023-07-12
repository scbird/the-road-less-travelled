import { Organization, PrismaClient, Team } from '@prisma/client'
import { Service } from 'typedi'
import { OrganizationResolvers } from '../graphql'
import { RequestContext } from '../types'

@Service()
export class OrganizationResolverBuilder implements OrganizationResolvers {
  constructor(private readonly prisma: PrismaClient) {}

  async teams(
    organization: Organization,
    _,
    { filters }: RequestContext
  ): Promise<Team[]> {
    return this.prisma.team.findMany({
      where: { AND: [{ organization }, filters.team] }
    })
  }
}
