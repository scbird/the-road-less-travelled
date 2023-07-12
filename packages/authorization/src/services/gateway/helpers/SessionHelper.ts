import { PrismaClient, User } from '@prisma/client'
import { JwtPayload, sign, verify } from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'
import { SESSION_EXPIRY, SESSION_SECRET } from '../config'

@injectable()
export class SessionHelper {
  constructor(
    private readonly prisma: PrismaClient,
    @inject(SESSION_SECRET)
    private readonly secret: string,
    @inject(SESSION_EXPIRY)
    private readonly sessionExpiry: string
  ) {}

  createSession(user: User) {
    return sign({ userId: user.id }, this.secret, {
      expiresIn: this.sessionExpiry
    })
  }

  async getUser(sessionId: string): Promise<User | null> {
    const userId = this.getUserId(sessionId)

    if (userId) {
      const user = await this.prisma.user.findFirst({ where: { id: userId } })

      return user ?? null
    } else {
      return null
    }
  }

  private getUserId(sessionId: string): string | null {
    try {
      const jwt = verify(sessionId, this.secret)

      return (jwt as JwtPayload)?.userId ?? null
    } catch (e) {
      return null
    }
  }
}
