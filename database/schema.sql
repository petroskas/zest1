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
-- 3. Educational seizure-demonstration dataset and anonymous totals
--    Includes no patient records or personally identifying information.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `seizure_demos` (
  `slug`            VARCHAR(2)   NOT NULL,
  `title`           VARCHAR(120) NOT NULL,
  `brain_type`      VARCHAR(80)  NOT NULL,
  `description`     TEXT         NOT NULL,
  `first_aid`       TEXT         NOT NULL,
  `animation_class` VARCHAR(12)  NOT NULL,
  `sort_order`      TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seizure_demo_stats` (
  `demo_slug`  VARCHAR(2) NOT NULL,
  `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`demo_slug`),
  CONSTRAINT `fk_seizure_demo_stats_demo`
    FOREIGN KEY (`demo_slug`) REFERENCES `seizure_demos` (`slug`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `seizure_demos`
  (`slug`, `title`, `brain_type`, `description`, `first_aid`, `animation_class`, `sort_order`)
VALUES
  ('tc', 'Tonic-clonic (convulsive)', 'Whole brain',
   'The body may stiffen and then jerk rhythmically. The person is not aware of their surroundings.',
   'Stay and time the seizure. Cushion the head and clear nearby hazards; do not restrain the person or put anything in their mouth. When jerking stops, place them on their side if safe. Call emergency services if it lasts 5 minutes or more, repeats without recovery, or they are injured.',
   's-tc', 1),
  ('ab', 'Absence', 'Whole brain',
   'A brief pause in awareness may look like staring or eyelid fluttering; the person usually resumes what they were doing.',
   'Stay nearby and calmly guide the person away from immediate hazards. Reassure them when they become responsive; do not shake or restrain them.',
   's-ab', 2),
  ('fa', 'Focal aware or impaired awareness', 'One area of the brain',
   'A person may have unusual sensations or movements in one area, or become confused and less responsive.',
   'Stay with the person and gently guide them away from hazards. Do not restrain them. Time the episode and seek emergency help if it becomes a convulsive seizure lasting 5 minutes or more, repeats without recovery, or causes injury.',
   's-fa', 3),
  ('my', 'Myoclonic', 'Whole brain',
   'One or more sudden, brief muscle jerks may happen; awareness is often preserved.',
   'Help the person sit or move to a safer place if needed. Do not hold their limbs. Seek medical advice if these episodes are new or changing.',
   's-my', 4),
  ('at', 'Atonic', 'Whole brain',
   'A sudden loss of muscle tone can cause the head to drop or the person to fall.',
   'Protect the person from nearby hazards and cushion the head if possible. Check for injury; do not move them if a serious injury is suspected. Call emergency services for injury or breathing concerns.',
   's-at', 5),
  ('to', 'Tonic', 'Whole brain',
   'Muscles suddenly stiffen, sometimes while a person is asleep or standing.',
   'Move nearby hazards and protect the head without restraining the person. Time the episode. Afterward, check breathing and place them on their side if safe and needed.',
   's-to', 6);

INSERT IGNORE INTO `seizure_demo_stats` (`demo_slug`, `view_count`)
  SELECT `slug`, 0 FROM `seizure_demos`;

-- ---------------------------------------------------------------------
-- 4. Handy view for the team: unanswered messages, newest first
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_new_messages` AS
  SELECT `id`, `created_at`, `enquiry_type`, `full_name`, `email`, `phone`, `message`
  FROM   `contact_messages`
  WHERE  `status` = 'new'
  ORDER  BY `created_at` DESC;

-- ---------------------------------------------------------------------
-- 5. OPTIONAL: a dedicated database user instead of 'root'.
--    If you use this, set DB_USER / DB_PASS in api/db.php to match.
--    (Remove the leading -- to run it. Change the password first!)
-- ---------------------------------------------------------------------
-- CREATE USER IF NOT EXISTS 'zest_user'@'localhost' IDENTIFIED BY 'change-this-password';
-- GRANT SELECT, INSERT, UPDATE ON `zest_db`.* TO 'zest_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Quick test (uncomment to run, then check phpMyAdmin):
-- INSERT INTO contact_messages (full_name,email,enquiry_type,message)
--   VALUES ('Test User','test@example.com','person','Hello ZEST');
