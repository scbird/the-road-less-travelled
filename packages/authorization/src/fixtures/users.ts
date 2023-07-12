import { User, SiteRole } from '@prisma/client'
import { hashSync } from 'bcrypt'

const passwordHash = hashSync('abc123', 10)

export const siteAdmin: User = {
  id: 'siteAdmin',
  name: 'Site admin',
  email: 'admin@site.com',
  passwordHash,
  siteRoles: [SiteRole.ADMIN]
}

export const acmeAdmin: User = {
  id: 'acmeAdmin',
  name: 'ACME admin',
  email: 'admin@acme.com',
  passwordHash,
  siteRoles: []
}

export const svelteAdmin: User = {
  id: 'svelteAdmin',
  name: 'Svelte admin',
  email: 'admin@svelte.com',
  passwordHash,
  siteRoles: []
}

export const users = [siteAdmin, acmeAdmin, svelteAdmin]
