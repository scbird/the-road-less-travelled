import { GraphQLField } from 'graphql'

export interface RequestedPathDetails {
  path: string
  possibleFields: GraphQLField<unknown, unknown>[]
}
