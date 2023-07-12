import { User } from '@prisma/client'
import { Authenticator, Passport } from 'passport'
import { Strategy as AnonymousStrategy } from 'passport-anonymous'
import { Strategy as CookieStrategy } from 'passport-cookie'
import { inject, injectable } from 'tsyringe'

import { SESSION_COOKIE_NAME } from '../config'
import { SessionHelper } from './SessionHelper'

@injectable()
export class PassportFactory {
  constructor(
    @inject(SESSION_COOKIE_NAME)
    private readonly cookieName: string,
    private readonly sessionHelper: SessionHelper
  ) {}

  build(): Authenticator {
    const passport = new Passport()
    passport.use(this.createCookieStrategy())
    passport.use(new AnonymousStrategy())

    // Work around passport typing bug,
    // see https://stackoverflow.com/questions/68971291/passport-authenticator-complains-of-that-this-could-be-instantiated-with-an-ar
    return passport as any
  }

  private createCookieStrategy() {
    return new CookieStrategy(
      { cookieName: this.cookieName },
      this.verifyToken.bind(this)
    )
  }

  private async verifyToken(
    token: string,
    cb: (err: Error | null, user?: User | false) => any
  ) {
    try {
      const user = await this.sessionHelper.getUser(token)

      cb(null, user ?? false)
    } catch (e) {
      cb(e as Error)
    }
  }
}
