<?php
/**
 * Sekaos Project - Database & System Configuration
 * Konfigurasi koneksi MySQL Hostinger & Secret Key
 */

// Host Database MySQL Hostinger (biasanya 'localhost' atau '127.0.0.1')
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');

// Port MySQL (default 3306)
define('DB_PORT', getenv('DB_PORT') ?: '3306');

// Nama Database yang dibuat di hPanel Hostinger (contoh: u267893077_sekaos)
define('DB_NAME', getenv('DB_NAME') ?: 'u267893077_sekaos');

// Username Database MySQL Hostinger
define('DB_USER', getenv('DB_USER') ?: 'u267893077_sekaos');

// Password Database MySQL Hostinger
define('DB_PASS', getenv('DB_PASS') ?: 'Sekaos*06');

// Secret Key untuk pembuatan Token Autentikasi Admin
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'sekaos_super_secret_auth_token_key_2026');

// Kredensial Default Login Admin (fallback)
define('DEFAULT_ADMIN_EMAIL', 'admin@sekaos.com');
define('DEFAULT_ADMIN_PASSWORD', 'admin123');
