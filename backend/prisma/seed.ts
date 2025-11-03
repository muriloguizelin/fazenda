import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const conta = await prisma.conta.upsert({
    where: { id: 'seed-conta' },
    update: {},
    create: { id: 'seed-conta', nome: 'Conta Demo' },
  });
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: { nome: 'Admin', email: 'admin@demo.com', senhaHash: await bcrypt.hash('admin123', 10), cargo: 'ADMIN', contaId: conta.id },
  });
  const fazenda = await prisma.fazenda.create({ data: { contaId: conta.id, nome: 'Fazenda Demo', localizacao: { center: [-23.5, -46.6], zoom: 12 }, hectares: 1000 } });
  const lote1 = await prisma.lote.create({ data: { fazendaId: fazenda.id, nome: 'Lote 1', capacidade: 100, area: 10 } });
  const animal = await prisma.animal.create({ data: { fazendaId: fazenda.id, prefixo: 'ERO', numero: 1, brinco: 'ERO-1', sexo: 'MACHO', status: 'ATIVO', loteId: lote1.id } });
  await prisma.pesagem.create({ data: { animalId: animal.id, peso: 400, flag: 'ATIVO', observacao: 'Inicial' } });
  console.log({ admin: admin.email, fazenda: fazenda.nome, animal: animal.brinco });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


