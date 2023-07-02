import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLObjectType } from 'graphql/type/definition'
import { isNil } from 'ramda'

export function isPossibleParent(
  requestContext: GraphQLRequestContext<BaseContext>,
  data: { __typename?: string }
): (parent: GraphQLObjectType) => boolean {
  return (parent) => {
    return isNil(data.__typename) || parent.name === data.__typename
  }
}
