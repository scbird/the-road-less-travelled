import { expressMiddleware } from '@apollo/server/express4'
import { User } from '@prisma/client'
import * as bodyParser from 'body-parser'
import express, { Express } from 'express'
import { injectable } from 'tsyringe'
import { AuthService } from '../../auth'
import { RequestContext } from '../types'
import { ApolloServerFactory } from './ApolloServerFactory'
import { LoadersFactory } from './LoadersFactory'
import { PassportFactory } from './PassportFactory'
import cookieParser = require('cookie-parser')

@injectable()
export class AppFactory {
  constructor(
    private readonly apolloServerFactory: ApolloServerFactory,
    private readonly authService: AuthService,
    private readonly loadersFactory: LoadersFactory,
    private readonly passportFactory: PassportFactory
  ) {}

  async build(): Promise<Express> {
    const app = express()
    const passport = this.passportFactory.build()
    const apolloServer = await this.apolloServerFactory.build()

    await apolloServer.start()

    app.use(cookieParser())
    app.use(passport.initialize())
    app.use(
      passport.authenticate(['cookie', 'anonymous'], {
        session: false
      })
    )
    app.use(bodyParser.json())
    app.use(
      expressMiddleware<RequestContext>(apolloServer, {
        context: async ({ req, res }): Promise<RequestContext> => {
          const user = req.user as User | undefined
          const permissions = await this.authService.getPermissions(user)
          const filters = await this.authService.getFilters(permissions)
          const loaders = this.loadersFactory.build(filters)
          const can = this.authService.getCan(permissions)

          return { req, res, user, permissions, can, filters, loaders }
        }
      })
    )

    return app
  }
}
