import { PrismaClient } from '@prisma/client'
import { injectable } from 'tsyringe'
import { Resolvers } from '../graphql'

@injectable()
export class QueryResolver {
  constructor(private readonly prisma: PrismaClient) {}

  resolvers: Resolvers = {}
}
