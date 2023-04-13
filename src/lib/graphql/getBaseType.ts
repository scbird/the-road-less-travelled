import { GraphQLOutputType } from 'graphql'
import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType
} from 'graphql/type/definition'

export function getBaseType(
  parent: GraphQLOutputType
):
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType {
  // We can have a non-nullable list of non-nullable objects, so there may be multiple layers of ofType
  return 'ofType' in parent ? getBaseType(parent.ofType) : parent
}
