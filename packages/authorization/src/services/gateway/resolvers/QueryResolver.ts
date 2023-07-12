import { Post, PrismaClient } from '@prisma/client'
import { Service } from 'typedi'
import { QueryResolvers } from '../graphql'
import { RequestContext } from '../types'

@Service()
export class QueryResolver implements QueryResolvers {
  constructor(private readonly prisma: PrismaClient) {}

  posts(_, __, { filters }: RequestContext): Promise<Post[]> {
    return this.prisma.post.findMany({ where: filters.post })
  }
}
