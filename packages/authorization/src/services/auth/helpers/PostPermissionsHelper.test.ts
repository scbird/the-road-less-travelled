import { PrismaClient, TeamRole } from '@prisma/client'
import { PostPermission, TeamPermission } from '../permissions'
import { PostPermissionsHelper } from './PostPermissionsHelper'

describe('PostPermissionsHelper', () => {
  const orgId = 'pph-org'
  const team1Id = 'pph-team1'
  const team2Id = 'pph-team2'
  const user1Id = 'pph-user1'
  const user2Id = 'pph-user2'
  const post1Id = 'pph-post1'
  const post2Id = 'pph-post2'

  let prisma: PrismaClient
  let postPermissionsHelper: PostPermissionsHelper

  beforeAll(async () => {
    // Even though PostPermissionsHelper doesn't access the database itself
    // we run the filters against the database to ensure that our filters actually
    // return the results we expect they will
    prisma = new PrismaClient()

    await prisma.organization.createMany({
      data: [{ id: orgId, name: 'Org 1' }],
      skipDuplicates: true
    })
    await prisma.team.createMany({
      data: [
        { id: team1Id, organizationId: orgId, name: 'Team 1' },
        { id: team2Id, organizationId: orgId, name: 'Team 2' }
      ],
      skipDuplicates: true
    })
    await prisma.user.createMany({
      data: [
        {
          id: user1Id,
          name: 'User 1',
          email: 'user1@example.com',
          passwordHash: 'abc'
        },
        {
          id: user2Id,
          name: 'User 2',
          email: 'user2@example.com',
          passwordHash: 'abc'
        }
      ],
      skipDuplicates: true
    })
    await prisma.userTeamRoles.createMany({
      data: [{ userId: user1Id, teamId: team1Id, roles: [TeamRole.VIEWER] }],
      skipDuplicates: true
    })
    await prisma.post.deleteMany({
      where: { teamId: { in: [team1Id, team2Id] } }
    })
    await prisma.post.createMany({
      data: [
        {
          id: post1Id,
          published: false,
          title: "User's own post",
          teamId: team1Id,
          sharedWith: [],
          authorId: user1Id
        },
        {
          id: post2Id,
          published: false,
          title: "Someone else's unpublished post",
          teamId: team1Id,
          sharedWith: [],
          authorId: user2Id
        }
      ]
    })
  })

  beforeEach(() => {
    postPermissionsHelper = new PostPermissionsHelper()
  })

  afterAll(async () => {
    prisma.$disconnect()
  })

  it('should correctly filter posts', async () => {
    const permissions = {
      userId: user1Id,
      teams: { [team1Id]: [TeamPermission.VIEW_POSTS] },
      organizations: {}
    }
    const allPosts = await prisma.post.findMany({
      where: { teamId: { in: [team1Id, team2Id] } },
      orderBy: { id: 'asc' }
    })
    const visiblePosts = await prisma.post.findMany({
      where: postPermissionsHelper.getFilter(permissions),
      orderBy: { id: 'asc' }
    })
    const expectedVisiblePosts = allPosts.filter((post) => {
      return postPermissionsHelper.can(permissions, PostPermission.VIEW, post)
    })

    expect(visiblePosts).toEqual(expectedVisiblePosts)
  })
})
