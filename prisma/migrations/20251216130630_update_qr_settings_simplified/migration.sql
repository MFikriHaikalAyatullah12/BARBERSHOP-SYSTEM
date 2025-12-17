/*
  Warnings:

  - You are about to drop the column `accountName` on the `qr_settings` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `qr_settings` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `qr_settings` table. All the data in the column will be lost.
  - You are about to drop the column `qrImageUrl` on the `qr_settings` table. All the data in the column will be lost.
  - Added the required column `qrisImageUrl` to the `qr_settings` table without a default value. This is not possible if the table is not empty.

*/

-- First, copy existing qrImageUrl to qrisImageUrl with a default value
ALTER TABLE "qr_settings" ADD COLUMN "qrisImageUrl" TEXT DEFAULT '';

-- Update existing records to use the old qrImageUrl value
UPDATE "qr_settings" SET "qrisImageUrl" = COALESCE("qrImageUrl", '') WHERE "qrisImageUrl" = '';

-- Now make qrisImageUrl required (NOT NULL)
ALTER TABLE "qr_settings" ALTER COLUMN "qrisImageUrl" SET NOT NULL;
ALTER TABLE "qr_settings" ALTER COLUMN "qrisImageUrl" DROP DEFAULT;

-- Now drop the old columns
ALTER TABLE "qr_settings" DROP COLUMN "accountName",
DROP COLUMN "accountNumber",
DROP COLUMN "bankName",
DROP COLUMN "qrImageUrl";
