import { isNullableType } from 'graphql'
import { FieldNode } from 'graphql/language'
import {
  GraphQLInterfaceType,
  GraphQLObjectType
} from 'graphql/type/definition'
import { isProposedNonNullable } from './isProposedNonNullable'

export function valueCanBeNull(
  fieldNode: FieldNode
): (parentType: GraphQLObjectType | GraphQLInterfaceType) => boolean {
  return (parentType) => {
    const parentField = parentType.getFields()[fieldNode.name.value]

    return (
      !parentField ||
      (isNullableType(parentField.type) && !isProposedNonNullable(parentField))
    )
  }
}
