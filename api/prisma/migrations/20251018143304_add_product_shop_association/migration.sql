-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "shopsId" UUID;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "Shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
