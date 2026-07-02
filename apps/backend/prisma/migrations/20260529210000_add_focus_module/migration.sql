-- CreateTable
CREATE TABLE `focus_settings` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `focusDuration` INTEGER NOT NULL DEFAULT 25,
    `shortBreakDuration` INTEGER NOT NULL DEFAULT 5,
    `longBreakDuration` INTEGER NOT NULL DEFAULT 15,
    `sessionsUntilLongBreak` INTEGER NOT NULL DEFAULT 4,
    `autoStartBreaks` BOOLEAN NOT NULL DEFAULT false,
    `autoStartSessions` BOOLEAN NOT NULL DEFAULT false,
    `soundEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `focus_settings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `focus_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `label` VARCHAR(200) NULL,
    `wasCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_focus_sessions_user_id`(`userId`),
    INDEX `idx_focus_sessions_created_at`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `focus_settings` ADD CONSTRAINT `FK_focus_settings_user_id` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `focus_sessions` ADD CONSTRAINT `FK_focus_sessions_user_id` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
