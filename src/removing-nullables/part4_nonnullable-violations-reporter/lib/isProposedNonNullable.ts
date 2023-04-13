import { GraphQLField } from 'graphql'

export function isProposedNonNullable(
  field: GraphQLField<unknown, unknown>
): boolean {
  return Boolean(
    field.astNode?.directives?.some(
      (directive) => directive.name.value === 'proposedNonNullable'
    )
  )
}
