import { GraphQLRequestContext, BaseContext } from '@apollo/server'
import { GraphQLObjectType, isAbstractType, isObjectType } from 'graphql'
import { FieldNode, SelectionSetNode } from 'graphql/language'
import { anyPass, groupBy, prop, uniqBy } from 'ramda'
import { getBaseType, getDataProperty, getPossibleTypes } from '../../lib'
import { getFields } from './getFields'
import { RequestedPathDetails } from './types'

export function listFields(
  requestContext: GraphQLRequestContext<BaseContext>,
  possibleParents: readonly GraphQLObjectType[],
  selectionSet: SelectionSetNode,
  path: readonly string[] = []
): RequestedPathDetails[] {
  const allPossibleFields = possibleParents.flatMap((parent) =>
    Object.values(parent.getFields())
  )
  const allPossibleFieldsByName = groupBy(prop('name'), allPossibleFields)
  const fieldNodes = selectionSet.selections.flatMap((selection) =>
    getFields(requestContext, selection)
  )
  const branchNodes = fieldNodes.filter(({ selectionSet }) => selectionSet)
  const leafNodes = fieldNodes.filter(({ selectionSet }) => !selectionSet)

  return [
    ...branchNodes.flatMap(processBranchNode),
    ...leafNodes.map(processLeafNode)
  ]

  function processBranchNode(branchNode: FieldNode): RequestedPathDetails[] {
    const possibleNodeTypes = allPossibleFieldsByName[branchNode.name.value]
      .map(prop('type'))
      .map(getBaseType)
      .filter(anyPass([isAbstractType, isObjectType]))
      .flatMap(getPossibleTypes(requestContext))
    const uniquePossibleNodeTypes = uniqBy(prop('name'), possibleNodeTypes)
    const childPathDetails = listFields(
      requestContext,
      uniquePossibleNodeTypes,
      branchNode.selectionSet as SelectionSetNode,
      [...path, getDataProperty(branchNode)]
    )

    return [processLeafNode(branchNode), ...childPathDetails]
  }

  function processLeafNode(leafNode: FieldNode): RequestedPathDetails {
    return {
      path: [...path, getDataProperty(leafNode)].join('.'),
      possibleFields: allPossibleFieldsByName[leafNode.name.value]
    }
  }
}
