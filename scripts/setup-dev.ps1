Write-Host "🚀 Iniciando setup do ambiente de desenvolvimento..." -ForegroundColor Green

# 1. Derrubar ambiente antigo
Write-Host "🛑 Parando containers existentes..."
docker compose down --remove-orphans

# 2. Subir ambiente
Write-Host "🐳 Subindo containers..."
docker compose up -d

# 3. Aguardar banco de dados
Write-Host "⏳ Aguardando banco de dados iniciar..."
Start-Sleep -Seconds 10

# 4. Resetar e sincronizar banco de dados
Write-Host "🔄 Sincronizando schema do banco (Prisma)..."
# Usamos db push para desenvolvimento rápido, forçando o reset se necessário
docker compose exec backend npx prisma db push --accept-data-loss

# 5. Popular banco de dados
Write-Host "🌱 Populando banco de dados (Seed)..."
docker compose exec backend npx tsx prisma/seed.ts

Write-Host "✅ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "🌍 Frontend: http://localhost:5173"
Write-Host "🔌 Backend: http://localhost:3000"
Write-Host "🔑 Login: admin@demo.com / admin123"
