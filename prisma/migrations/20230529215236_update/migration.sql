/*
  Warnings:

  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fkey`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role_id`,
    ADD COLUMN `role_name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `roles_name_key` ON `roles`(`name`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_name_fkey` FOREIGN KEY (`role_name`) REFERENCES `roles`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
