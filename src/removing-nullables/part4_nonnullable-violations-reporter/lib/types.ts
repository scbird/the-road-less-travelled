import { GraphQLField } from 'graphql'
import { GraphQLObjectType } from 'graphql/type/definition'

export interface PathToCheck {
  path: string
  violationsAreDefinite: boolean
}

export interface ProposedNonNullableViolation {
  path: string
  isDefinite: boolean
}

export interface RequestedPathDetails {
  path: string
  possibleFields: GraphQLField<unknown, unknown>[]
  parent: GraphQLObjectType
}
