# Plataforma Pecuária Unificada — Monorepo

Stack: Fastify + TypeScript + Prisma + PostgreSQL (backend), Vite + React + React Query + Zustand (frontend), Docker.

## Requisitos
- Node 20+
- Docker (opcional, recomendado)

## Rodando com Docker (recomendado)

```bash
# na raiz
docker compose up -d
# aguarde os containers subirem
# depois, entre no container do backend para migrar e seed
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run seed
```

Acesse:
- Backend: http://localhost:3000/api/v1/health
- Frontend: http://localhost:5173

Login demo no frontend:
- Email: admin@demo.com
- Senha: admin123

## Rodando local sem Docker

Backend:
```bash
cd backend
cp env.example .env # ajuste se necessário
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Estrutura
- backend: Fastify, Prisma, rotas essenciais (`auth`, `fazendas`, `animais`, `pesagens`, `lotes`)
- frontend: login, dashboard, listagem de animais
- docker-compose: PostgreSQL + backend + frontend

## Notas
- Ajuste `CORS_ORIGIN`/`VITE_API_URL` conforme ambiente.
- As rotas requerem JWT após login. O seed cria `admin@demo.com / admin123`.


