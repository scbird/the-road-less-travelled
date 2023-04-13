import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLAbstractType, GraphQLOutputType, isAbstractType } from 'graphql'

export function getPossibleTypes(
  requestContext: GraphQLRequestContext<BaseContext>
): (graphQLType: GraphQLOutputType) => GraphQLOutputType[]
export function getPossibleTypes<IncludeAbstract extends boolean>(
  requestContext: GraphQLRequestContext<BaseContext>,
  includeAbstractTypes: boolean
): (
  graphQLType: GraphQLOutputType
) => IncludeAbstract extends true
  ? (GraphQLAbstractType | GraphQLOutputType)[]
  : GraphQLOutputType[]

export function getPossibleTypes(
  requestContext: GraphQLRequestContext<BaseContext>,
  includeAbstractTypes = false
): (
  graphQLType: GraphQLOutputType
) => (GraphQLAbstractType | GraphQLOutputType)[] {
  return (graphqlType) => {
    if (isAbstractType(graphqlType)) {
      const result = includeAbstractTypes ? [graphqlType] : []

      return [
        ...result,
        ...requestContext.schema
          .getPossibleTypes(graphqlType)
          .flatMap(getPossibleTypes(requestContext, includeAbstractTypes))
      ]
    } else {
      return [graphqlType]
    }
  }
}
