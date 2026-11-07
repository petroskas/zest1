-- =====================================================================
--  ZEST – Zimbabwe Epilepsy Survivors Trust
--  MySQL / MariaDB schema for XAMPP
--
--  HOW TO IMPORT (easiest):
--   1. Start Apache + MySQL in the XAMPP Control Panel
--   2. Open http://localhost/phpmyadmin
--   3. Click "Import" (top menu) -> choose this file -> Go
--  (The script creates the database for you.)
--
--  OR from a terminal:  C:\xampp\mysql\bin\mysql -u root < schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `zest_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `zest_db`;

-- ---------------------------------------------------------------------
-- 1. Contact form  (index.html #contact  ->  api/contact.php)
--    Also holds volunteer, employer/hiring and training-booking requests,
--    separated by `enquiry_type`.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name`     VARCHAR(120)  NOT NULL,
  `email`         VARCHAR(190)  NOT NULL,
  `phone`         VARCHAR(40)   DEFAULT NULL,
  `enquiry_type`  ENUM('person','family','professional','employer',
                       'partner','volunteer','training','other')
                  NOT NULL DEFAULT 'person',
  `message`       TEXT          NOT NULL,
  `status`        ENUM('new','read','replied','archived') NOT NULL DEFAULT 'new',
  `ip_address`    VARCHAR(45)   DEFAULT NULL,
  `user_agent`    VARCHAR(255)  DEFAULT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_created` (`status`, `created_at`),
  KEY `idx_type`           (`enquiry_type`),
  KEY `idx_ip_created`     (`ip_address`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Donation pledges  (index.html #donate  ->  api/donate.php)
--    The site does not take payments itself. A pledge is recorded, the
--    donor pays by EcoCash (*153*2*2*056028#), and you mark it 'confirmed'.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `donation_pledges` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `amount_usd`    DECIMAL(10,2) NOT NULL,
  `donor_name`    VARCHAR(120)  DEFAULT NULL,
  `donor_phone`   VARCHAR(40)   DEFAULT NULL,
  `status`        ENUM('pledged','confirmed','cancelled') NOT NULL DEFAULT 'pledged',
  `ip_address`    VARCHAR(45)   DEFAULT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_created` (`status`, `created_at`),
  KEY `idx_ip_created`     (`ip_address`, `created_at`),
  CONSTRAINT `chk_amount_positive` CHECK (`amount_usd` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Handy view for the team: unanswered messages, newest first
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_new_messages` AS
  SELECT `id`, `created_at`, `enquiry_type`, `full_name`, `email`, `phone`, `message`
  FROM   `contact_messages`
  WHERE  `status` = 'new'
  ORDER  BY `created_at` DESC;

-- ---------------------------------------------------------------------
-- 4. OPTIONAL: a dedicated database user instead of 'root'.
--    If you use this, set DB_USER / DB_PASS in api/db.php to match.
--    (Remove the leading -- to run it. Change the password first!)
-- ---------------------------------------------------------------------
-- CREATE USER IF NOT EXISTS 'zest_user'@'localhost' IDENTIFIED BY 'change-this-password';
-- GRANT SELECT, INSERT, UPDATE ON `zest_db`.* TO 'zest_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Quick test (uncomment to run, then check phpMyAdmin):
-- INSERT INTO contact_messages (full_name,email,enquiry_type,message)
--   VALUES ('Test User','test@example.com','person','Hello ZEST');
