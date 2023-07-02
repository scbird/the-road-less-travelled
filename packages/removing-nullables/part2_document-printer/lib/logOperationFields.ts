import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { OperationDefinitionNode } from 'graphql/language'
import { listFields } from './listFields'

export function logOperationFields(
  requestContext: GraphQLRequestContext<BaseContext>,
  operation: OperationDefinitionNode
) {
  requestContext.logger.info({
    name: operation.name,
    fields: listFields(requestContext, operation.selectionSet, [])
  })
}
