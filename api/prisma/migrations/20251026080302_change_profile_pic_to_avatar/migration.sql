/*
  Warnings:

  - You are about to drop the column `profile_pic_url` on the `Users` table. All the data in the column will be lost.
  - Added the required column `avater` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "profile_pic_url",
ADD COLUMN     "avater" TEXT NOT NULL;
