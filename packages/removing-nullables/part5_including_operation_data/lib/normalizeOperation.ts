import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import {
  FieldNode,
  Kind,
  OperationDefinitionNode,
  ValueNode
} from 'graphql/language'
import { prop } from 'ramda'
import { getFields } from '../../part4_nonnullable-violations-reporter'

export interface Operation {
  type: string
  operationName: string | undefined
  fields: OperationField[]
}

export interface OperationField {
  field: string
  alias: string | null
  arguments: Record<string, unknown>
}

export function normalizeOperation(
  requestContext: GraphQLRequestContext<BaseContext>,
  operation: OperationDefinitionNode
): Operation {
  const fields = operation.selectionSet.selections
    .flatMap((selectionNode) => getFields(requestContext, selectionNode))
    .map(prop('fieldNode'))

  return {
    operationName: operation.name?.value,
    type: operation.operation,
    fields: fields.map(normalizeOperationField(requestContext))
  }
}

function normalizeOperationField(
  requestContext: GraphQLRequestContext<BaseContext>
): (field: FieldNode) => OperationField {
  return (field) => {
    const normalizedArgumentsArr = field.arguments?.map((argument) => [
      argument.name.value,
      normalizeArgumentValue(requestContext, argument.value)
    ])

    return {
      alias: field.alias?.value ?? null,
      field: field.name.value,
      arguments: Object.fromEntries(normalizedArgumentsArr ?? [])
    }
  }
}

function normalizeArgumentValue(
  requestContext: GraphQLRequestContext<BaseContext>,
  value: ValueNode
): unknown {
  switch (value.kind) {
    case Kind.NULL:
      return null
    case Kind.LIST:
      return value.values.map((itemValue) =>
        normalizeArgumentValue(requestContext, itemValue)
      )
    case Kind.OBJECT:
      return Object.fromEntries(
        value.fields.map((fieldValue) => {
          return [
            fieldValue.name.value,
            normalizeArgumentValue(requestContext, fieldValue.value)
          ]
        })
      )
    case Kind.VARIABLE:
      return requestContext.request.variables?.[value.name.value]
    case Kind.INT:
      return Number(value.value)
    case Kind.FLOAT:
      return Number(value.value)
    default:
      return value.value
  }
}
