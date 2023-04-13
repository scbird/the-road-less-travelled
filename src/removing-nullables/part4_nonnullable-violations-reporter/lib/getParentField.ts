import { GraphQLField } from 'graphql'
import { FieldNode } from 'graphql/language'
import {
  GraphQLInterfaceType,
  GraphQLObjectType
} from 'graphql/type/definition'

export function getParentField(
  fieldNode: FieldNode
): (
  parent: GraphQLObjectType | GraphQLInterfaceType
) => GraphQLField<any, any> | undefined {
  return (parent) => parent.getFields()[fieldNode.name.value]
}
