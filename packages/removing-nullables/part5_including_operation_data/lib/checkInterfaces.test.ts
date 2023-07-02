import { loadFiles } from '@graphql-tools/load-files'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLSchema } from 'graphql/type'
import { resolve } from 'path'
import { checkInterfaces } from './checkInterfaces'

describe('checkInterfaces', () => {
  let schema: GraphQLSchema

  beforeAll(async () => {
    const [typeDefs] = await loadFiles(
      resolve(__dirname, '../fixtures/interfaces.gql')
    )
    schema = makeExecutableSchema({
      typeDefs
    })
  })

  it('should correctly determine the missing @proposedNonNullable fields', () => {
    expect(checkInterfaces(schema)).toEqual([
      'Author.name must be @proposedNonNullable because Person.name is'
    ])
  })
})
