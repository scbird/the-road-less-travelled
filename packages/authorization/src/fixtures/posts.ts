import { Post } from '@prisma/client'
import { svelteTeam } from './teams'
import { svelteAdmin } from './users'

export const theImportanceOfBeingEarnest: Post = {
  id: 'theImportanceOfBeingEarnest',
  title: 'The importance of being Earnest',
  authorId: svelteAdmin.id,
  published: true,
  teamId: svelteTeam.id,
  sharedWith: [],
  content: ''
}

export const posts = [theImportanceOfBeingEarnest]
