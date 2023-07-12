import { Team } from '@prisma/client'
import { acme, svelte } from './organizations'

export const acmeAccounting: Team = {
  id: 'acmeAccounting',
  name: 'Accounting',
  organizationId: acme.id
}

export const acmeFinance: Team = {
  id: 'acmeFinance',
  name: 'Finance',
  organizationId: acme.id
}

export const svelteTeam: Team = {
  id: 'svelteTeam',
  name: 'Everyone',
  organizationId: svelte.id
}

export const teams = [acmeAccounting, acmeFinance, svelteTeam]
