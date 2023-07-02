import { GraphQLField, GraphQLList, isListType, isNullableType } from 'graphql'
import { GraphQLType } from 'graphql/type/definition'
import { groupBy, prop } from 'ramda'
import { RequestedPathDetails } from '../../part3_types-printer'
import { PathToCheck } from './types'

export function getPathsToCheck(
  requestedPathDetails: readonly RequestedPathDetails[]
): PathToCheck[] {
  const requestedPathDetailsByPath = groupBy(prop('path'), requestedPathDetails)

  return Object.values(requestedPathDetailsByPath)
    .map(combineRequestedPathDetails)
    .map(removeNonNullableFields)
    .map(computePathsToCheck)
    .filter(isPathToCheck)
}

function combineRequestedPathDetails(
  requestedPathDetails: readonly RequestedPathDetails[]
): RequestedPathDetails {
  return {
    path: requestedPathDetails[0].path,
    possibleFields: requestedPathDetails.flatMap(prop('possibleFields'))
  }
}

function removeNonNullableFields(
  requestedPathDetails: RequestedPathDetails
): RequestedPathDetails {
  return {
    path: requestedPathDetails.path,
    possibleFields: requestedPathDetails.possibleFields.filter(
      isNullable
    ) as GraphQLField<unknown, unknown>[]
  }
}

function computePathsToCheck(
  requestedPathDetails: RequestedPathDetails
): PathToCheck | null {
  const hasProposedNonNullableFields = requestedPathDetails.possibleFields.some(
    isProposedNonNullable
  )
  const hasAllowedNullableFields = !requestedPathDetails.possibleFields.every(
    isProposedNonNullable
  )

  if (!hasProposedNonNullableFields) {
    return null
  } else {
    return {
      path: requestedPathDetails.path,
      violationsAreDefinite: !hasAllowedNullableFields
    }
  }
}

function isProposedNonNullable(field: GraphQLField<unknown, unknown>): boolean {
  return Boolean(
    field.astNode?.directives?.some(
      (directive) => directive.name.value === 'proposedNonNullable'
    )
  )
}

function isNullable({ type }: GraphQLField<unknown, unknown>): boolean {
  return (
    isNullableType(type) ||
    (isListType(type) &&
      isNullableType((type as GraphQLList<GraphQLType>).ofType))
  )
}

function isPathToCheck(obj: PathToCheck | null): obj is PathToCheck {
  return Boolean(obj)
}
