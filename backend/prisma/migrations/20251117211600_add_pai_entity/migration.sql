-- CreateTable
CREATE TABLE "Pai" (
    "id" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pai_fazendaId_idx" ON "Pai"("fazendaId");

-- AddForeignKey
ALTER TABLE "Pai" ADD CONSTRAINT "Pai_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey (remove self-reference)
ALTER TABLE "Animal" DROP CONSTRAINT IF EXISTS "Animal_paiId_fkey";

-- AddForeignKey (add reference to Pai table)
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "Pai"("id") ON DELETE SET NULL ON UPDATE CASCADE;
