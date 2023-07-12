import { Server } from 'http'
import { inject, injectable } from 'tsyringe'
import { Logger } from '../../common'
import { PORT } from './config'
import { AppFactory } from './helpers/AppFactory'

@injectable()
export class GatewayService {
  private server?: Server

  constructor(
    private readonly appFactory: AppFactory,
    private readonly logger: Logger,
    @inject(PORT)
    private readonly port: number
  ) {}

  async start(): Promise<void> {
    const app = await this.appFactory.build()

    await new Promise<void>((resolve, reject) => {
      this.server = app.listen(this.port, resolve)
      this.server.on('error', reject)
    })

    this.logger.info(`Application running at http://localhost:${this.port}`)
  }

  stop() {
    this.server?.close()
  }
}
