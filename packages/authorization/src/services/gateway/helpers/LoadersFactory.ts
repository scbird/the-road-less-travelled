import { PrismaClient } from '@prisma/client'
import DataLoader from 'dataloader'
import { GraphQLError } from 'graphql/error'
import { propEq } from 'ramda'
import { injectable } from 'tsyringe'
import { AuthService } from '../../auth'
import { DatabaseFilters } from '../../auth/types'
import { RequestLoaders } from '../types/RequestLoaders'

@injectable()
export class LoadersFactory {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaClient
  ) {}

  build(filters: DatabaseFilters): RequestLoaders {
    return {
      org: this.buildLoader((ids) =>
        this.prisma.organization.findMany({
          where: { AND: [{ id: { in: ids as string[] } }, filters.org] }
        })
      ),
      post: this.buildLoader((ids) =>
        this.prisma.post.findMany({
          where: { AND: [{ id: { in: ids as string[] } }, filters.post] }
        })
      ),
      team: this.buildLoader((ids) =>
        this.prisma.team.findMany({
          where: { AND: [{ id: { in: ids as string[] } }, filters.team] }
        })
      )
    }
  }

  private buildLoader<Type extends { id: string }>(
    getItems: (ids: readonly string[]) => Promise<Type[]>
  ): DataLoader<string, Type> {
    return new DataLoader(async (ids) => {
      const items = await getItems(ids)

      return ids.map((id) => {
        const item = items.find(propEq('id', id))

        if (item) {
          return item
        } else {
          return new GraphQLError(
            `${id} doesn't exist or you don't have permission to view it`,
            {
              extensions: { code: 'BAD_USER_INPUT' }
            }
          )
        }
      })
    }) as DataLoader<string, Type>
  }
}
