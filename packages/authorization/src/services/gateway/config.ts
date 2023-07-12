import { container } from 'tsyringe'

export const SESSION_COOKIE_NAME = 'gateway.session cookie name'
container.register(SESSION_COOKIE_NAME, {
  useValue: process.env.SESSION_COOKIE_NAME
})

export const SESSION_SECRET = 'gateway.session secret'
container.register(SESSION_SECRET, { useValue: process.env.SESSION_SECRET })

export const SESSION_EXPIRY = 'gateway.session expiry'
container.register(SESSION_EXPIRY, {
  useValue: process.env.SESSION_EXPIRY ?? '1w'
})

export const PORT = 'gateway.port'
container.register(PORT, { useValue: Number(process.env.PORT ?? '8000') })
