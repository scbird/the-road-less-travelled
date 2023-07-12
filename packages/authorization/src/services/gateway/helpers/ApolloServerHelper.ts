import { ApolloServer } from '@apollo/server'
import { resolve } from 'path'
import { buildSchema } from 'type-graphql'
import { Container, Service } from 'typedi'
import { OrganizationResolver, PostResolver, TeamResolver } from '../resolvers'

@Service()
export class ApolloServerHelper {
  async createApolloServer(): Promise<ApolloServer> {
    const schema = await buildSchema({
      container: Container,
      emitSchemaFile: resolve(__dirname, '../../../schema.gql'),
      resolvers: [OrganizationResolver, PostResolver, TeamResolver]
    })

    return new ApolloServer({ schema })
  }
}
