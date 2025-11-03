-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('ADMIN', 'GERENTE', 'VETERINARIO', 'OPERADOR');

-- CreateEnum
CREATE TYPE "StatusAnimal" AS ENUM ('ATIVO', 'MORTO', 'VENDIDO', 'DOENTE');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MACHO', 'FEMEA', 'DESCONHECIDO');

-- CreateTable
CREATE TABLE "Conta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "cargo" "Cargo" NOT NULL,
    "contaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fazenda" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" JSONB,
    "hectares" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fazenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "prefixo" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "brinco" TEXT NOT NULL,
    "sexo" "Sexo",
    "raca" TEXT,
    "nascimento" TIMESTAMP(3),
    "origem" TEXT,
    "fotoUrl" TEXT,
    "status" "StatusAnimal" NOT NULL DEFAULT 'ATIVO',
    "loteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "capacidade" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesagem" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "peso" DOUBLE PRECISION NOT NULL,
    "flag" "StatusAnimal" NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pesagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Fazenda_contaId_idx" ON "Fazenda"("contaId");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_brinco_key" ON "Animal"("brinco");

-- CreateIndex
CREATE INDEX "Animal_fazendaId_idx" ON "Animal"("fazendaId");

-- CreateIndex
CREATE INDEX "Animal_loteId_idx" ON "Animal"("loteId");

-- CreateIndex
CREATE INDEX "Animal_prefixo_numero_idx" ON "Animal"("prefixo", "numero");

-- CreateIndex
CREATE INDEX "Lote_fazendaId_idx" ON "Lote"("fazendaId");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_fazendaId_nome_key" ON "Lote"("fazendaId", "nome");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fazenda" ADD CONSTRAINT "Fazenda_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesagem" ADD CONSTRAINT "Pesagem_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
