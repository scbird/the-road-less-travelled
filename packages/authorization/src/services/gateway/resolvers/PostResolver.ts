import { Post, PrismaClient, Team } from '@prisma/client'
import { Service } from 'typedi'
import { PostResolvers } from '../graphql'

@Service()
export class PostResolver implements PostResolvers {
  constructor(private readonly prisma: PrismaClient) {}

  async team(post: Post, _, { filters }): Promise<Team> {
    return this.prisma.team.findFirstOrThrow({
      where: { AND: [{ id: post.teamId }, filters.teams] }
    })
  }
}
