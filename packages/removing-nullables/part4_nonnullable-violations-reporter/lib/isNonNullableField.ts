import { GraphQLField, isListType, isNonNullType } from 'graphql'

export function isNonNullableField(
  field: GraphQLField<unknown, unknown>
): boolean {
  const type = field.type

  return (
    isNonNullType(type) && (!isListType(type) || isNonNullType(type.ofType))
  )
}
