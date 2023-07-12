import { PrismaClient, User } from '@prisma/client'
import { injectable } from 'tsyringe'
import { Resolvers } from '../graphql'

@injectable()
export class UserResolver {
  constructor(private readonly prisma: PrismaClient) {}

  resolvers: Resolvers = {
    Query: {
      me: (_, __, { user }): User | null => {
        return user ?? null
      }
    },

    User: {}
  }
}
