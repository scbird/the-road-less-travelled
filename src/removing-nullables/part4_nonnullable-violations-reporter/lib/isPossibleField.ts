import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLAbstractType } from 'graphql'
import { GraphQLObjectType } from 'graphql/type/definition'
import { getPossibleTypes } from '../../lib'
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
      ) as GraphQLObjectType | GraphQLAbstractType
      const possibleParentTypes = getPossibleTypes(requestContext)(parentType)

      return possibleParentTypes.some(isPossibleParent(requestContext, data))
    }
  }
}
