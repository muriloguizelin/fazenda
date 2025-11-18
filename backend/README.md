# Backend - Sistema de Gestão Pecuária

Sistema de gestão de fazendas, animais, lotes e pesagens com arquitetura em camadas.

## Stack Tecnológica

- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Validação**: Zod
- **Autenticação**: JWT (@fastify/jwt)
- **TypeScript**: Para type safety completo

## Estrutura do Projeto

```
backend/
├── src/
│   ├── shared/
│   │   ├── middleware/       # Middleware de autenticação e autorização
│   │   └── types/           # Tipos compartilhados (JWT, Pagination, Error)
│   ├── modules/
│   │   ├── auth/            # Autenticação e autorização
│   │   ├── animais/         # Gestão de animais
│   │   ├── pesagens/        # Registro de pesagens
│   │   ├── lotes/           # Gestão de lotes
│   │   ├── fazendas/        # Gestão de fazendas
│   │   └── metrics/         # Métricas e relatórios
│   ├── types/               # Declarações de tipo globais
│   ├── utils/               # Utilitários (Prisma plugin)
│   ├── routes.ts            # Registro central de rotas
│   └── server.ts            # Configuração do servidor
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   ├── seed.ts             # Dados iniciais
│   └── migrations/         # Histórico de migrações
├── ARCHITECTURE.md          # Documentação da arquitetura
├── DEVELOPMENT.md           # Guia de desenvolvimento
└── package.json
```

## Arquitetura em Camadas

O backend segue uma arquitetura limpa e organizada:

### 🎯 Controllers
- Recebem requisições HTTP
- Validam dados de entrada (Zod)
- Delegam para Services
- Retornam respostas HTTP

### 💼 Services
- Contêm a lógica de negócio
- Validam regras de negócio
- Orquestram múltiplos Repositories
- Lançam erros de negócio

### 📦 Repositories
- Acessam o banco de dados (Prisma)
- Executam queries e mutations
- Gerenciam transações
- Sem lógica de negócio

### 📋 DTOs (Data Transfer Objects)
- Definem estrutura de dados
- Schemas de validação (Zod)
- Type safety

### 🛡️ Middleware
- Autenticação JWT
- Autorização por cargo
- Validação de tokens

## API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Criar conta
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Perfil do usuário

### Fazendas
- `GET /api/v1/fazendas` - Listar fazendas
- `POST /api/v1/fazendas` - Criar fazenda (ADMIN/GERENTE)
- `PUT /api/v1/fazendas/:id` - Atualizar fazenda (ADMIN/GERENTE)
- `DELETE /api/v1/fazendas/:id` - Deletar fazenda (ADMIN)

### Animais
- `GET /api/v1/animais` - Listar animais
- `GET /api/v1/animais/prefixos` - Listar prefixos únicos
- `GET /api/v1/animais/:id` - Detalhes do animal
- `POST /api/v1/animais` - Criar animal
- `PUT /api/v1/animais/:id` - Atualizar animal

### Pesagens
- `GET /api/v1/pesagens/:animalId` - Listar pesagens do animal
- `POST /api/v1/pesagens` - Registrar pesagem

### Lotes
- `GET /api/v1/lotes` - Listar lotes
- `POST /api/v1/lotes` - Criar lote
- `POST /api/v1/lotes/:id/transferir` - Transferir animais

### Métricas
- `GET /api/v1/metrics/peso` - Evolução de peso médio

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=seu_secret_jwt
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Prisma
npm run prisma:generate    # Gerar cliente
npm run prisma:migrate     # Criar migração
npm run prisma:studio      # Abrir Prisma Studio
npm run seed              # Popular banco com dados de teste

# Testes
npm test
```

## Desenvolvimento

### Criar Novo Módulo

Siga o padrão dos módulos existentes:

1. Crie a estrutura de pastas em `src/modules/{nome}/`
2. Implemente DTOs, Repository, Service e Controller
3. Crie arquivo de rotas `{nome}.routes.ts`
4. Registre as rotas em `src/routes.ts`

Veja `DEVELOPMENT.md` para exemplo completo.

### Autenticação

Todas as rotas (exceto `/register` e `/login`) requerem autenticação via Bearer token:

```typescript
Authorization: Bearer {token}
```

### Autorização por Cargo

Use o middleware `requireRole` para restringir acesso:

```typescript
app.post('/fazendas', 
  { preHandler: [authMiddleware, requireRole('ADMIN', 'GERENTE')] },
  handler
);
```

Cargos disponíveis:
- `ADMIN` - Acesso total
- `GERENTE` - Gestão de fazendas e animais
- `VETERINARIO` - Registro de pesagens e saúde
- `OPERADOR` - Visualização e operações básicas

## Padrões de Código

### Tratamento de Erros

Erros de negócio devem seguir o padrão:

```typescript
throw {
  statusCode: 404,
  code: 'NOT_FOUND',
  message: 'Recurso não encontrado',
};
```

### Validação com Zod

```typescript
const schema = z.object({
  email: z.string().email(),
  nome: z.string().min(1),
  idade: z.number().min(0).max(120),
});

const data = schema.parse(input);
```

### Paginação

```typescript
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
```

## Banco de Dados

### Schema Principal

- **Conta**: Multi-tenancy por conta
- **Usuario**: Usuários do sistema com cargos
- **Fazenda**: Propriedades rurais
- **Animal**: Gado com identificação única por brinco
- **Lote**: Agrupamento de animais
- **Pesagem**: Histórico de peso e status dos animais

### Relacionamentos

```
Conta
  ├── Usuario (1:N)
  └── Fazenda (1:N)
        ├── Animal (1:N)
        │     ├── Pesagem (1:N)
        │     └── Lote (N:1)
        └── Lote (1:N)
```

## Segurança

- Senhas hasheadas com bcrypt (salt rounds: 10)
- JWT com expiração configurável
- Middleware de autenticação em todas as rotas protegidas
- Validação de entrada com Zod
- Prepared statements (Prisma)
- CORS configurável

## Performance

- Connection pooling (Prisma)
- Queries otimizadas com includes seletivos
- Paginação em todas as listagens
- Indexes no banco de dados
- Transações quando necessário

## Documentação Adicional

- `ARCHITECTURE.md` - Detalhes da arquitetura em camadas
- `DEVELOPMENT.md` - Guia completo de desenvolvimento
- `prisma/schema.prisma` - Schema do banco com comentários

## Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.

## Licença

Proprietário
