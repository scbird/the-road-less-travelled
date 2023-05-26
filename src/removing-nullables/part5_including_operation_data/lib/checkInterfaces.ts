import {
  GraphQLField,
  GraphQLObjectType,
  isInterfaceType,
  isNullableType
} from 'graphql'
import { GraphQLSchema } from 'graphql/type'
import { GraphQLInterfaceType } from 'graphql/type/definition'
import { isProposedNonNullable } from '../../part4_nonnullable-violations-reporter/lib/isProposedNonNullable'

export function checkInterfaces(schema: GraphQLSchema) {
  const interfaces = Object.values(schema.getTypeMap()).filter(isInterfaceType)

  return interfaces.flatMap(getInterfaceProblems(schema))
}

function getInterfaceProblems(
  schema: GraphQLSchema
): (interfaceType: GraphQLInterfaceType) => string[] {
  return (interfaceType) => {
    const proposedNonNullableFields = Object.values(
      interfaceType.getFields()
    ).filter(isProposedNonNullable)

    return proposedNonNullableFields.flatMap(
      getInterfaceFieldProblems(schema, interfaceType)
    )
  }
}

function getInterfaceFieldProblems(
  schema: GraphQLSchema,
  interfaceType: GraphQLInterfaceType
): (field: GraphQLField<unknown, unknown>) => string[] {
  const implementations = schema.getImplementations(interfaceType)
  const allImplementations = [
    ...implementations.objects,
    ...implementations.interfaces
  ]

  return (field) =>
    getProblemsForField(interfaceType, allImplementations, field)
}

function getProblemsForField(
  interfaceType: GraphQLInterfaceType,
  implementations: readonly (GraphQLInterfaceType | GraphQLObjectType)[],
  field: GraphQLField<unknown, unknown>
): string[] {
  const problems: string[] = []

  for (const implementationType of implementations) {
    const implementationField = implementationType.getFields()[field.name]

    if (
      isNullableType(implementationField.type) &&
      !isProposedNonNullable(implementationField)
    ) {
      problems.push(
        `${implementationType.name}.${implementationField.name} must be @proposedNonNullable because ${interfaceType.name}.${field.name} is`
      )
    }
  }

  return problems
}
