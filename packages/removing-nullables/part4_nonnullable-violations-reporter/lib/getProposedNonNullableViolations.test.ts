import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { loadFiles } from '@graphql-tools/load-files'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLObjectType, OperationDefinitionNode } from 'graphql'
import { resolve } from 'path'
import { ascend, prop } from 'ramda'
import { getOperationParentType, getOperations } from '../../lib'
import { getProposedNonNullableViolations } from './getProposedNonNullableViolations'

describe('getProposedNonNullableViolations', () => {
  let requestContext: GraphQLRequestContext<BaseContext>
  let operationsByName: Record<string, OperationDefinitionNode>

  beforeAll(async () => {
    const [typeDefs] = await loadFiles(
      resolve(__dirname, '../fixtures/proposedNonNullableSchema.gql')
    )
    const [document] = await loadFiles(
      resolve(__dirname, '../fixtures/proposedNonNullableRequest.gql')
    )
    const schema = makeExecutableSchema({ typeDefs })
    requestContext = { schema, document } as GraphQLRequestContext<BaseContext>

    const operations = getOperations(requestContext)
    operationsByName = Object.fromEntries(
      operations.map((operation) => [operation.name?.value ?? '', operation])
    )
  })

  it.each([
    // No warning because null responses are allowed
    ['nullableResponse', undefined, []],
    // Violation because this query doesn't allow null responses
    [
      'nonNullableResponse',
      null,
      [
        {
          path: 'nonNullableResponse',
          isDefinite: true
        }
      ]
    ],
    // Violation because some of the response fields are null
    [
      'nonNullableResponse',
      {},
      [
        {
          path: 'nonNullableResponse.proposedNonNullableField',
          isDefinite: true
        },
        {
          path: 'nonNullableResponse.union',
          isDefinite: true
        },
        {
          path: 'nonNullableResponse.unionAlias',
          isDefinite: true
        }
      ]
    ],
    // No violations because the response is valid
    [
      'nonNullableResponse',
      {
        proposedNonNullableField: 'test1',
        union: [{ __typename: 'UnionType1', name: 'book' }]
      },
      [
        {
          path: 'nonNullableResponse.unionAlias',
          isDefinite: true
        }
      ]
    ],
    // No violations because the response is valid (empty arrays are allowed)
    [
      'nonNullableResponse',
      { proposedNonNullableField: 'test2', union: [], unionAlias: [] },
      []
    ],
    // Violation because union[0].name is null
    [
      'nonNullableResponse',
      {
        proposedNonNullableField: 'test3',
        union: [{ __typename: 'UnionType1' }],
        unionAlias: [{ __typename: 'UnionType1' }]
      },
      [
        {
          path: 'nonNullableResponse.unionAlias[0].name',
          isDefinite: true
        },
        {
          path: 'nonNullableResponse.union[0].name',
          isDefinite: true
        }
      ]
    ],
    // No violation because name is nullable on UnionType2
    [
      'nonNullableResponse',
      {
        proposedNonNullableField: 'test4',
        union: [{ __typename: 'UnionType2', proposedNonNullableField: 'hi' }],
        unionAlias: [
          { __typename: 'UnionType2', proposedNonNullableField: 'hi' }
        ]
      },
      []
    ],
    // Possible Violation because name is nullable if the object is a UnionType2
    [
      'nonNullableResponse',
      {
        proposedNonNullableField: 'test5',
        union: [{}],
        unionAlias: [{}]
      },
      [
        {
          path: 'nonNullableResponse.unionAlias[0].name',
          isDefinite: false
        },
        {
          path: 'nonNullableResponse.unionAlias[0].proposedNonNullableField',
          isDefinite: false
        },
        {
          path: 'nonNullableResponse.union[0].name',
          isDefinite: false
        },
        {
          path: 'nonNullableResponse.union[0].proposedNonNullableField',
          isDefinite: false
        }
      ]
    ],
    // Violation because union[0] is null
    [
      'nonNullableResponse',
      { proposedNonNullableField: 'test6', union: [null], unionAlias: [null] },
      [
        {
          path: 'nonNullableResponse.unionAlias[0]',
          isDefinite: true
        },
        {
          path: 'nonNullableResponse.union[0]',
          isDefinite: true
        }
      ]
    ],
    [
      'combinedSelectionSets',
      { interface: {} },
      [
        {
          path: 'combinedSelectionSets.interface.definiteNonNullableField',
          isDefinite: true
        },
        {
          path: 'combinedSelectionSets.interface.possibleNonNullableField',
          isDefinite: false
        }
      ]
    ]
  ])(
    'should correctly return the violation (%s: %p)',
    (operationName, responseData, expectedViolations) => {
      const operation = operationsByName[operationName]
      const operationParentType = getOperationParentType(
        requestContext,
        operation
      ) as GraphQLObjectType
      const violations = getProposedNonNullableViolations(
        requestContext,
        [operationParentType],
        operation.selectionSet,
        [],
        { [operationName]: responseData }
      ).sort(ascend(prop('path')))

      expect(violations).toEqual(expectedViolations)
    }
  )
})
