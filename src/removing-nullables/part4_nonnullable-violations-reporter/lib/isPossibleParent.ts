import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLObjectType } from 'graphql/type/definition'
import { always, isNil } from 'ramda'
import { getPossibleTypes } from '../../../lib'

export function isPossibleParent(
  requestContext: GraphQLRequestContext<BaseContext>,
  data: { __typename?: string }
): (parent: GraphQLObjectType) => boolean {
  if (isNil(data.__typename)) {
    return always(true)
  } else {
    return (parent) => {
      const possibleParentTypes = getPossibleTypes(requestContext)(parent)

      return possibleParentTypes.some(
        (possibleType) => possibleType.name === data.__typename
      )
    }
  }
}
