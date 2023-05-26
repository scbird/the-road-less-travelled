import { GraphQLRequestContext } from '@apollo/server'
import { BaseContext } from '@apollo/server/src/externalTypes/context'
import { loadFiles } from '@graphql-tools/load-files'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { DocumentNode } from 'graphql/language'
import { resolve } from 'path'
import { getOperations } from '../../lib'
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

  expect(listFields(requestContext, operation.selectionSet).sort()).toEqual([
    'media.author.name',
    'media.bookName',
    'media.movieName'
  ])
})
