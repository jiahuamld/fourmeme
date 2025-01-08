/*
  Warnings:

  - You are about to drop the column `address` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `raised_token` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_url` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `ticker_symbol` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `token_description` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `token_img_url` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `token_name` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `website_url` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contractAddress]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractAddress` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deployer` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageId` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Made the column `chain` on table `Token` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Token_address_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "address",
DROP COLUMN "raised_token",
DROP COLUMN "tags",
DROP COLUMN "telegram_url",
DROP COLUMN "ticker_symbol",
DROP COLUMN "token_description",
DROP COLUMN "token_img_url",
DROP COLUMN "token_name",
DROP COLUMN "website_url",
ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "deployer" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "messageId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "pair" TEXT,
ADD COLUMN     "platform" TEXT NOT NULL,
ADD COLUMN     "symbol" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "chain" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Token_contractAddress_key" ON "Token"("contractAddress");
