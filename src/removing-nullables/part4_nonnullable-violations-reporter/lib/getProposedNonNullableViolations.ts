import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import {
  GraphQLAbstractType,
  GraphQLField,
  GraphQLObjectType,
  isAbstractType,
  isObjectType
} from 'graphql'
import { FieldNode, SelectionSetNode } from 'graphql/language'
import {
  anyPass,
  groupBy,
  head,
  isNil,
  mapObjIndexed,
  prop,
  uniqBy
} from 'ramda'
import { getBaseType, getDataProperty, getPossibleTypes } from '../../lib'
import { fieldIsProposedNonNullable } from './fieldIsProposedNonNullable'
import { getCombinedSelectionSet } from './getCombinedSelectionSet'
import { getFields } from './getFields'
import { getParentField } from './getParentField'
import { isPossibleField } from './isPossibleField'
import { isPossibleParent } from './isPossibleParent'
import { ProposedNonNullableViolation } from './types'
import { valueCanBeNull } from './valueCanBeNull'

export function getProposedNonNullableViolations(
  requestContext: GraphQLRequestContext<BaseContext>,
  possibleParents: readonly (GraphQLObjectType | GraphQLAbstractType)[],
  selectionSet: SelectionSetNode,
  path: readonly string[] = [],
  data: Record<string, unknown>
): ProposedNonNullableViolation[] {
  const allPossibleParents = possibleParents
    .flatMap(getPossibleTypes(requestContext))
    .filter(isPossibleParent(requestContext, data))
  const fieldNodes = selectionSet.selections
    .flatMap((selection) => getFields(requestContext, selection))
    .filter(isPossibleField(requestContext, data))
    .map(prop('fieldNode'))
    .filter((fieldNode) => fieldNode.name.value !== '__typename')
  const fieldNodesByDataProperty = groupBy(getDataProperty, fieldNodes)
  const uniqueFieldNodes = Object.values(fieldNodesByDataProperty).map(
    head
  ) as FieldNode[]
  const selectionSetsByDataProperty = mapObjIndexed(
    getCombinedSelectionSet,
    fieldNodesByDataProperty
  )
  const uniqueBranchNodes = uniqueFieldNodes.filter(
    (fieldNode) =>
      selectionSetsByDataProperty[getDataProperty(fieldNode)].selections.length
  )

  return [
    ...uniqueFieldNodes.flatMap(getNodeViolations),
    ...uniqueBranchNodes.flatMap(processBranchNode)
  ]

  function processBranchNode(
    branchNode: FieldNode
  ): ProposedNonNullableViolation[] {
    const dataProperty = getDataProperty(branchNode)
    const value = data[dataProperty]
    const isArray = Array.isArray(value)
    const values = isArray ? value : [value]
    const possibleNodeTypes = allPossibleParents
      .map(getParentField(branchNode))
      .filter((value): value is GraphQLField<unknown, unknown> =>
        Boolean(value)
      )
      .map(prop('type'))
      .map(getBaseType)
      .filter(anyPass([isObjectType, isAbstractType]))
    const uniquePossibleNodeTypes = uniqBy(prop('name'), possibleNodeTypes)
    const violations: ProposedNonNullableViolation[] = []

    values.forEach((item, idx) => {
      if (!isNil(item)) {
        violations.push(
          ...getProposedNonNullableViolations(
            requestContext,
            uniquePossibleNodeTypes,
            selectionSetsByDataProperty[dataProperty],
            [...path, isArray ? `${dataProperty}[${idx}]` : dataProperty],
            item as Record<string, unknown>
          )
        )
      }
    })

    return violations
  }

  function getNodeViolations(
    leafNode: FieldNode
  ): ProposedNonNullableViolation[] {
    const isProposedNonNullable = allPossibleParents.some(
      fieldIsProposedNonNullable(leafNode)
    )
    const violationsAreDefinite = !allPossibleParents.some(
      valueCanBeNull(leafNode)
    )

    if (!isProposedNonNullable) {
      return []
    }

    const dataProperty = getDataProperty(leafNode)
    const value = data[dataProperty]
    const isArray = Array.isArray(value)
    const values = isArray ? value : [value]
    const violatingPaths: string[] = []

    values.forEach((item, idx) => {
      if (isNil(item)) {
        violatingPaths.push(
          [...path, isArray ? `${dataProperty}[${idx}]` : dataProperty].join(
            '.'
          )
        )
      }
    })

    return violatingPaths.map((path) => ({
      path,
      isDefinite: violationsAreDefinite
    }))
  }
}
