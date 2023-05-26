import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { FieldNode, SelectionSetNode } from 'graphql/language'
import { getDataProperty } from '../../lib'
import { getFields } from './getFields'

export function listFields(
  requestContext: GraphQLRequestContext<BaseContext>,
  selectionSet: SelectionSetNode,
  path: readonly string[] = []
): string[] {
  const fieldNodes = selectionSet.selections.flatMap((selection) =>
    getFields(requestContext, selection)
  )
  const branchNodes = fieldNodes.filter(({ selectionSet }) => selectionSet)
  const leafNodes = fieldNodes.filter(({ selectionSet }) => !selectionSet)

  return [
    ...branchNodes.flatMap(processBranchNode),
    ...leafNodes.map(processLeafNode)
  ]

  function processBranchNode(branchNode: FieldNode): string[] {
    return listFields(
      requestContext,
      branchNode.selectionSet as SelectionSetNode,
      [...path, getDataProperty(branchNode)]
    )
  }

  function processLeafNode(leafNode: FieldNode): string {
    return [...path, getDataProperty(leafNode)].join('.')
  }
}
