import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { GraphQLObjectType } from 'graphql'
import { FormattedExecutionResult } from 'graphql/execution/execute'
import { OperationDefinitionNode } from 'graphql/language'
import { partition, prop, propEq } from 'ramda'
import { getOperationParentType } from '../../lib'
import { getProposedNonNullableViolations } from '../../part4_nonnullable-violations-reporter'
import { normalizeOperation } from './normalizeOperation'

export function logProposedNonNullableViolations(
  requestContext: GraphQLRequestContext<BaseContext>,
  operation: OperationDefinitionNode,
  result: FormattedExecutionResult
) {
  const proposedNonNullableViolations = getProposedNonNullableViolations(
    requestContext,
    [getOperationParentType(requestContext, operation) as GraphQLObjectType],
    operation.selectionSet,
    [],
    result.data ?? {}
  )
  const [definiteViolationPaths, possibleViolationPaths] = partition(
    propEq('isDefinite', true),
    proposedNonNullableViolations
  )

  if (proposedNonNullableViolations.length) {
    requestContext.logger.warn({
      msg: '@proposedNonNullable violation',
      operation: normalizeOperation(requestContext, operation),
      definiteViolations: definiteViolationPaths.map(prop('path')),
      possibleViolations: possibleViolationPaths.map(prop('path')),
      errors: result.errors ?? []
    })
  }
}
