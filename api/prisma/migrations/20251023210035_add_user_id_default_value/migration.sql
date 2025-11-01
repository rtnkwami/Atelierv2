/*
  Warnings:

  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_RolesToUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `Users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_RolesToUsers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."_RolesToUsers" DROP CONSTRAINT "_RolesToUsers_B_fkey";

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_RolesToUsers" DROP CONSTRAINT "_RolesToUsers_AB_pkey",
DROP COLUMN "B",
ADD COLUMN     "B" UUID NOT NULL,
ADD CONSTRAINT "_RolesToUsers_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE INDEX "_RolesToUsers_B_index" ON "_RolesToUsers"("B");

-- AddForeignKey
ALTER TABLE "_RolesToUsers" ADD CONSTRAINT "_RolesToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
