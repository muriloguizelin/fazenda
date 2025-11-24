# Plataforma Pecuária Unificada — Monorepo

Stack: Fastify + TypeScript + Prisma + PostgreSQL (backend), Vite + React + React Query + Zustand (frontend), Docker.

## Requisitos
- Node 20+
- Docker (opcional, recomendado)

## Rodando com Docker (recomendado)

```bash
# Windows (PowerShell)
./scripts/setup-dev.ps1
```

Isso irá:
1. Reiniciar os containers Docker
2. Sincronizar o banco de dados (Prisma)
3. Criar dados de teste (Seed)

Acesse:
- Backend: http://localhost:3000/api/v1/health
- Frontend: http://localhost:5173

Login demo no frontend:
- Email: admin@demo.com
- Senha: admin123

## 🔥 Como ver alterações no código durante desenvolvimento

O Docker Compose já está configurado para **hot reload automático**:

### ⚡ Alterações aparecem automaticamente
- **Backend**: usa `tsx watch` → recompila quando você salva
- **Frontend**: usa `vite dev` → hot reload instantâneo
- **Volumes sincronizados**: `./backend:/app` e `./frontend:/app`

### 👀 Ver logs em tempo real
```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver só backend
docker compose logs -f backend

# Ver só frontend  
docker compose logs -f frontend
```

### 🔄 Se precisar reiniciar algo
```bash
# Reiniciar só um serviço (mantém banco)
docker compose restart backend
docker compose restart frontend

# Rebuild se mudou package.json/Dockerfile
docker compose up --build backend
```

### 🐛 Debug direto no container
```bash
# Entrar no backend
docker compose exec backend sh

# Entrar no frontend
docker compose exec frontend sh
```

### 📝 Fluxo normal de desenvolvimento:
1. ✏️ **Edita código** no VS Code
2. 💾 **Salva arquivo** (Ctrl+S)
3. 🔄 **Vite/tsx detecta** mudança automaticamente
4. 🌐 **Refresh browser** → vê a mudança

**Não precisa reiniciar Docker** para mudanças de código! Só para:
- Mudanças no `package.json` (novas dependências)
- Mudanças no `Dockerfile`
- Mudanças no `docker-compose.yml`

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
- **backend**: Fastify, Prisma, rotas essenciais (`auth`, `fazendas`, `animais`, `pesagens`, `lotes`)
- **frontend**: React + Vite, login, dashboard, CRUD de animais e lotes
- **docker-compose**: PostgreSQL + backend + frontend com hot reload
- **features**: 🗺️ Mapa satélite, 🐄 Enum raça (Nelore), 🏠 Navegação, 📊 Dashboard

## Últimas melhorias
- ✅ Mapa com tiles satélite (Esri World Imagery)
- ✅ Botão Home em todas as páginas
- ✅ Raça como enum no Prisma (default: NELORE)
- ✅ Exibição correta do nome do lote (vs ID)
- ✅ Hot reload configurado no Docker
- docker-compose: PostgreSQL + backend + frontend

## Notas
- Ajuste `CORS_ORIGIN`/`VITE_API_URL` conforme ambiente.
- As rotas requerem JWT após login. O seed cria `admin@demo.com / admin123`.


