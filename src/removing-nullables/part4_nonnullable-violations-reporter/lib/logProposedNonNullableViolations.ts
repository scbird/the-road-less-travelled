import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLObjectType } from 'graphql'
import { OperationDefinitionNode } from 'graphql/language'
import { partition, prop, propEq } from 'ramda'
import { getOperationParentType } from '../../../lib'
import { getProposedNonNullableViolations } from './getProposedNonNullableViolations'

export function logProposedNonNullableViolations(
  requestContext: GraphQLRequestContext<BaseContext>,
  operation: OperationDefinitionNode,
  data: Record<string, unknown>
) {
  const proposedNonNullableViolations = getProposedNonNullableViolations(
    requestContext,
    [getOperationParentType(requestContext, operation) as GraphQLObjectType],
    operation.selectionSet,
    [],
    data
  )
  const [definiteViolationPaths, possibleViolationPaths] = partition(
    propEq('isDefinite', true),
    proposedNonNullableViolations
  )

  if (proposedNonNullableViolations.length) {
    requestContext.logger.info({
      msg: '@proposedNonNullable violation',
      operation: operation.name?.value,
      definiteViolations: definiteViolationPaths.map(prop('path')),
      possibleViolations: possibleViolationPaths.map(prop('path'))
    })
  }
}
