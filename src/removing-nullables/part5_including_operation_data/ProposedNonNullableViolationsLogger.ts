import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
  GraphQLRequestListener
} from '@apollo/server'
import { GraphQLServerContext } from '@apollo/server/dist/esm/externalTypes/plugins'
import { GraphQLError } from 'graphql/error'
import { getOperations } from '../../lib'
import { checkInterfaces, logProposedNonNullableViolations } from './lib'

export class ProposedNonNullableViolationsLogger implements ApolloServerPlugin {
  async serverWillStart({ schema }: GraphQLServerContext) {
    const problems = checkInterfaces(schema)

    if (problems.length) {
      throw new GraphQLError(`Invalid schema: ${problems.join(', ')}`)
    }
  }

  async requestDidStart(): Promise<
    GraphQLRequestListener<GraphQLRequestContext<BaseContext>>
  > {
    return {
      willSendResponse: async (
        requestContext: GraphQLRequestContext<BaseContext>
      ) => {
        const responseBody = requestContext.response.body
        if (responseBody?.kind !== 'single') {
          return
        }

        const operations = getOperations(requestContext)
        operations.forEach((operation) =>
          logProposedNonNullableViolations(
            requestContext,
            operation,
            responseBody.singleResult
          )
        )
      }
    }
  }
}
