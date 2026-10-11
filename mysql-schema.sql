-- ========================================================
-- SEKAOS PROJECT - MYSQL / MARIADB DATABASE SCHEMA
-- Target: Hostinger Shared/Cloud Web Hosting (phpMyAdmin)
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABEL KATEGORI (categories)
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `icon` VARCHAR(50) DEFAULT 'fas fa-tshirt',
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL PRODUK (products)
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NULL,
    `name` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(220) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `material_specs` VARCHAR(255) NULL,
    `min_order` VARCHAR(50) DEFAULT '12 pcs',
    `price_estimate` VARCHAR(100) DEFAULT 'Hubungi CS',
    `is_featured` TINYINT(1) DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `views_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL FOTO PRODUK (product_images)
CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `image_url` TEXT NOT NULL,
    `is_primary` TINYINT(1) DEFAULT 0,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL PENGATURAN UMUM (settings)
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(50) NOT NULL UNIQUE,
    `setting_value` TEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL ADMIN PENGGUNA (admin_users)
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) DEFAULT 'Administrator Sekaos',
    `role` VARCHAR(50) DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- DATA AWAL / SEED DATA
-- ========================================================

-- Akun Default Admin: admin@sekaos.com | Password: admin123
INSERT INTO `admin_users` (`id`, `email`, `password_hash`, `full_name`, `role`) VALUES
(1, 'admin@sekaos.com', '$2y$10$wEkgKsqo8k2KjU64lE31wOS8dFvF8kR8J1M0LzQeL5J5rK9NnF6aK', 'Administrator Sekaos', 'admin')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Pengaturan Awal Kontak & WhatsApp
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('whatsapp_number', '6289671830693'),
('whatsapp_template', 'Halo Admin Sekaos Project, saya tertarik dengan produk {product_name}. Bisa konsultasi bahan dan estimasi harganya?'),
('instagram_url', 'https://instagram.com/sekaos.project'),
('instagram_handle', '@sekaos.project'),
('address', 'Semarang, Jawa Tengah'),
('maps_url', 'https://maps.app.goo.gl/SPYvU4N9ifpcvq6f9')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- Kategori Awal
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `sort_order`, `is_active`) VALUES
(1, 'Rompi / Vest', 'rompi-vest', 'fas fa-vest', 1, 1),
(2, 'PDH & Kemeja', 'pdh-kemeja', 'fas fa-user-tie', 2, 1),
(3, 'Kaos Custom', 'kaos-custom', 'fas fa-tshirt', 3, 1),
(4, 'Jersey Custom', 'jersey-custom', 'fas fa-running', 4, 1),
(5, 'Seragam & Wearpack', 'seragam-wearpack', 'fas fa-user-friends', 5, 1),
(6, 'Merchandise & Aksesoris', 'merchandise-aksesoris', 'fas fa-medal', 6, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Produk Awal (Katalog Sekaos Project)
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `material_specs`, `min_order`, `price_estimate`, `is_featured`, `is_active`) VALUES
(1, 1, 'Rompi Tactical Lapangan 4 Saku', 'rompi-tactical-lapangan-4-saku', 'Rompi lapangan serbaguna dengan jahitan ganda super kuat. Tahan angin dan percikan air, cocok untuk kegiatan outdoor, kepanitiaan, jurnalis, maupun instansi.', 'Ripstop / Taslan + Furing Jala Adem', '12 pcs', 'Hubungi CS untuk Penawaran', 1, 1),
(2, 2, 'Kemeja PDH Organisasi Nagata Drill', 'kemeja-pdh-organisasi-nagata-drill', 'Kemeja PDH/PDL resmi dengan bahan Nagata Drill original yang lembut, adem, dan tidak mudah kusut. Dilengkapi bordir komputer berkualitas tajam dan rapi.', 'Nagata Drill Original (Bordir Komputer Tajam)', '12 pcs', 'Hubungi CS untuk Penawaran', 1, 1),
(3, 3, 'Kaos Event Gathering Cotton Combed 24s', 'kaos-event-gathering-cotton-combed-24s', 'Kaos custom event dengan bahan 100% Cotton Combed 24s berdaya serap tinggi dan nyaman dipakai seharian. Pilihan sablon DTF Full Color atau Plastisol tahan lama.', 'Cotton Combed 24s / 30s + Sablon DTF / Plastisol', '24 pcs', 'Hubungi CS untuk Penawaran', 1, 1),
(4, 4, 'Jersey Olahraga / Futsal Full Sublim', 'jersey-olahraga-futsal-full-sublim', 'Jersey olahraga berteknologi sublimasi modern dengan warna cerah dan tajam yang meresap ke serat kain, dijamin tidak luntur dan tahan cuci berkali-kali.', 'Dryfit Milano / Brazil / Benzema Berpori', '12 pcs', 'Hubungi CS untuk Penawaran', 1, 1),
(5, 5, 'Seragam Kerja Wearpack Lapangan Safety', 'seragam-kerja-wearpack-lapangan-safety', 'Wearpack coverall atau stelan kemeja-celana lapangan dengan aksen scotlight 3M reflektif menyala dalam gelap. Standar keamanan kerja kontraktor dan bengkel.', 'American Drill Tebal + Scotlight 3M Reflektif', '12 pcs', 'Hubungi CS untuk Penawaran', 1, 1),
(6, 3, 'Kaos Polo Wangki Bordir Eksklusif', 'kaos-polo-wangki-bordir-eksklusif', 'Kaos polo berkerah dengan rajutan Lacoste Pique tebal dan elegan. Sangat pas untuk seragam semi-formal kantor, panitia expo, atau komunitas.', 'Lacoste Pique CVC / Katun + Kerah Rajut', '12 pcs', 'Hubungi CS untuk Penawaran', 1, 1),
(7, 6, 'Paket ID Card PVC + Lanyard Printing', 'paket-id-card-pvc-lanyard-printing', 'Paket identitas panitia dan peserta event lengkap. ID Card bahan PVC standar kartu ATM tahan air, dipadukan tali lanyard bahan tissue printing 2 cm kait putar.', 'PVC Card Tebal 0.76mm + Tali Tissue Stopper', '30 pcs', 'Hubungi CS untuk Penawaran', 0, 1),
(8, 6, 'Totebag Kanvas & Blacu Custom Sablon', 'totebag-kanvas-blacu-custom-sablon', 'Goodie bag dan totebag souvenir ramah lingkungan untuk seminar, wisuda, atau promosi bisnis. Jahitan kuat dengan variasi resleting atau perekat velcro.', 'Kanvas Premium / Blacu Tebal', '50 pcs', 'Hubungi CS untuk Penawaran', 0, 1),
(9, 2, 'Kemeja Korsa / Himpunan Lapangan', 'kemeja-korsa-himpunan-lapangan', 'Kemeja seragam korsa untuk himpunan mahasiswa dan komunitas pecinta alam. Dilengkapi kancing lidah gulung lengan, ventilasi punggung, dan banyak kantong.', 'Taipan Tropical / Japan Drill', '12 pcs', 'Hubungi CS untuk Penawaran', 0, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Foto Produk Default (Portofolio)
INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `sort_order`) VALUES
(1, 1, '/portfolio/porto-1.jpeg', 1, 0),
(2, 2, '/portfolio/porto-2.jpeg', 1, 0),
(3, 3, '/portfolio/porto-3.jpeg', 1, 0),
(4, 4, '/portfolio/porto-4.jpeg', 1, 0),
(5, 5, '/portfolio/porto-5.jpeg', 1, 0),
(6, 6, '/portfolio/porto-6.jpeg', 1, 0),
(7, 7, '/portfolio/porto-7.jpeg', 1, 0),
(8, 8, '/portfolio/porto-8.jpeg', 1, 0),
(9, 9, '/portfolio/porto-9.jpeg', 1, 0)
ON DUPLICATE KEY UPDATE `image_url` = VALUES(`image_url`);

SET FOREIGN_KEY_CHECKS = 1;
