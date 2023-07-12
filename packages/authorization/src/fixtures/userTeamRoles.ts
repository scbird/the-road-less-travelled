import { UserTeamRoles } from '@prisma/client'
import { TeamRole } from '../services/gateway/graphql'
import { acmeFinance, svelteTeam } from './teams'
import { acmeAdmin, svelteAdmin } from './users'

export const acmeFinanceAdminTeamRole: UserTeamRoles = {
  userId: acmeAdmin.id,
  teamId: acmeFinance.id,
  roles: [TeamRole.ADMIN]
}

export const svelteAdminTeamRole: UserTeamRoles = {
  userId: svelteAdmin.id,
  teamId: svelteTeam.id,
  roles: [TeamRole.ADMIN]
}

export const userTeamRoles = [acmeFinanceAdminTeamRole, svelteAdminTeamRole]
