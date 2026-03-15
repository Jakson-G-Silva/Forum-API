import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from 'generated/prisma/client'
import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(ConfigService) config: EnvService) {
    const databaseUrl = config.get('DATABASE_URL')
    const databaseSchema = config.get('DATABASE_SCHEMA')
    const adapter = new PrismaPg(
      { connectionString: databaseUrl },
      { schema: databaseSchema },
    )

    super({ adapter, log: ['warn', 'error'] }) // construtor da classe extendida prismaClient
  }

  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
