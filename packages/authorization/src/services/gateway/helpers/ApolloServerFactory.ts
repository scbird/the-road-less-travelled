import { ApolloServer } from '@apollo/server'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { injectable } from 'tsyringe'
import {
  AuthenticationResolver,
  EnumResolver,
  OrganizationResolver,
  PostResolver,
  QueryResolver,
  TeamResolver,
  UserResolver
} from '../resolvers'
import { RequestContext } from '../types'

@injectable()
export class ApolloServerFactory {
  constructor(
    private readonly authenticationResolver: AuthenticationResolver,
    private readonly enumResolver: EnumResolver,
    private readonly organizationResolver: OrganizationResolver,
    private readonly postResolver: PostResolver,
    private readonly queryResolver: QueryResolver,
    private readonly teamResolver: TeamResolver,
    private readonly userResolver: UserResolver
  ) {}

  async build(): Promise<ApolloServer<RequestContext>> {
    const typeDefs = String(
      await readFile(resolve(__dirname, '../graphql/schema.gql'))
    )

    return new ApolloServer({
      typeDefs,
      resolvers: [
        this.authenticationResolver.resolvers,
        this.enumResolver.resolvers,
        this.organizationResolver.resolvers,
        this.queryResolver.resolvers,
        this.postResolver.resolvers,
        this.teamResolver.resolvers,
        this.userResolver.resolvers
      ]
    })
  }
}
