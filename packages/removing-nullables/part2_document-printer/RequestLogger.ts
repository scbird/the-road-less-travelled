import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
  GraphQLRequestListener
} from '@apollo/server'
import { getOperations } from '../lib'
import { logOperationFields } from './lib'

/**
 * A simple Apollo Server plugin that reports the fields requested by each operation.
 * See https://scbird.hashnode.dev/creating-a-simple-apollo-server-plugin for more
 * details
 */
export class RequestLogger implements ApolloServerPlugin {
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
          logOperationFields(requestContext, operation)
        )
      }
    }
  }
}
