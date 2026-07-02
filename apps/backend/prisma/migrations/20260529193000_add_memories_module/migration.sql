CREATE TABLE `memories` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `sourceType` ENUM('note', 'journal', 'task') NOT NULL DEFAULT 'note',
  `sourceId` VARCHAR(36) NULL,
  `tags` JSON NULL,
  `importanceScore` DOUBLE NOT NULL DEFAULT 0,
  `userId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_memories_user_id` (`userId`),
  INDEX `idx_memories_source_type` (`sourceType`),
  INDEX `idx_memories_updated_at` (`updatedAt`),
  FULLTEXT INDEX `idx_memories_title_content_fulltext` (`title`, `content`),
  CONSTRAINT `FK_memories_user_id`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
