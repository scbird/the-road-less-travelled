import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  Kind,
  SelectionNode,
  SelectionSetNode
} from 'graphql/language'

export interface RequestedField {
  parent?: string
  fieldNode: FieldNode
}

/**
 * Returns the actual fields represented by the given SelectionNode,
 * dereferencing fragments
 */
export function getFields(
  requestContext: GraphQLRequestContext<BaseContext>,
  selectionNode: SelectionNode,
  parent?: string
): RequestedField[] {
  if (!requestContext.document) {
    // This is mostly to keep TypeScript happy, since the only
    // way we can obtain a selectionNode is from the request
    // context's document
    return []
  } else if (selectionNode.kind === 'Field') {
    // This node represents a normal field
    return [{ parent, fieldNode: selectionNode }]
  } else {
    // This node is a fragment, so we need to dereference it and return the fields
    // that the fragment defines
    const fragmentSelectionSet = getFragmentSelectionSet(
      requestContext.document,
      selectionNode
    )

    return fragmentSelectionSet.selectionSet.selections.flatMap(
      (fragmentSelectionNode) =>
        getFields(
          requestContext,
          fragmentSelectionNode,
          fragmentSelectionSet.parent
        )
    )
  }
}

/**
 * Returns the selection set of the given fragment
 */
function getFragmentSelectionSet(
  document: DocumentNode,
  selectionNode: FragmentSpreadNode | InlineFragmentNode
): { parent?: string; selectionSet: SelectionSetNode } {
  switch (selectionNode.kind) {
    case Kind.INLINE_FRAGMENT:
      selectionNode.typeCondition
      // Used in the case of a union or interface
      // eg: myMedia { ...on Book { author } ...on Movie { director } }
      return {
        parent: selectionNode.typeCondition?.name.value,
        selectionSet: selectionNode.selectionSet
      }
    case Kind.FRAGMENT_SPREAD:
      // A defined fragment.
      // eg: myBook { ...BookFragment }
      return {
        selectionSet: getFragment(document, selectionNode.name.value)
          .selectionSet
      }
  }
}

/**
 * Returns the definition of a fragment
 */
function getFragment(
  document: DocumentNode,
  name: string
): FragmentDefinitionNode {
  return document.definitions.find(
    (definition) =>
      definition.kind === 'FragmentDefinition' && definition.name.value === name
  ) as FragmentDefinitionNode
}
