import {
  ApolloServer,
  BaseContext,
  GraphQLRequestContext
} from '@apollo/server'
import { loadFiles } from '@graphql-tools/load-files'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolve } from 'path'
import { pino } from 'pino'
import { ProposedNonNullableViolationsLogger } from './ProposedNonNullableViolationsLogger'

describe('ProposedNonNullableViolationReporter v2', () => {
  const logger = pino({ enabled: false })
  const resolvers = {
    nullableResponse: jest.fn(),
    nonNullableResponse: jest.fn()
  }
  let apolloServer: ApolloServer<GraphQLRequestContext<BaseContext>>

  beforeAll(async () => {
    const [typeDefs] = await loadFiles(
      resolve(
        __dirname,
        '../part4_nonnullable-violations-reporter/fixtures/proposedNonNullableSchema.gql'
      )
    )
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: { Query: resolvers }
    })

    jest.spyOn(logger, 'warn')

    const proposedNonNullableViolationsReporter =
      new ProposedNonNullableViolationsLogger()
    apolloServer = new ApolloServer({
      schema,
      logger,
      plugins: [proposedNonNullableViolationsReporter]
    })
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should log the operation details', async () => {
    resolvers.nonNullableResponse.mockResolvedValue({
      union: [null, { __typename: 'UnionType1' }, { __typename: 'UnionType2' }]
    })

    await apolloServer.executeOperation({
      query: `query test ($float: Float) {
        nonNullableResponse(input: {
          int: 33
          float: 55.5
          input: {
            list: [{string: "Hi there"}]
            float: $float
            input: null
          }
        }) {
          union {
            __typename
            ...on UnionType1 {
              name
            }
            ...on UnionType2 {
              name
            }
          }
        }
      }`,
      variables: { float: 3.14 }
    })

    expect(logger.warn).toHaveBeenCalledWith({
      msg: '@proposedNonNullable violation',
      operation: {
        fields: [
          {
            arguments: {
              input: {
                int: 33,
                float: 55.5,
                input: {
                  input: null,
                  float: 3.14,
                  list: [{ string: 'Hi there' }]
                }
              }
            },
            field: 'nonNullableResponse',
            alias: null
          }
        ],
        operationName: 'test',
        type: 'query'
      },
      definiteViolations: [
        'nonNullableResponse.union[0]',
        'nonNullableResponse.union[1].name'
      ],
      possibleViolations: [],
      errors: []
    })
  })
})
