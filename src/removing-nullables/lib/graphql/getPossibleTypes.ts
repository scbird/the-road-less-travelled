import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLAbstractType, GraphQLObjectType, isAbstractType } from 'graphql'

export function getPossibleTypes(
  requestContext: GraphQLRequestContext<BaseContext>
): (
  graphQLType: GraphQLAbstractType | GraphQLObjectType
) => GraphQLObjectType[] {
  return (graphqlType) => {
    if (isAbstractType(graphqlType)) {
      return requestContext.schema
        .getPossibleTypes(graphqlType)
        .flatMap(getPossibleTypes(requestContext))
    } else {
      return [graphqlType]
    }
  }
}
