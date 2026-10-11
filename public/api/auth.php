<?php
/**
 * Sekaos Project - Admin Authentication API Endpoint
 * POST ?action=login   : Login admin & penerbitan token JWT
 * GET  ?action=session : Pengecekan sesi admin aktif
 * POST ?action=logout  : Logout
 */

require_once __DIR__ . '/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'session';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && ($action === 'login' || !isset($_GET['action']))) {
    handleLogin();
} elseif ($method === 'GET' || ($method === 'POST' && $action === 'session')) {
    handleCheckSession();
} elseif ($method === 'POST' && $action === 'logout') {
    handleLogout();
} else {
    errorResponse('Aksi tidak dikenali', 400);
}

/**
 * Handle Login
 */
function handleLogin() {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($email) || empty($password)) {
        errorResponse('Email dan password wajib diisi', 422);
    }

    $db = getDb();
    $authenticated = false;
    $userData = [
        'email' => $email,
        'full_name' => 'Administrator Sekaos',
        'role' => 'admin'
    ];

    if ($db) {
        try {
            $stmt = $db->prepare("SELECT * FROM admin_users WHERE email = :email LIMIT 1");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                $authenticated = true;
                $userData['email'] = $user['email'];
                $userData['full_name'] = $user['full_name'] ?: 'Administrator Sekaos';
                $userData['role'] = $user['role'] ?: 'admin';
            }
        } catch (Exception $e) {
            error_log("Auth DB query failed: " . $e->getMessage());
        }
    }

    // Fallback kredensial default jika database belum terisi tabel admin
    $defaultEmail = defined('DEFAULT_ADMIN_EMAIL') ? DEFAULT_ADMIN_EMAIL : 'admin@sekaos.com';
    $defaultPass  = defined('DEFAULT_ADMIN_PASSWORD') ? DEFAULT_ADMIN_PASSWORD : 'admin123';

    if (!$authenticated && strtolower($email) === strtolower($defaultEmail) && $password === $defaultPass) {
        $authenticated = true;
    }

    if (!$authenticated) {
        errorResponse('Email atau password admin salah. (Default: admin@sekaos.com / admin123)', 401);
    }

    // Buat token autentikasi 7 hari
    $token = createAuthToken($userData);

    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => $userData,
        'message' => 'Login berhasil'
    ]);
}

/**
 * Handle Session Check
 */
function handleCheckSession() {
    $token = getBearerToken();
    if (!$token) {
        errorResponse('Tidak ada token autentikasi', 401);
    }

    $user = verifyAuthToken($token);
    if (!$user) {
        errorResponse('Token tidak valid atau telah kedaluwarsa', 401);
    }

    jsonResponse([
        'authenticated' => true,
        'user' => [
            'email' => $user['email'],
            'full_name' => $user['full_name'] ?? 'Administrator',
            'role' => $user['role'] ?? 'admin'
        ]
    ]);
}

/**
 * Handle Logout
 */
function handleLogout() {
    jsonResponse([
        'success' => true,
        'message' => 'Logout berhasil'
    ]);
}
