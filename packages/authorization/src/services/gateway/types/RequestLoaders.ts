import { Organization, Post, Team } from '@prisma/client'
import DataLoader from 'dataloader'

export interface RequestLoaders {
  post: DataLoader<string, Post>
  team: DataLoader<string, Team>
  org: DataLoader<string, Organization>
}
