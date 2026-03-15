import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import z from 'zod'
import { EnvService } from '../env/env.service'

const userPayloadSchema = z.object({
  sub: z.uuid(),
})

export type UserPayload = z.infer<typeof userPayloadSchema>

// Estratégia JWT: extrai o Bearer token, valida RS256 com
// a chave pública do env e parseia o payload (Zod),
// retornando-o para popular req.user nas rotas protegidas.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: UserPayload) {
    return userPayloadSchema.parse(payload)
  }
}
