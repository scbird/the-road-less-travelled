import { BaseContext, GraphQLRequestContext } from '@apollo/server'
import { loadFiles } from '@graphql-tools/load-files'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { DocumentNode } from 'graphql/language'
import { GraphQLObjectType } from 'graphql/type/definition'
import { resolve } from 'path'
import { ascend, prop, uniq } from 'ramda'
import { getOperationParentType, getOperations } from '../../lib'
import { listFields } from './listFields'

test('listFields()', async () => {
  const typeDefs = await loadFiles(resolve(__dirname, '../../test/schema.gql'))
  const [document] = (await loadFiles(
    resolve(__dirname, '../../test/request.gql')
  )) as [DocumentNode]
  const schema = makeExecutableSchema({ typeDefs })
  const requestContext = {
    schema,
    document
  } as GraphQLRequestContext<BaseContext>
  const [operation] = getOperations(requestContext)
  const operationParent = getOperationParentType(
    requestContext,
    operation
  ) as GraphQLObjectType

  const fields = listFields(
    requestContext,
    [operationParent],
    operation.selectionSet
  )
  const serializedFields = fields.map((requestedField) => {
    return {
      path: requestedField.path,
      possibleTypes: uniq(
        requestedField.possibleFields.map((possibleField) =>
          possibleField.type.toString()
        )
      )
    }
  })

  expect(serializedFields.sort(ascend(prop('path')))).toEqual([
    { path: 'media', possibleTypes: ['[Media!]!'] },
    { path: 'media.author', possibleTypes: ['Person!'] },
    { path: 'media.author.name', possibleTypes: ['String!'] },
    { path: 'media.bookName', possibleTypes: ['String!'] },
    { path: 'media.movieName', possibleTypes: ['String!'] }
  ])
})
