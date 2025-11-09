-- DropForeignKey
ALTER TABLE "public"."Products" DROP CONSTRAINT "Products_shopsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shops" DROP CONSTRAINT "Shops_usersId_fkey";

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "Shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shops" ADD CONSTRAINT "Shops_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
