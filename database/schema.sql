-- =============================================================================
-- Roxiler Systems Full-Stack Coding Challenge: Store Rating Application
-- Database Schema Definition
-- Target Database: MySQL 8.0+
-- Database Name: store_rating_db
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `store_rating_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `store_rating_db`;

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- Stores all system accounts across roles: ADMIN, USER, STORE_OWNER
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `address` VARCHAR(400) NULL,
  `role` ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `uk_users_email` UNIQUE (`email`),
  CONSTRAINT `chk_users_name_length` CHECK (CHAR_LENGTH(`name`) >= 20 AND CHAR_LENGTH(`name`) <= 60),
  CONSTRAINT `chk_users_address_length` CHECK (`address` IS NULL OR CHAR_LENGTH(`address`) <= 400)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_users_role` ON `users` (`role`);
CREATE INDEX `idx_users_name` ON `users` (`name`);
CREATE INDEX `idx_users_email` ON `users` (`email`);

-- -----------------------------------------------------------------------------
-- 2. Table: stores
-- Stores business profiles and their assigned Store Owner
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `address` VARCHAR(400) NULL,
  `owner_user_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_stores_owner` FOREIGN KEY (`owner_user_id`)
    REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `chk_stores_name_length` CHECK (CHAR_LENGTH(`name`) >= 20 AND CHAR_LENGTH(`name`) <= 60),
  CONSTRAINT `chk_stores_address_length` CHECK (`address` IS NULL OR CHAR_LENGTH(`address`) <= 400)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_stores_owner_user_id` ON `stores` (`owner_user_id`);
CREATE INDEX `idx_stores_name` ON `stores` (`name`);
CREATE INDEX `idx_stores_email` ON `stores` (`email`);

-- -----------------------------------------------------------------------------
-- 3. Table: ratings
-- Stores integer ratings (1-5) submitted by Normal Users for Stores.
-- A user may only submit one rating per store (enforced by UNIQUE KEY).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `store_id` INT NOT NULL,
  `rating` TINYINT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ratings_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ratings_store` FOREIGN KEY (`store_id`)
    REFERENCES `stores` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `uk_user_store_rating` UNIQUE (`user_id`, `store_id`),
  CONSTRAINT `chk_ratings_range` CHECK (`rating` >= 1 AND `rating` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_ratings_store_id` ON `ratings` (`store_id`);
CREATE INDEX `idx_ratings_user_id` ON `ratings` (`user_id`);
CREATE INDEX `idx_ratings_rating` ON `ratings` (`rating`);
