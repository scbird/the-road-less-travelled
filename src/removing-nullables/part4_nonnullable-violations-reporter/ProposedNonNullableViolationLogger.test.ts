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

describe('ProposedNonNUllableViolationReporter', () => {
  const logger = pino({ enabled: false })
  const resolvers = {
    nullableResponse: jest.fn(),
    nonNullableResponse: jest.fn()
  }
  let apolloServer: ApolloServer<GraphQLRequestContext<BaseContext>>

  beforeAll(async () => {
    const [typeDefs] = await loadFiles(
      resolve(__dirname, './fixtures/proposedNonNullableSchema.gql')
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

  it('blah', async () => {
    resolvers.nonNullableResponse.mockResolvedValue({})

    await apolloServer.executeOperation({
      query: `query test {
        nonNullableResponse {
          proposedNonNullableField
        }
      }`
    })

    expect(logger.warn).toHaveBeenCalledWith({
      definiteViolations: ['nonNullableResponse.proposedNonNullableField'],
      msg: '@proposedNonNullable violation',
      operation: 'test',
      possibleViolations: [],
      errors: []
    })
  })
})
