import { FieldNode } from 'graphql/language'

export function getDataProperty(fieldNode: FieldNode): string {
  return (fieldNode.alias ?? fieldNode.name).value
}
