import { PrismaClient } from '@prisma/client'
import { container } from 'tsyringe'
import { Logger } from './common'

export function init() {
  container.register(Logger, {
    useValue: new Logger({ level: process.env.LOG_LEVEL ?? 'info' })
  })
  container.register(PrismaClient, { useValue: new PrismaClient() })
}
