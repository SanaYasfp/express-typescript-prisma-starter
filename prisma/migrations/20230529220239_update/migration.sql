/*
  Warnings:

  - You are about to drop the column `role_name` on the `users` table. All the data in the column will be lost.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_name_fkey`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role_name`,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_fkey` FOREIGN KEY (`role`) REFERENCES `roles`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
