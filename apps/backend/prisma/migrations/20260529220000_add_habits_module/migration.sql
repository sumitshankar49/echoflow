-- CreateTable
CREATE TABLE `habits` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(300) NULL,
    `color` VARCHAR(20) NOT NULL DEFAULT '#7c3aed',
    `icon` VARCHAR(10) NOT NULL DEFAULT '✨',
    `frequency` ENUM('daily', 'weekly') NOT NULL DEFAULT 'daily',
    `targetDaysPerWeek` INTEGER NOT NULL DEFAULT 7,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_habits_user_id`(`userId`),
    INDEX `idx_habits_user_archived`(`userId`, `isArchived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `habitId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `logDate` DATE NOT NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `uq_habit_log_habit_date`(`habitId`, `logDate`),
    INDEX `idx_habit_logs_habit_id`(`habitId`),
    INDEX `idx_habit_logs_user_date`(`userId`, `logDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `habits` ADD CONSTRAINT `FK_habits_user_id` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `habit_logs` ADD CONSTRAINT `FK_habit_logs_habit_id` FOREIGN KEY (`habitId`) REFERENCES `habits`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `habit_logs` ADD CONSTRAINT `FK_habit_logs_user_id` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
