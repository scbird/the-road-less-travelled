import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { CanFunction, DatabaseFilters, PermissionsList } from '../../auth/types'
import { RequestLoaders } from './RequestLoaders'

export interface RequestContext {
  req: Request
  res: Response
  user?: User
  permissions: PermissionsList
  filters: DatabaseFilters
  can: CanFunction

  loaders: RequestLoaders
}
