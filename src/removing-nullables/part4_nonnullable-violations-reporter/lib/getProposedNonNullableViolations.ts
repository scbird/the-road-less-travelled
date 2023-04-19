import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import {
  GraphQLAbstractType,
  GraphQLField,
  GraphQLObjectType,
  isAbstractType,
  isInterfaceType,
  isObjectType
} from 'graphql'
import { FieldNode, SelectionSetNode } from 'graphql/language'
import { anyPass, isNil, prop, uniqBy } from 'ramda'
import { getBaseType, getDataProperty, getPossibleTypes } from '../../../lib'
import { fieldIsProposedNonNullable } from './fieldIsProposedNonNullable'
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
  const allPossibleParents = possibleParents.flatMap(
    getPossibleTypes(requestContext, true)
  )
  const possibleConcreteParents = allPossibleParents
    .filter(isObjectType)
    .filter(isPossibleParent(requestContext, data))
  const possibleInterfaceParents = allPossibleParents.filter(isInterfaceType)
  const fieldNodes = selectionSet.selections
    .flatMap((selection) => getFields(requestContext, selection))
    .filter(isPossibleField(requestContext, data))
    .map(prop('fieldNode'))
    .filter((fieldNode) => fieldNode.name.value !== '__typename')
  const uniqueFieldNodes = uniqBy(getDataProperty, fieldNodes)
  const branchNodes = uniqueFieldNodes.filter(
    (fieldNode) => fieldNode.selectionSet
  )
  const leafNodes = uniqueFieldNodes.filter(
    (fieldNode) => !fieldNode.selectionSet
  )

  return [
    ...branchNodes.flatMap(processBranchNode),
    ...leafNodes.flatMap(processLeafNode)
  ]

  function processBranchNode(
    branchNode: FieldNode
  ): ProposedNonNullableViolation[] {
    const violations = processLeafNode(branchNode)
    const dataProperty = getDataProperty(branchNode)
    const value = data[dataProperty]
    const isArray = Array.isArray(value)
    const values = isArray ? value : [value]
    const possibleNodeTypes = possibleConcreteParents
      .map(getParentField(branchNode))
      .filter((value): value is GraphQLField<unknown, unknown> =>
        Boolean(value)
      )
      .map(prop('type'))
      .map(getBaseType)
      .filter(anyPass([isObjectType, isAbstractType]))
    const uniquePossibleNodeTypes = uniqBy(prop('name'), possibleNodeTypes)

    values.forEach((item, idx) => {
      if (!isNil(item)) {
        violations.push(
          ...getProposedNonNullableViolations(
            requestContext,
            uniquePossibleNodeTypes,
            branchNode.selectionSet as SelectionSetNode,
            [...path, isArray ? `${dataProperty}[${idx}]` : dataProperty],
            item as Record<string, unknown>
          )
        )
      }
    })

    return violations
  }

  function processLeafNode(
    leafNode: FieldNode
  ): ProposedNonNullableViolation[] {
    const isProposedNonNullable = [
      ...possibleInterfaceParents,
      ...possibleConcreteParents
    ].some(fieldIsProposedNonNullable(leafNode))
    const violationsAreDefinite =
      !possibleConcreteParents.some(valueCanBeNull(leafNode)) ||
      (possibleInterfaceParents.length > 0 &&
        !possibleInterfaceParents.some(valueCanBeNull(leafNode)))

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
