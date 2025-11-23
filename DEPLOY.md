# Guia de Implantação e Segurança de Dados

Este guia explica como colocar o sistema em produção, realizar backups e restaurar dados em caso de emergência.

## 🚀 Como Rodar em Produção

Para rodar o sistema de forma otimizada (sem modo de desenvolvimento), utilize o arquivo `docker-compose.prod.yml`.

1. **Certifique-se de ter o Docker instalado.**
2. **Execute o comando:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   Isso irá construir as imagens otimizadas e iniciar os serviços:
   - Frontend: Acessível em `http://localhost` (porta 80)
   - Backend: Acessível em `http://localhost:3000`
   - Banco de Dados: Interno (não exposto publicamente por segurança)

## 💾 Backups e Segurança de Dados

Para garantir que você nunca perca seus dados, criamos scripts automáticos.

### Como fazer Backup
Execute o script `scripts/backup.ps1` (no Windows) ou use o comando abaixo:

```powershell
./scripts/backup.ps1
```

- O backup será salvo na pasta `backups/` com a data e hora atual (ex: `backup_20251123_193000.sql`).
- **Dica:** Copie esses arquivos `.sql` para um local seguro (Google Drive, HD externo, etc) periodicamente.

### Como Restaurar (Disaster Recovery)
Se "der merda" e você precisar recuperar os dados de um backup anterior:

1. Execute o script `scripts/restore.ps1`:
   ```powershell
   ./scripts/restore.ps1
   ```
2. O script listará os backups disponíveis.
3. Digite o número do backup que deseja restaurar.
4. Confirme a operação.

**⚠️ ATENÇÃO:** A restauração APAGA os dados atuais e substitui pelo backup selecionado.

## ☁️ Onde Hospedar o Banco de Dados (Para Vercel/Produção)

Como a Vercel não hospeda banco de dados tradicional, você precisa de um serviço externo. Aqui estão as melhores opções gratuitas/baratas compatíveis com este projeto:

### 1. Neon (Recomendado)
- **O que é:** Postgres Serverless (escala do zero).
- **Vantagem:** Plano gratuito generoso, muito rápido.
- **Como usar:**
  1. Crie conta em [neon.tech](https://neon.tech).
  2. Crie um novo projeto.
  3. Copie a "Connection String" (parece com `postgres://user:pass@...`).
  4. Na Vercel, adicione isso na variável `DATABASE_URL`.

### 2. Supabase
- **O que é:** Plataforma completa (Banco + Auth + Storage).
- **Vantagem:** Muito estável e popular.
- **Como usar:**
  1. Crie conta em [supabase.com](https://supabase.com).
  2. Crie um projeto e defina a senha do banco.
  3. Vá em Project Settings -> Database -> Connection String -> URI.
  4. Copie a URL (lembre de substituir `[YOUR-PASSWORD]` pela senha que criou).

### 3. Vercel Postgres
- **O que é:** Integração nativa da Vercel (usa Neon por baixo).
- **Vantagem:** Configuração num clique dentro da Vercel.
- **Como usar:**
  1. No dashboard do seu projeto na Vercel, vá em "Storage".
  2. Clique em "Connect Store" -> "Postgres".
  3. Ele vai configurar as variáveis automaticamente para você.

---

## 🛠️ Manutenção

- **Atualizar o sistema:**
  Se você alterar o código, rode novamente:
  ```bash
  docker compose -f docker-compose.prod.yml up -d --build
  ```

- **Ver logs:**
  ```bash
  docker compose -f docker-compose.prod.yml logs -f
  ```

- **Parar o sistema:**
  ```bash
  docker compose -f docker-compose.prod.yml down
  ```
  *Nota: Seus dados permanecem salvos no volume do Docker mesmo após parar.*
