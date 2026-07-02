CREATE TABLE `journals` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `mood` ENUM('happy', 'calm', 'neutral', 'anxious', 'sad', 'excited') NOT NULL DEFAULT 'neutral',
  `tags` JSON NULL,
  `date` DATE NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_journals_user_id` (`userId`),
  INDEX `idx_journals_mood` (`mood`),
  INDEX `idx_journals_date` (`date`),
  CONSTRAINT `FK_journals_user_id`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
