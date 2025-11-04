-- Migration: Add API Keys and Usage Tracking
-- Date: 2025-01-04
-- Description: Adds UserApiKeys table and usage tracking fields to User model

-- Step 1: Add usage tracking fields to User table
ALTER TABLE `User`
ADD COLUMN `freeStoriesUsed` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `freeStoryLimit` INTEGER NOT NULL DEFAULT 7;

-- Step 2: Create UserApiKeys table
CREATE TABLE `UserApiKeys` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `geminiApiKey` TEXT NULL,
    `huggingFaceApiKey` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastValidated` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserApiKeys_userId_key`(`userId`),
    INDEX `UserApiKeys_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 3: Add foreign key constraint
ALTER TABLE `UserApiKeys`
ADD CONSTRAINT `UserApiKeys_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
