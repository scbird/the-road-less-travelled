import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { OperationDefinitionNode } from 'graphql/language'

export function getOperations(
  requestContext: GraphQLRequestContext<BaseContext>
): OperationDefinitionNode[] {
  return (requestContext.document?.definitions ?? []).filter(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === 'OperationDefinition'
  )
}
