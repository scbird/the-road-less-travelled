import { Organization } from '@prisma/client'

export const acme: Organization = {
  id: 'acme',
  name: 'ACME'
}

export const svelte: Organization = {
  id: 'svelte',
  name: 'Svelte Designs'
}

export const organizations = [acme, svelte]
