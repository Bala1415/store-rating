-- =============================================================================
-- Roxiler Systems Full-Stack Coding Challenge: Store Rating Application
-- Development Seed Data
-- =============================================================================
-- WARNING: These sample accounts are intended STRICTLY for local development
-- and evaluation testing. Never use development credentials in production!
-- =============================================================================

USE `store_rating_db`;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `ratings`;
TRUNCATE TABLE `stores`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. Insert Users
-- Passwords:
-- Admin:       Admin@1234
-- Store Owner: Owner@1234
-- Normal User: User@1234
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `address`, `role`) VALUES
(1, 'System Administrator Roxiler', 'admin@roxiler.com', '$2a$10$AWTyNPYWn56n8Xn0x6GHq.1OJxaT.Xg5dQ7dWhlG8fA4sWQ8dVfDi', '100 Corporate Parkway, Suite 500, Tech District', 'ADMIN'),
(2, 'Store Owner Alice Downtown', 'alice.owner@roxiler.com', '$2a$10$yyEQOiBsicFee3yF64NTLuQJBYPSkAtXLf.ux8dzw/YS89Cbszbqa', '456 Commerce Boulevard, West End', 'STORE_OWNER'),
(3, 'Store Owner Robert Boulevard', 'robert.owner@roxiler.com', '$2a$10$yyEQOiBsicFee3yF64NTLuQJBYPSkAtXLf.ux8dzw/YS89Cbszbqa', '789 Market Avenue, North Quarter', 'STORE_OWNER'),
(4, 'Store Owner Charles Unassigned', 'charles.owner@roxiler.com', '$2a$10$yyEQOiBsicFee3yF64NTLuQJBYPSkAtXLf.ux8dzw/YS89Cbszbqa', '12 Horizon Way, Uptown District', 'STORE_OWNER'),
(5, 'Customer Christopher Davies', 'chris.user@gmail.com', '$2a$10$fwSbyH9HdWBtZ5L8QPAz3.fKwPgFbGOzgzJDlFjaElgi5vC.9.19i', '321 Elm Street, Apartment 4B', 'USER'),
(6, 'Customer Samantha Kensington', 'samantha.user@gmail.com', '$2a$10$fwSbyH9HdWBtZ5L8QPAz3.fKwPgFbGOzgzJDlFjaElgi5vC.9.19i', '654 Pine Crest Lane, Suburbia', 'USER'),
(7, 'Customer Alexander Hamilton', 'alex.user@gmail.com', '$2a$10$fwSbyH9HdWBtZ5L8QPAz3.fKwPgFbGOzgzJDlFjaElgi5vC.9.19i', '987 Cedar Ridge Road, Old Town', 'USER');

-- -----------------------------------------------------------------------------
-- 2. Insert Stores
-- -----------------------------------------------------------------------------
INSERT INTO `stores` (`id`, `name`, `email`, `address`, `owner_user_id`) VALUES
(1, 'Downtown Gourmet Artisan Bakery', 'contact@downtownbakery.com', '456 Commerce Boulevard, West End', 2),
(2, 'Apex Electronics & Gadgets Hub', 'support@apexelectronics.com', '789 Market Avenue, North Quarter', 3),
(3, 'Metropolis Fresh Organic Market', 'info@metropolisorganic.com', '102 Greenbelt Plaza, Central City', 2);

-- -----------------------------------------------------------------------------
-- 3. Insert Ratings
-- -----------------------------------------------------------------------------
INSERT INTO `ratings` (`id`, `user_id`, `store_id`, `rating`) VALUES
(1, 5, 1, 5),
(2, 6, 1, 4),
(3, 5, 2, 3),
(4, 7, 2, 4),
(5, 6, 3, 5);
