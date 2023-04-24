import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
  GraphQLRequestListener
} from '@apollo/server'
import { getOperations } from '../../lib'
import { logProposedNonNullableViolations } from './lib'

export class ProposedNonNullableViolationsLogger implements ApolloServerPlugin {
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
