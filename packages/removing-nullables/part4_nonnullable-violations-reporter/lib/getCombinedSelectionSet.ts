import { FieldNode, SelectionSetNode } from 'graphql/language'
import { Kind } from 'graphql/language/kinds'

export function getCombinedSelectionSet(
  fieldNodes: readonly FieldNode[]
): SelectionSetNode {
  const selections = fieldNodes.flatMap(
    (fieldNode) => fieldNode.selectionSet?.selections ?? []
  )

  return { kind: Kind.SELECTION_SET, selections }
}
