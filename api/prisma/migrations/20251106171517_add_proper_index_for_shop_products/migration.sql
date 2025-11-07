/*
  Warnings:

  - You are about to drop the column `shopsId` on the `Products` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Products" DROP CONSTRAINT "Products_shopsId_fkey";

-- DropIndex
DROP INDEX "public"."Products_shopsId_key";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "shopsId",
ADD COLUMN     "shopId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
