CREATE TABLE `password_reset_tokens` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `tokenHash` varchar(64) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `usedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_password_reset_tokens_token_hash` (`tokenHash`),
  KEY `idx_password_reset_tokens_user_id` (`userId`),
  CONSTRAINT `fk_password_reset_tokens_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);