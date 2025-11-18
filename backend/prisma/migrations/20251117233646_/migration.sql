/*
  Warnings:

  - You are about to drop the column `raca` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `Lote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "raca",
ADD COLUMN     "paiId" TEXT;

-- AlterTable
ALTER TABLE "Lote" DROP COLUMN "area",
ADD COLUMN     "prefixo" TEXT;

-- CreateIndex
CREATE INDEX "Animal_paiId_idx" ON "Animal"("paiId");

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
