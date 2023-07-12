import { User } from '@prisma/client'
import { Service } from 'typedi'
import { MutationLoginArgs, MutationResolvers } from '../graphql'

@Service()
export class MutationResolver implements MutationResolvers {
  async login(_, { username, password }: MutationLoginArgs): Promise<User> {
    throw new Error('not implemented')
  }
}
