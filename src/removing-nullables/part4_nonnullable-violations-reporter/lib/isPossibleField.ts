import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLObjectType } from 'graphql/type/definition'
import { RequestedField } from './getFields'
import { isPossibleParent } from './isPossibleParent'

export function isPossibleField(
  requestContext: GraphQLRequestContext<BaseContext>,
  data: { __typename?: string }
): (requestedField: RequestedField) => boolean {
  return (requestedField) => {
    if (!requestedField.parent) {
      return true
    } else {
      const parentType = requestContext.schema.getType(
        requestedField.parent
      ) as GraphQLObjectType

      return isPossibleParent(requestContext, data)(parentType)
    }
  }
}
