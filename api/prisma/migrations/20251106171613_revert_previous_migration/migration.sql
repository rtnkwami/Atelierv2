/*
  Warnings:

  - You are about to drop the column `shopId` on the `Products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopsId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopsId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Products" DROP CONSTRAINT "Products_shopId_fkey";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "shopId",
ADD COLUMN     "shopsId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Products_shopsId_key" ON "Products"("shopsId");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "Shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
