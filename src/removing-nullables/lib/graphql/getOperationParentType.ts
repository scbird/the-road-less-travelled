import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLObjectType, OperationDefinitionNode } from 'graphql'

export function getOperationParentType(
  { schema }: GraphQLRequestContext<BaseContext>,
  operation: OperationDefinitionNode
): GraphQLObjectType | undefined {
  switch (operation.operation) {
    case 'query':
      return schema.getQueryType() ?? undefined
    case 'mutation':
      return schema.getMutationType() ?? undefined
    case 'subscription':
      return schema.getSubscriptionType() ?? undefined
    default:
      throw new Error(`Unknown operation ${operation.operation}`)
  }
}
