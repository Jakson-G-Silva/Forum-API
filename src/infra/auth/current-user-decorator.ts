import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserPayload } from './jwt.strategy'

// Decorator de parâmetro (@CurrentUser): lê `request.user` do contexto HTTP
// (preenchido pelo JwtAuthGuard/JwtStrategy após validar o token) e retorna
// o objeto tipado como UserPayload para injeção direta no handler, sem nova consulta.
export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.user as UserPayload
  },
)
