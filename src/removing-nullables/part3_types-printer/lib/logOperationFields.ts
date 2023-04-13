import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLObjectType } from 'graphql'
import { OperationDefinitionNode } from 'graphql/language'
import { groupBy, prop, uniq } from 'ramda'
import { getOperationParentType } from '../../../lib'
import { listFields } from './listFields'
import { RequestedPathDetails } from './types'

export function logOperationFields(
  requestContext: GraphQLRequestContext<BaseContext>,
  operation: OperationDefinitionNode
) {
  const allRequestedPaths = listFields(
    requestContext,
    [getOperationParentType(requestContext, operation) as GraphQLObjectType],
    operation.selectionSet,
    []
  )
  const requestedPathsByPath: Record<string, RequestedPathDetails[]> = groupBy(
    prop('path'),
    allRequestedPaths
  )
  const uniqRequestedPaths = Object.values(requestedPathsByPath).map(
    (requestedPaths) => ({
      path: requestedPaths[0].path,
      possibleTypes: uniq(requestedPaths.flatMap(prop('type')))
    })
  )

  requestContext.logger.info({
    name: operation.name,
    fields: uniqRequestedPaths
  })
}
