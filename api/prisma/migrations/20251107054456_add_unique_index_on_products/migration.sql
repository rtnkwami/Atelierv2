/*
  Warnings:

  - A unique constraint covering the columns `[id,shopsId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Products_shopsId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Products_id_shopsId_key" ON "Products"("id", "shopsId");
