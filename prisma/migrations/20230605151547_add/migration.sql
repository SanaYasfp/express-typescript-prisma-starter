-- CreateTable
CREATE TABLE `investments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `term` INTEGER NOT NULL,
    `gain` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `accepted` BOOLEAN NOT NULL DEFAULT false,
    `accepted_at` DATETIME(3) NULL,
    `date_of_refund` DATETIME(3) NOT NULL,
    `refunded` BOOLEAN NOT NULL DEFAULT false,
    `refunded_at` DATETIME(3) NULL,
    `proof` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `lender` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `investments` ADD CONSTRAINT `investments_lender_fkey` FOREIGN KEY (`lender`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
