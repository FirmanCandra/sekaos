<?php
/**
 * Sekaos Project - File & Image Upload API Endpoint
 * Menerima unggahan foto produk dari Admin Dashboard
 * Menyimpan ke folder public_html/uploads/
 */

require_once __DIR__ . '/db.php';

// Wajib admin
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Hanya metode POST yang diizinkan untuk upload', 405);
}

// Cek keberadaan file upload
$fileField = null;
if (isset($_FILES['file'])) {
    $fileField = $_FILES['file'];
} elseif (isset($_FILES['image'])) {
    $fileField = $_FILES['image'];
} else {
    errorResponse('Tidak ada file foto yang diunggah (field file/image)', 400);
}

if ($fileField['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE   => 'Ukuran file melebihi upload_max_filesize di server PHP',
        UPLOAD_ERR_FORM_SIZE  => 'Ukuran file melebihi MAX_FILE_SIZE form',
        UPLOAD_ERR_PARTIAL    => 'File hanya terunggah sebagian',
        UPLOAD_ERR_NO_FILE    => 'Tidak ada file yang diunggah',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary server hilang',
        UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk server',
        UPLOAD_ERR_EXTENSION  => 'Ekstensi PHP membatalkan upload'
    ];
    $msg = $errorMessages[$fileField['error']] ?? 'Terjadi kesalahan saat mengunggah file';
    errorResponse($msg, 400);
}

// Validasi ukuran file (Maks 5 MB)
$maxSize = 5 * 1024 * 1024;
if ($fileField['size'] > $maxSize) {
    errorResponse('Ukuran file terlalu besar. Maksimum 5 MB.', 422);
}

// Validasi ekstensi
$ext = strtolower(pathinfo($fileField['name'], PATHINFO_EXTENSION));
$allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
if (!in_array($ext, $allowedExts)) {
    errorResponse('Format file tidak didukung. Harap unggah format JPG, PNG, atau WEBP.', 422);
}

// Validasi MIME Type riil
$tmpPath = $fileField['tmp_name'];
$isImage = @getimagesize($tmpPath);
if (!$isImage) {
    errorResponse('File bukan gambar yang valid.', 422);
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($isImage['mime'], $allowedMimes)) {
    errorResponse('MIME type gambar tidak diizinkan: ' . $isImage['mime'], 422);
}

// Direktori tujuan: public_html/uploads
$uploadDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// Tambahkan proteksi file .htaccess di folder uploads jika belum ada
$htaccessFile = $uploadDir . '/.htaccess';
if (!file_exists($htaccessFile)) {
    $htaccessContent = "# Nonaktifkan eksekusi skrip PHP di folder upload\n<FilesMatch \"\\.(php|phtml|php3|php4|php5|php7|phps)$\">\n    Order Deny,Allow\n    Deny from all\n</FilesMatch>\n";
    @file_put_contents($htaccessFile, $htaccessContent);
}

// Nama file acak dan aman
$randomStr = substr(bin2hex(random_bytes(4)), 0, 8);
$newFilename = 'prod_' . time() . '_' . $randomStr . '.' . $ext;
$targetPath = $uploadDir . '/' . $newFilename;

if (!move_uploaded_file($tmpPath, $targetPath)) {
    errorResponse('Gagal memindahkan file ke direktori server.', 500);
}

// Return public URL path
$publicUrl = '/uploads/' . $newFilename;

jsonResponse([
    'success' => true,
    'image_url' => $publicUrl,
    'filename' => $newFilename,
    'message' => 'Foto berhasil diunggah'
], 201);
