import { PrismaClient, User } from '@prisma/client'
import { compare, hash } from 'bcrypt'
import { serialize } from 'cookie'
import { Response } from 'express'
import { GraphQLError } from 'graphql/error'
import { inject, injectable } from 'tsyringe'
import { SESSION_COOKIE_NAME, SESSION_EXPIRY } from '../config'
import { Resolvers } from '../graphql'
import { SessionHelper } from '../helpers'

@injectable()
export class AuthenticationResolver {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly sessionHelper: SessionHelper,
    @inject(SESSION_COOKIE_NAME)
    private readonly sessionCookieName: string,
    @inject(SESSION_EXPIRY)
    private readonly sessionExpiry: string
  ) {}

  resolvers: Resolvers = {
    Mutation: {
      login: async (
        _,
        { input: { email, password } },
        { res }
      ): Promise<User> => {
        const user = await this.prisma.user.findFirst({ where: { email } })
        const passwordMatches =
          user && (await compare(password, user.passwordHash))

        if (passwordMatches) {
          return this.logUserIn(user, res)
        } else {
          throw new GraphQLError('Incorrect email or password', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
      },

      registerUser: async (
        _,
        { input: { email, password, name } }
      ): Promise<User> => {
        return this.prisma.user.create({
          data: {
            email,
            passwordHash: await hash(password, 10),
            name
          }
        })
      }
    }
  }

  private async logUserIn(user: User, res: Response): Promise<User> {
    const sessionId = this.sessionHelper.createSession(user)

    res.setHeader(
      'set-cookie',
      serialize(this.sessionCookieName, sessionId, {
        httpOnly: true,
        sameSite: 'strict'
      })
    )

    return user
  }
}
