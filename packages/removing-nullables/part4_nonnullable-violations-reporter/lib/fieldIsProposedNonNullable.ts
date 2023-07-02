import { FieldNode } from 'graphql/language'
import {
  GraphQLInterfaceType,
  GraphQLObjectType
} from 'graphql/type/definition'
import { isProposedNonNullable } from './isProposedNonNullable'

export function fieldIsProposedNonNullable(
  fieldNode: FieldNode
): (parent: GraphQLObjectType | GraphQLInterfaceType) => boolean {
  return (parent) => {
    const parentField = parent.getFields()[fieldNode.name.value]

    return parentField && isProposedNonNullable(parentField)
  }
}
