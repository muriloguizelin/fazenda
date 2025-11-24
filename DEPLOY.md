# Guia de Deploy (Produção)

A arquitetura recomendada para este projeto é:
- **Frontend:** Vercel (Grátis e rápido para estáticos/React)
- **Backend:** Render (Suporta Docker/Node e tem plano grátis)
- **Banco de Dados:** Render (Postgres gerenciado)

## 1. Backend + Banco de Dados (Render)

O arquivo `render.yaml` na raiz já configura tudo automaticamente.

1. Crie uma conta no [Render.com](https://render.com).
2. Vá em "Blueprints" -> "New Blueprint Instance".
3. Conecte seu repositório do GitHub.
4. O Render vai detectar o `render.yaml` e criar:
   - Um banco de dados Postgres.
   - O serviço do Backend.
5. **Importante:** Após o deploy, copie a URL do seu backend (ex: `https://fazenda-backend.onrender.com`).

## 2. Frontend (Vercel)

1. Crie uma conta na [Vercel](https://vercel.com).
2. Importe o repositório do GitHub.
3. Nas configurações do projeto, defina a "Root Directory" como `frontend`.
4. Adicione a variável de ambiente:
   - `VITE_API_URL`: A URL do seu backend no Render (ex: `https://fazenda-backend.onrender.com/api/v1`).
   *Nota: Adicione `/api/v1` no final da URL.*
5. Faça o Deploy.

## 3. Finalização

Volte no painel do Render, vá nas variáveis de ambiente do Backend e atualize o `CORS_ORIGIN` com a URL final do seu frontend na Vercel (ex: `https://seu-projeto.vercel.app`).

---

## Scripts Úteis (Local)

- **Backup:** `./scripts/backup.ps1`
- **Restore:** `./scripts/restore.ps1`
