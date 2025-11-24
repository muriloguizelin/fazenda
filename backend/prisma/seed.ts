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
    create: {
      nome: 'Admin',
      email: 'admin@demo.com',
      senhaHash: await bcrypt.hash('admin123', 10),
      cargo: 'ADMIN',
      contaId: conta.id
    },
  });

  // Fazenda: Check if exists by name (since there's no unique constraint on name)
  let fazenda = await prisma.fazenda.findFirst({
    where: { contaId: conta.id, nome: 'Fazenda Demo' }
  });

  if (!fazenda) {
    fazenda = await prisma.fazenda.create({
      data: {
        contaId: conta.id,
        nome: 'Fazenda Demo',
        localizacao: { center: [-23.5, -46.6], zoom: 12 },
        hectares: 1000
      }
    });
  }

  const lote1 = await prisma.lote.upsert({
    where: {
      fazendaId_nome: {
        fazendaId: fazenda.id,
        nome: 'Lote 1'
      }
    },
    update: {},
    create: {
      fazendaId: fazenda.id,
      nome: 'Lote 1',
      capacidade: 100
    }
  });

  const animal = await prisma.animal.upsert({
    where: { brinco: 'ERO-1' },
    update: {},
    create: {
      fazendaId: fazenda.id,
      prefixo: 'ERO',
      numero: 1,
      brinco: 'ERO-1',
      sexo: 'MACHO',
      status: 'ATIVO',
      loteId: lote1.id
    }
  });

  // Pesagem: Check if exists for this animal
  const pesagemExists = await prisma.pesagem.findFirst({
    where: { animalId: animal.id, observacao: 'Inicial' }
  });

  if (!pesagemExists) {
    await prisma.pesagem.create({
      data: {
        animalId: animal.id,
        peso: 400,
        flag: 'ATIVO',
        observacao: 'Inicial'
      }
    });
  }

  console.log({ admin: admin.email, fazenda: fazenda.nome, animal: animal.brinco });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


