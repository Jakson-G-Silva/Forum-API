# NestJS Clean Architecture - Fórum de Perguntas e Respostas

## 📋 Visão Geral do Projeto

Este é um projeto completo de um **fórum de perguntas e respostas** desenvolvido com **NestJS**, seguindo rigorosamente os princípios de **Domain-Driven Design (DDD)** e **Test-Driven Development (TDD)**. O projeto foi realizado como parte do curso de Node.js da Rocketseat e serve como referência para arquitetura de software, padrões de design e boas práticas de desenvolvimento.

### Objetivo Educacional

Este projeto é tanto um **portfolio profissional** quanto um **objeto de estudo profundo**. Os conceitos implementados incluem:

- Arquitetura limpa com separação clara de responsabilidades
- DDD para modelagem de domínio complexo
- TDD para garantir confiabilidade e facilitar refatoração
- Padrões como Repository, Factory, Use Cases (Application Services)
- Tratamento de erros funcionais com Either monad
- Autenticação e autorização com JWT
- Domain Events para comunicação entre agregados
- Testes unitários, de integração e E2E

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── core/                    # Código reutilizável (núcleo da aplicação)
│   ├── either.ts           # Either monad para tratamento de erros funcionais
│   ├── entities/           # Classes base para entidades do domínio
│   ├── errors/             # Erros customizados da aplicação
│   ├── events/             # Domain events (eventos do domínio)
│   ├── repositories/       # Abstrações de repositórios
│   └── types/              # Tipos utilitários globais
│
├── domain/                 # Camada de domínio (lógica de negócio pura)
│   ├── forum/              # Subdomínio do fórum
│   │   ├── enterprise/     # Entidades e agregados (modelos de domínio)
│   │   │   └── entities/   # Question, Answer, QuestionComment, AnswerComment, etc.
│   │   └── application/    # Use cases e serviços de aplicação
│   │       ├── use-cases/  # Orquestradores de lógica: CreateQuestion, AnswerQuestion, etc.
│   │       ├── repositories/ # Interfaces de repositório
│   │       ├── cryptography/ # Abstrações de criptografia
│   │       └── storage/    # Abstrações de armazenamento de arquivos
│   │
│   └── notification/       # Subdomínio de notificações
│       ├── enterprise/     # Entidades de notificação
│       └── application/    # Use cases e serviços de notificação
│
└── infra/                  # Camada de infraestrutura (implementações)
    ├── app.module.ts       # Módulo principal da aplicação
    ├── main.ts             # Ponto de entrada da aplicação
    ├── auth/               # Estratégias de autenticação (JWT)
    ├── cache/              # Implementação de cache (Redis)
    ├── cryptography/       # Implementação de criptografia (bcrypt)
    ├── database/           # Implementação de banco de dados (Prisma)
    ├── env/                # Validação e carregamento de variáveis de ambiente
    ├── http/               # Controllers HTTP (rotas)
    ├── events/             # Implementação de event handling
    └── storage/            # Implementação de armazenamento (AWS S3)

test/
├── factories/              # Factory Pattern para criar entidades em testes
├── repositories/           # Repositórios em memória para testes
├── criptography/           # Implementações fake para testes
├── storage/                # Implementações fake para testes
├── e2e/                    # Testes end-to-end
└── utils/                  # Utilitários para testes
```

### Padrão de Camadas (Clean Architecture)

O projeto segue a **Clean Architecture** com três camadas bem definidas:

1. **Core**: Código compartilhado e agnóstico a frameworks
2. **Domain**: Lógica de negócio pura, independente de tecnologia
3. **Infra**: Implementações técnicas (banco de dados, HTTP, autenticação, etc.)

---

## 🎯 Paradigmas e Padrões Implementados

### 1. Domain-Driven Design (DDD)

#### Conceitos Principais:

- **Entidades**: Objetos com identidade única (Question, Answer, User)
  - Possuem métodos de lógica de negócio
  - Implementam invariantes do domínio
  - Possuem ciclo de vida
- **Agregados**: Coleções de entidades tratadas como unidades (ex: Question é agregado de QuestionAttachments)
  - Question é raiz do agregado
  - Garantem consistência de dados
  - Têm um único ponto de entrada
- **Eventos de Domínio**: Registram acontecimentos importantes no domínio
  - `QuestionCreatedEvent`: Quando uma pergunta é criada
  - `AnswerCreatedEvent`: Quando uma resposta é criada
  - `QuestionCommentCreatedEvent`: Quando um comentário é feito
  - Permitem comunicação desacoplada entre agregados
- **Value Objects**: Objetos sem identidade, imutáveis
  - `Slug`: Identificador legível da pergunta
  - `Email`: Valor do email com validações
  - Encapsulam validações de domínio
- **Repositórios**: Abstrações para acesso a dados
  - Interface definida no domínio
  - Implementação na infraestrutura
  - Fazem o domínio agnóstico ao banco de dados

#### Exemplo de Entidade com Lógica de Domínio:

```typescript
// Lógica de negócio encapsulada na entidade
Question.create({
  title: 'Como usar DDD?',
  content: 'Tenho dúvidas sobre DDD...',
  authorId: userId,
  slug: Slug.create('como-usar-ddd'),
})

// Métodos de domínio
question.addAttachment(attachment)
question.addComment(comment)
question.markAsBestAnswer(answerId) // Só uma resposta pode ser a melhor
```

### 2. Test-Driven Development (TDD)

O projeto foi desenvolvido com testes em primeiro lugar:

- **Testes Unitários** (`.spec.ts`): Testam lógica de negócio isolada
  - Testam entidades, value objects, use cases
  - Usam repositórios em memória
  - São rápidos e determinísticos
- **Testes de Integração**: Testam interação entre componentes
  - Testam use cases com banco de dados real
  - Validam comportamento end-to-end da aplicação
- **Testes E2E**: Testam fluxos completos da API
  - Requisições HTTP reais
  - Validam respostas e efeitos colaterais

```bash
# Rodar testes
npm run test                 # Testes unitários
npm run test:watch          # Modo watch
npm run test:cov            # Com cobertura
npm run test:e2e            # E2E
npm run test:e2e:watch      # E2E em watch
```

### 3. Either Monad para Tratamento de Erros

Em vez de exceções, o projeto usa **Either** para tratamento funcional de erros:

```typescript
// Left = Erro, Right = Sucesso
type CreateQuestionResponse = Either<
  InvalidTitleError | InvalidContentError,
  { question: Question }
>

// Uso
const result = await createQuestionUseCase.execute(input)

if (result.isLeft()) {
  // Tratamento de erro
  return response.status(400).json({ error: result.value.message })
}

// Acesso ao valor de sucesso
const { question } = result.value
```

**Benefícios:**

- Erros são explícitos no tipo
- Força tratamento de erros
- Facilita composição de operações
- Código mais previsível e seguro

### 4. Repository Pattern

Abstração do acesso a dados:

```typescript
// Interface no domínio
interface QuestionsRepository {
  create(question: Question): Promise<void>
  findById(id: string): Promise<Question | null>
  findBySlug(slug: string): Promise<Question | null>
  save(question: Question): Promise<void>
  delete(id: string): Promise<void>
}

// Implementação na infraestrutura
class PrismaQuestionsRepository implements QuestionsRepository {
  // Implementação com Prisma
}

// Em testes
class InMemoryQuestionsRepository implements QuestionsRepository {
  // Implementação em memória para testes rápidos
}
```

### 5. Factory Pattern

Cria entidades complexas para testes:

```typescript
// test/factories/make-question.ts
export function makeQuestion(override?: Partial<QuestionProps>): Question {
  return Question.create({
    title: 'Pergunta padrão',
    content: 'Conteúdo padrão',
    authorId: new UniqueEntityId(),
    ...override,
  })
}

// Uso em testes
const question = makeQuestion({ title: 'Meu titulo customizado' })
```

### 6. Use Cases (Application Services)

Orquestram a lógica de aplicação:

```typescript
// Cada use case é uma ação do usuário
CreateQuestionUseCase // POST /questions
AnswerQuestionUseCase // POST /questions/:id/answers
CommentQuestionUseCase // POST /questions/:id/comments
DeleteQuestionUseCase // DELETE /questions/:id
EditQuestionUseCase // PUT /questions/:id
FetchQuestionAnswersUseCase // GET /questions/:id/answers
```

Características:

- Um use case = uma ação
- Recebem DTOs como entrada
- Retornam Either com resultado
- Orquestram entidades e repositórios
- Tratam validações
- Disparam eventos de domínio

---

## 💾 Domínios e Entidades

### Domínio: Forum

#### Entidades:

1. **User** (Agregado)
   - Atributos: id, name, email, password, role
   - Roles: STUDENT, INSTRUCTOR
   - Relacionamentos: Perguntas, respostas, comentários
   - Validações: Email único, senha segura

2. **Question** (Agregado)
   - Atributos: id, title, content, slug, authorId, bestAnswerId
   - Relacionamentos: Attachments (imagens/arquivos), Comments
   - Métodos: addAttachment(), addComment(), markAsBestAnswer()
   - Invariantes: Apenas uma melhor resposta por pergunta
   - Slug: URL-friendly identifier gerado do título

3. **QuestionAttachment** (Entidade)
   - Atributos: id, questionId, attachmentId
   - Relacionamento com Attachment
   - Permite múltiplos arquivos por pergunta

4. **Answer** (Agregado)
   - Atributos: id, content, questionId, authorId, correctness
   - Relacionamentos: Attachments, Comments
   - Métodos: addAttachment(), addComment()
   - Pode ser marcada como "melhor resposta"

5. **Comment** (Entidade)
   - Pode ser em Question ou Answer
   - Atributos: id, content, authorId, parentId
   - Aninhamento de comentários
   - Apenas autor e instructor podem deletar

6. **Attachment** (Entidade)
   - Atributos: id, title, url
   - Representa arquivos/imagens uploaded
   - Integração com AWS S3

### Domínio: Notification

#### Entidades:

1. **Notification** (Agregado)
   - Atributos: id, recipientId, title, content, readAt
   - Estados: lida/não lida
   - Use cases: CreateNotification, ReadNotification, FetchRecipientNotifications

**Event Listeners:**

- Quando Question é criada → Notifica Instructors
- Quando Answer é criada → Notifica author da Question
- Quando Comment é criado → Notifica usuario mencionado

---

## 🔐 Autenticação e Autorização

### JWT (JSON Web Tokens)

```typescript
// Fluxo de autenticação
1. User faz login com email/senha
2. JwtService gera token JWT assinado com chave privada RSA
3. Token é retornado ao cliente
4. Cliente envia token em todas as requisições (Authorization header)
5. JwtAuthGuard valida o token usando chave pública RSA

Header: Authorization: Bearer <token>
```

### Gerando Chaves RSA

```bash
# Gerar chave privada
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Gerar chave pública
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Converter para base64 (para usar em env)
cat public_key.pem | base64 > public_key_base64.txt
cat private_key.pem | base64 > private_key_base64.txt
```

### JWT Auth Guard

```typescript
// Protege rotas exigindo token JWT válido
@UseGuards(JwtAuthGuard)
@Post('/questions')
async createQuestion(@Body() body: CreateQuestionDto) {
  // req.user contém informações do usuário do token
}
```

**Global Protection:** O projeto usa `APP_GUARD` para aplicar JWT globalmente:

- Todas as rotas exigem token por padrão
- Rotas públicas são explicitamente excluídas com `@Public()`

```typescript
// Módulo de configuração global
providers: [
  JwtStrategy,
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  }
],
```

---

## 🗄️ Banco de Dados

### Prisma ORM

- **Provider**: PostgreSQL
- **Migrations**: Versionadas em `prisma/migrations`
- **Adapter**: `@prisma/adapter-pg` (suporte avançado a PostgreSQL)

#### Principais Modelos:

```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String
  role      UserRole  @default(STUDENT)
  createdAt DateTime  @default(now())

  questions      Question[]
  answers        Answer[]
  // ... relacionamentos
}

model Question {
  id          String    @id @default(uuid())
  slug        String    @unique
  title       String
  content     String
  authorId    String
  bestAnswerId String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  author      User      @relation(fields: [authorId], references: [id])
  attachments QuestionAttachment[]
  comments    QuestionComment[]
  answers     Answer[]
}

model Answer {
  id          String    @id @default(uuid())
  content     String
  questionId  String
  authorId    String
  correctness Float?    // Para indicar confiança da resposta
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  question    Question  @relation(fields: [questionId], references: [id])
  author      User      @relation(fields: [authorId], references: [id])
  attachments AnswerAttachment[]
  comments    AnswerComment[]
}
```

#### Executar Migrations

```bash
# Criar migration após alterar schema.prisma
npx prisma migrate dev --name <descricao>

# Visualizar dados
npx prisma studio

# Reset banco (desenvolvimento apenas)
npx prisma migrate reset
```

---

## 📦 Tecnologias Utilizadas

### Core Framework

- **NestJS 11**: Framework Node.js progressivo
- **TypeScript**: Tipagem estática

### Autenticação

- **@nestjs/jwt**: Geração e validação de JWT
- **passport-jwt**: Estratégia JWT para Passport
- **bcryptjs**: Hash de senhas

### Banco de Dados

- **PostgreSQL**: Banco de dados relacional
- **Prisma**: ORM type-safe
- **@prisma/adapter-pg**: Adapter avançado
- **pg**: Driver PostgreSQL

### Cache

- **ioredis**: Cliente Redis
- **@nestjs/config**: Gerenciamento de variáveis de ambiente

### Armazenamento de Arquivos

- **@aws-sdk/client-s3**: Upload para AWS S3
- **file-type**: Validação de tipos de arquivo

### Validação e Utilitários

- **zod**: Validação de schemas (runtime type checking)
- **zod-validation-error**: Mensagens de erro legíveis do Zod
- **dayjs**: Manipulação de datas
- **rxjs**: Programação reativa (usado pelo NestJS)

### Desenvolvimento e Testes

- **Vitest**: Framework de testes rápido (alternativa ao Jest)
- **@nestjs/testing**: Utilitários de teste para NestJS
- **@faker-js/faker**: Geração de dados fake para testes
- **TypeScript**: Para desenvolvimento type-safe

### Qualidade de Código

- **ESLint**: Linting
- **Prettier**: Formatação automática

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- pnpm (ou npm)
- PostgreSQL
- Redis (opcional, para caching)
- Docker & Docker Compose (para rodar dependências)

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd 05-nest-clean

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env

# Execute banco de dados e cache
docker-compose up -d
# ou use postgres e redis localmente

# Execute migrations
npx prisma migrate deploy

# Seed do banco (se existir seed script)
npm run seed
```

### Rodar a Aplicação

```bash
# Desenvolvimento (com hot reload)
npm run start:dev

# Produção
npm run build
npm run start:prod

# Debug
npm run start:debug
```

A API estará disponível em `http://localhost:3000`

### Testes

```bash
# Rodar todos os testes
npm run test

# Modo watch (rerun on change)
npm run test:watch

# Com cobertura de código
npm run test:cov

# Testes E2E
npm run test:e2e

# Testes E2E em watch
npm run test:e2e:watch
```

### Linting e Formatação

```bash
# Verificar erros de lint
npm run lint

# Formatar código com Prettier
npm run format
```

---

## 📡 API Endpoints

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login (retorna JWT)

### Perguntas

- `POST /questions` - Criar pergunta
- `GET /questions` - Listar perguntas (com paginação)
- `GET /questions/:slug` - Obter detalhes de uma pergunta
- `PUT /questions/:id` - Editar pergunta (apenas autor)
- `DELETE /questions/:id` - Deletar pergunta (apenas autor)
- `GET /questions/:id/answers` - Listar respostas da pergunta
- `PATCH /questions/:id/best-answer/:answerId` - Marcar resposta como melhor

### Respostas

- `POST /questions/:id/answers` - Responder pergunta
- `PUT /answers/:id` - Editar resposta (apenas autor)
- `DELETE /answers/:id` - Deletar resposta (apenas autor)
- `GET /answers/:id/comments` - Listar comentários da resposta

### Comentários

- `POST /questions/:id/comments` - Comentar pergunta
- `POST /answers/:id/comments` - Comentar resposta
- `DELETE /comments/:id` - Deletar comentário

### Notificações

- `GET /notifications` - Listar notificações do usuário
- `PATCH /notifications/:id/read` - Marcar notificação como lida

---

## 🎓 Lições Aprendidas e Pontos Importantes

### 1. Separação de Responsabilidades

O código está organizado em camadas bem definidas, cada uma com responsabilidade clara:

- **Domain**: O QUÊ fazer (lógica pura)
- **Application**: COMO fazer (orquestração)
- **Infrastructure**: COM QUE fazer (tecnologia)

Isso permite trocar implementações sem afetar o domínio.

### 2. Domain Events para Desacoplamento

Em vez de chamar diretamente outros agregados, usa-se eventos:

```typescript
// ❌ Acoplado
answer.create()
notification.sendToAuthor()

// ✅ Desacoplado
answer.create() // Dispara AnswerCreatedEvent
// Um listener detecta o evento e envia notificação
```

### 3. Value Objects para Segurança de Domínio

Encapsula validações no nível de domínio:

```typescript
// Slug é um Value Object que garante formato válido
const slug = Slug.create('pergunta-muito-boa')
// Se criar com conteúdo inválido, retorna Either.left()
```

### 4. Testes em Primeiro Lugar (TDD)

Escrever testes antes do código força design melhor:

- Código mais testável
- Interfaces mais claras
- Menos surpresas em produção
- Refatoração segura

### 5. Never Trust User Input

Sempre validar entrada com Zod:

```typescript
const createQuestionSchema = z.object({
  title: z.string().min(10),
  content: z.string().min(20),
  attachmentsIds: z.array(z.string().uuid()).optional(),
})

const result = createQuestionSchema.safeParse(input)
```

### 6. Error Handling é Código de Negócio

Erros de validação são retornados, não lançados:

```typescript
if (result.isLeft()) {
  return response.status(400).json({
    errors: result.value.message,
  })
}
```

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nest_forum"

# JWT
JWT_PRIVATE_KEY="base64-encoded-private-key"
JWT_PUBLIC_KEY="base64-encoded-public-key"
JWT_EXPIRES_IN="1d"

# Ambiente
NODE_ENV="development"

# Redis (opcional)
REDIS_URL="redis://localhost:6379"

# AWS S3
AWS_ACCESS_KEY_ID="seu-access-key"
AWS_SECRET_ACCESS_KEY="sua-secret-key"
AWS_BUCKET_NAME="seu-bucket"
AWS_REGION="us-east-1"
```

---

## 📚 Referências e Recursos de Estudo

Este projeto implementa vários conceitos acadêmicos e práticos:

1. **Clean Architecture** - Robert C. Martin
2. **Domain-Driven Design** - Eric Evans
3. **Design Patterns** - Gang of Four
4. **NestJS Documentation** - https://docs.nestjs.com
5. **Prisma Docs** - https://www.prisma.io/docs
6. **Testando TypeScript** - Vitest, @nestjs/testing

---

## 🎯 Próximas Melhorias Potenciais

- [ ] Adicionar suporte a busca full-text (ElasticSearch/PostgreSQL)
- [ ] Implementar rate limiting por usuário
- [ ] Cache distribuído de respostas
- [ ] Webhooks para notificações em tempo real (WebSockets)
- [ ] Roles e permissões mais granulares
- [ ] Analytics e insights do fórum
- [ ] Badges e sistema de reputação
- [ ] Integração com IA para sugestões de respostas

---

## 📝 Notas Adicionais

### Sobre UseGuards(JwtAuthGuard)

No NestJS, o decorator `@UseGuards(JwtAuthGuard)` é usado para proteger rotas específicas ou controladores inteiros, exigindo que as requisições incluam um token JWT válido para serem processadas. O JwtAuthGuard verifica a validade do token JWT presente no cabeçalho da requisição (geralmente no campo Authorization) e, se o token for válido, ele decodifica o token e popula o objeto `req.user` com as informações do usuário contidas no token. Isso permite que as rotas protegidas sejam acessadas apenas por usuários autenticados, garantindo a segurança das operações realizadas nessas rotas.

```javascript
@UseGuards(JwtAuthGuard)
```

No projeto foi usado o `APP_GUARD` para aplicar o JwtAuthGuard globalmente, ou seja, todas as rotas do aplicativo exigirão um token JWT válido, a menos que sejam explicitamente excluídas dessa proteção. Isso simplifica a segurança do aplicativo, garantindo que todas as rotas estejam protegidas por padrão.

```javascript
providers: [
  JwtStrategy,
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  }
],
```

---

**Criado como parte do curso de Node.js da Rocketseat**  
**Última atualização: Março de 2026**
