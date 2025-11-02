/*
  Warnings:

  - A unique constraint covering the columns `[shopsId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usersId]` on the table `Shops` will be added. If there are existing duplicate values, this will fail.
  - Made the column `shopsId` on table `Products` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `usersId` to the `Shops` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Products" DROP CONSTRAINT "Products_shopsId_fkey";

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "shopsId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Shops" ADD COLUMN     "usersId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_OrdersToShops" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OrdersToShops_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrdersToShops_B_index" ON "_OrdersToShops"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Products_shopsId_key" ON "Products"("shopsId");

-- CreateIndex
CREATE UNIQUE INDEX "Shops_usersId_key" ON "Shops"("usersId");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "Shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shops" ADD CONSTRAINT "Shops_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrdersToShops" ADD CONSTRAINT "_OrdersToShops_A_fkey" FOREIGN KEY ("A") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrdersToShops" ADD CONSTRAINT "_OrdersToShops_B_fkey" FOREIGN KEY ("B") REFERENCES "Shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
