<?php
/**
 * Sekaos Project - Settings & Contact API Endpoint
 * GET: Mengambil konfigurasi kontak & profil web
 * POST: Memperbarui pengaturan (Admin)
 */

require_once __DIR__ . '/db.php';

$db = getDb();
if (!$db) {
    errorResponse('Tidak dapat terhubung ke database MySQL Hostinger.', 500);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
        $rows = $stmt->fetchAll();
        $map = [
            'whatsapp_number' => '6289671830693',
            'whatsapp_template' => 'Halo Admin Sekaos Project, saya tertarik dengan produk {product_name}. Bisa konsultasi bahan dan estimasi harganya?',
            'instagram_handle' => '@sekaos.project',
            'instagram_url' => 'https://instagram.com/sekaos.project',
            'address' => 'Semarang, Jawa Tengah',
            'maps_url' => 'https://maps.app.goo.gl/SPYvU4N9ifpcvq6f9'
        ];

        foreach ($rows as $r) {
            $map[$r['setting_key']] = $r['setting_value'];
        }

        jsonResponse($map);
        break;

    case 'POST':
        requireAdmin();
        $data = getJsonInput();

        if (empty($data) || !is_array($data)) {
            errorResponse('Data pengaturan tidak valid', 422);
        }

        $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:k, :v)
                             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

        foreach ($data as $k => $v) {
            if (is_string($k) && (is_string($v) || is_numeric($v))) {
                $stmt->execute([':k' => $k, ':v' => (string)$v]);
            }
        }

        jsonResponse(['success' => true, 'settings' => $data]);
        break;

    default:
        errorResponse('Method Not Allowed', 405);
}
