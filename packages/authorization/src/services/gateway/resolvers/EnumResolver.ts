import { TeamRole } from '@prisma/client'
import { injectable } from 'tsyringe'
import { OrgRole, Resolvers } from '../graphql'

@injectable()
export class EnumResolver {
  resolvers: Resolvers = {
    OrgRole,
    TeamRole
  }
}
