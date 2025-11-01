/*
  Warnings:

  - You are about to drop the `Permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionsToRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RolesToUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BUYER', 'SELLER');

-- DropForeignKey
ALTER TABLE "public"."_PermissionsToRoles" DROP CONSTRAINT "_PermissionsToRoles_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PermissionsToRoles" DROP CONSTRAINT "_PermissionsToRoles_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RolesToUsers" DROP CONSTRAINT "_RolesToUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RolesToUsers" DROP CONSTRAINT "_RolesToUsers_B_fkey";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "roles" "Role" NOT NULL DEFAULT 'BUYER';

-- DropTable
DROP TABLE "public"."Permissions";

-- DropTable
DROP TABLE "public"."Roles";

-- DropTable
DROP TABLE "public"."_PermissionsToRoles";

-- DropTable
DROP TABLE "public"."_RolesToUsers";
