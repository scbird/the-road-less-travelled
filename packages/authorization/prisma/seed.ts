import { PrismaClient } from '@prisma/client'
import {
  organizations,
  posts,
  teams,
  users,
  userTeamRoles
} from '../src/fixtures'

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})

async function seed() {
  const prisma = new PrismaClient()

  await Promise.all(
    organizations.map((organization) =>
      prisma.organization.upsert({
        where: { id: organization.id },
        create: organization,
        update: organization
      })
    )
  )

  await Promise.all(
    teams.map((team) =>
      prisma.team.upsert({
        where: { id: team.id },
        create: team,
        update: team
      })
    )
  )

  await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        where: { id: user.id },
        create: user,
        update: user
      })
    )
  )

  await Promise.all(
    userTeamRoles.map(({ userId, teamId, roles }) =>
      prisma.userTeamRoles.upsert({
        where: { userId_teamId: { userId, teamId } },
        create: { userId, teamId, roles },
        update: { userId, teamId, roles }
      })
    )
  )

  await Promise.all(
    posts.map((post) =>
      prisma.post.upsert({
        where: { id: post.id },
        create: post,
        update: post
      })
    )
  )
}
