<?php
/**
 * Sekaos Project - Categories API Endpoint
 * GET: Mengambil daftar kategori
 * POST: Menambah kategori (Admin)
 * PUT: Memperbarui kategori (Admin)
 * DELETE: Menghapus kategori (Admin)
 */

require_once __DIR__ . '/db.php';

$db = getDb();
if (!$db) {
    errorResponse('Tidak dapat terhubung ke database MySQL Hostinger.', 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = getJsonInput();
    if (isset($input['_method'])) {
        $method = strtoupper($input['_method']);
    } elseif (isset($_GET['_method'])) {
        $method = strtoupper($_GET['_method']);
    }
}

switch ($method) {
    case 'GET':
        $isAdmin = false;
        if (isset($_GET['admin']) && $_GET['admin'] == '1') {
            $token = getBearerToken();
            if (verifyAuthToken($token)) {
                $isAdmin = true;
            }
        }

        $sql = "SELECT * FROM categories";
        if (!$isAdmin) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY sort_order ASC, id ASC";

        $stmt = $db->query($sql);
        $cats = $stmt->fetchAll();
        $formatted = array_map(function($c) {
            return [
                'id' => (int)$c['id'],
                'name' => $c['name'],
                'slug' => $c['slug'],
                'icon' => $c['icon'] ?: 'fas fa-tshirt',
                'sort_order' => (int)$c['sort_order'],
                'is_active' => (bool)$c['is_active'],
                'created_at' => $c['created_at']
            ];
        }, $cats);

        jsonResponse($formatted);
        break;

    case 'POST':
        requireAdmin();
        $data = getJsonInput();
        if (empty($data['name'])) {
            errorResponse('Nama kategori wajib diisi', 422);
        }

        $name = trim($data['name']);
        $slug = !empty($data['slug']) ? trim($data['slug']) : strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
        $icon = $data['icon'] ?? 'fas fa-tshirt';
        $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : 0;
        $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;

        $stmt = $db->prepare("INSERT INTO categories (name, slug, icon, sort_order, is_active) VALUES (:name, :slug, :icon, :sort_order, :is_active)");
        $stmt->execute([
            ':name' => $name,
            ':slug' => $slug,
            ':icon' => $icon,
            ':sort_order' => $sortOrder,
            ':is_active' => $isActive
        ]);

        $newId = (int)$db->lastInsertId();
        $catStmt = $db->prepare("SELECT * FROM categories WHERE id = :id");
        $catStmt->execute([':id' => $newId]);
        $newCat = $catStmt->fetch();
        $newCat['id'] = (int)$newCat['id'];
        $newCat['is_active'] = (bool)$newCat['is_active'];

        jsonResponse($newCat, 201);
        break;

    case 'PUT':
        requireAdmin();
        $data = getJsonInput();
        $id = isset($data['id']) ? (int)$data['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
        if (!$id) {
            errorResponse('ID kategori tidak disertakan', 422);
        }

        $name = trim($data['name'] ?? '');
        $slug = trim($data['slug'] ?? '');
        $icon = $data['icon'] ?? null;
        $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : null;
        $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : null;

        $fields = [];
        $params = [':id' => $id];
        if ($name) { $fields[] = "name = :name"; $params[':name'] = $name; }
        if ($slug) { $fields[] = "slug = :slug"; $params[':slug'] = $slug; }
        if ($icon !== null) { $fields[] = "icon = :icon"; $params[':icon'] = $icon; }
        if ($sortOrder !== null) { $fields[] = "sort_order = :sort_order"; $params[':sort_order'] = $sortOrder; }
        if ($isActive !== null) { $fields[] = "is_active = :is_act"; $params[':is_act'] = $isActive; }

        if (!empty($fields)) {
            $stmt = $db->prepare("UPDATE categories SET " . implode(', ', $fields) . " WHERE id = :id");
            $stmt->execute($params);
        }

        $catStmt = $db->prepare("SELECT * FROM categories WHERE id = :id");
        $catStmt->execute([':id' => $id]);
        $updated = $catStmt->fetch();
        $updated['id'] = (int)$updated['id'];
        $updated['is_active'] = (bool)$updated['is_active'];

        jsonResponse($updated);
        break;

    case 'DELETE':
        requireAdmin();
        $data = getJsonInput();
        $id = isset($data['id']) ? (int)$data['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
        if (!$id) {
            errorResponse('ID kategori tidak disertakan', 422);
        }

        $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Kategori berhasil dihapus']);
        break;

    default:
        errorResponse('Method Not Allowed', 405);
}
