import { config } from 'dotenv'
import { PrismaClient } from 'generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process' // roda comando no terminal
import Redis from 'ioredis'
import { envSchema } from '@/infra/env/env'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })
const env = envSchema.parse(process.env)
if (!env.DATABASE_URL || !env.DATABASE_SCHEMA) {
  throw new Error(
    'Please provider a DATABASE_URL env variable pointing to a test database',
  )
}
let prisma: PrismaClient
let redis: Redis

function generateUniqueDatabaseURL(schemaId: string) {
  const url = new URL(env.DATABASE_URL!)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)
  env.DATABASE_URL = databaseURL
  env.DATABASE_SCHEMA = schemaId

  const adapter = new PrismaPg({ connectionString: databaseURL })
  prisma = new PrismaClient({ adapter })
  redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB,
    password: env.REDIS_PASSWORD,
  })
  await redis.flushdb() // limpa o banco de dados do Redis antes de rodar os testes
  execSync(`pnpm prisma migrate deploy`)
}, 30000)

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
  await redis.quit()
})
