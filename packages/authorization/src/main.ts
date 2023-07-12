import 'reflect-metadata'

import { container } from 'tsyringe'
import { init } from './init'
import { GatewayService } from './services/gateway/GatewayService'

async function main() {
  init()

  const gatewayService = container.resolve(GatewayService)
  await gatewayService.start()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
