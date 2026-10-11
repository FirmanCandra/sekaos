<?php
/**
 * Sekaos Project - Products API Endpoint
 * GET: Mengambil daftar produk atau detail produk
 * POST: Menambah produk baru (Admin)
 * PUT: Memperbarui produk (Admin)
 * DELETE: Menghapus produk (Admin)
 */

require_once __DIR__ . '/db.php';

$db = getDb();
if (!$db) {
    errorResponse('Tidak dapat terhubung ke database MySQL Hostinger. Pastikan konfigurasi di api/config.php sudah benar.', 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle method spoofing (misal POST dengan _method=PUT atau _method=DELETE)
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
        handleGetProducts($db);
        break;

    case 'POST':
        handleCreateProduct($db);
        break;

    case 'PUT':
        handleUpdateProduct($db);
        break;

    case 'DELETE':
        handleDeleteProduct($db);
        break;

    default:
        errorResponse('Method Not Allowed', 405);
}

/**
 * GET Handler
 */
function handleGetProducts($db) {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
    $isAdmin = false;

    // Cek apakah request dari admin
    if (isset($_GET['admin']) && $_GET['admin'] == '1') {
        $token = getBearerToken();
        if (verifyAuthToken($token)) {
            $isAdmin = true;
        }
    }

    // Detail single product by ID atau Slug
    if ($id || $slug) {
        $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) AS image_url
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE " . ($id ? "p.id = :id" : "p.slug = :slug");
        
        if (!$isAdmin) {
            $sql .= " AND p.is_active = 1";
        }

        $stmt = $db->prepare($sql);
        if ($id) {
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        }
        $stmt->execute();
        $product = $stmt->fetch();

        if (!$product) {
            errorResponse('Produk tidak ditemukan', 404);
        }

        // Format data
        $product['is_featured'] = (bool)$product['is_featured'];
        $product['is_active'] = (bool)$product['is_active'];
        $product['image_url'] = $product['image_url'] ?: '/portfolio/porto-1.jpeg';

        jsonResponse($product);
    }

    // List semua produk
    $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                   (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) AS image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id";

    if (!$isAdmin) {
        $sql .= " WHERE p.is_active = 1";
    }

    $sql .= " ORDER BY p.id DESC";

    $stmt = $db->query($sql);
    $products = $stmt->fetchAll();

    // Map tipe data boolean & fallback image
    $formatted = array_map(function($prod) {
        return [
            'id' => (int)$prod['id'],
            'category_id' => $prod['category_id'] ? (int)$prod['category_id'] : null,
            'name' => $prod['name'],
            'slug' => $prod['slug'],
            'description' => $prod['description'] ?: '',
            'material_specs' => $prod['material_specs'] ?: '',
            'min_order' => $prod['min_order'] ?: '12 pcs',
            'price_estimate' => $prod['price_estimate'] ?: 'Hubungi CS',
            'is_featured' => (bool)$prod['is_featured'],
            'is_active' => (bool)$prod['is_active'],
            'views_count' => (int)($prod['views_count'] ?? 0),
            'image_url' => $prod['image_url'] ?: '/portfolio/porto-1.jpeg',
            'category_name' => $prod['category_name'] ?: 'Umum',
            'category_slug' => $prod['category_slug'] ?: 'umum',
            'categories' => [
                'name' => $prod['category_name'] ?: 'Umum',
                'slug' => $prod['category_slug'] ?: 'umum'
            ],
            'created_at' => $prod['created_at'],
            'updated_at' => $prod['updated_at']
        ];
    }, $products);

    jsonResponse($formatted);
}

/**
 * POST Handler (Tambah Produk)
 */
function handleCreateProduct($db) {
    requireAdmin();
    $data = getJsonInput();

    if (empty($data['name'])) {
        errorResponse('Nama produk wajib diisi', 422);
    }

    // Slug generator
    $name = trim($data['name']);
    $slug = !empty($data['slug']) 
        ? trim($data['slug']) 
        : strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
    $slug = trim($slug, '-');

    // Pastikan slug unik
    $checkStmt = $db->prepare("SELECT COUNT(*) FROM products WHERE slug = :slug");
    $checkStmt->execute([':slug' => $slug]);
    if ($checkStmt->fetchColumn() > 0) {
        $slug .= '-' . time();
    }

    $categoryId = !empty($data['category_id']) ? (int)$data['category_id'] : null;
    $desc = $data['description'] ?? '';
    $specs = $data['material_specs'] ?? '';
    $minOrder = $data['min_order'] ?? '12 pcs';
    $price = $data['price_estimate'] ?? 'Hubungi CS';
    $isFeatured = !empty($data['is_featured']) ? 1 : 0;
    $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;
    $imageUrl = $data['image_url'] ?? '/portfolio/porto-1.jpeg';

    $sql = "INSERT INTO products (category_id, name, slug, description, material_specs, min_order, price_estimate, is_featured, is_active)
            VALUES (:cat_id, :name, :slug, :desc, :specs, :min_order, :price, :is_feat, :is_act)";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':cat_id' => $categoryId,
        ':name' => $name,
        ':slug' => $slug,
        ':desc' => $desc,
        ':specs' => $specs,
        ':min_order' => $minOrder,
        ':price' => $price,
        ':is_feat' => $isFeatured,
        ':is_act' => $isActive
    ]);

    $productId = (int)$db->lastInsertId();

    // Simpan foto utama ke product_images
    if ($imageUrl) {
        $imgStmt = $db->prepare("INSERT INTO product_images (product_id, image_url, is_primary) VALUES (:pid, :url, 1)");
        $imgStmt->execute([':pid' => $productId, ':url' => $imageUrl]);
    }

    // Ambil data produk yang baru dibuat
    $resStmt = $db->prepare("SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = :id");
    $resStmt->execute([':id' => $productId]);
    $newProduct = $resStmt->fetch();
    $newProduct['image_url'] = $imageUrl;
    $newProduct['is_featured'] = (bool)$newProduct['is_featured'];
    $newProduct['is_active'] = (bool)$newProduct['is_active'];
    $newProduct['categories'] = [
        'name' => $newProduct['category_name'] ?: 'Umum',
        'slug' => $newProduct['category_slug'] ?: 'umum'
    ];

    jsonResponse($newProduct, 201);
}

/**
 * PUT Handler (Update Produk)
 */
function handleUpdateProduct($db) {
    requireAdmin();
    $data = getJsonInput();

    $id = isset($data['id']) ? (int)$data['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
    if (!$id) {
        errorResponse('ID produk tidak disertakan', 422);
    }

    // Pastikan produk ada
    $checkStmt = $db->prepare("SELECT id FROM products WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    if (!$checkStmt->fetch()) {
        errorResponse('Produk tidak ditemukan', 404);
    }

    $name = trim($data['name'] ?? '');
    $categoryId = !empty($data['category_id']) ? (int)$data['category_id'] : null;
    $desc = $data['description'] ?? null;
    $specs = $data['material_specs'] ?? null;
    $minOrder = $data['min_order'] ?? null;
    $price = $data['price_estimate'] ?? null;
    $isFeatured = isset($data['is_featured']) ? ($data['is_featured'] ? 1 : 0) : null;
    $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : null;
    $imageUrl = $data['image_url'] ?? null;

    $fields = [];
    $params = [':id' => $id];

    if ($name) {
        $fields[] = "name = :name";
        $params[':name'] = $name;
    }
    if ($categoryId !== null) {
        $fields[] = "category_id = :cat_id";
        $params[':cat_id'] = $categoryId;
    }
    if ($desc !== null) {
        $fields[] = "description = :desc";
        $params[':desc'] = $desc;
    }
    if ($specs !== null) {
        $fields[] = "material_specs = :specs";
        $params[':specs'] = $specs;
    }
    if ($minOrder !== null) {
        $fields[] = "min_order = :min_order";
        $params[':min_order'] = $minOrder;
    }
    if ($price !== null) {
        $fields[] = "price_estimate = :price";
        $params[':price'] = $price;
    }
    if ($isFeatured !== null) {
        $fields[] = "is_featured = :is_feat";
        $params[':is_feat'] = $isFeatured;
    }
    if ($isActive !== null) {
        $fields[] = "is_active = :is_act";
        $params[':is_act'] = $isActive;
    }

    if (!empty($fields)) {
        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    }

    // Update foto jika ada image_url baru
    if ($imageUrl) {
        // Cek apakah sudah ada record image
        $imgCheck = $db->prepare("SELECT id FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC LIMIT 1");
        $imgCheck->execute([':pid' => $id]);
        $existingImg = $imgCheck->fetch();

        if ($existingImg) {
            $updImg = $db->prepare("UPDATE product_images SET image_url = :url, is_primary = 1 WHERE id = :img_id");
            $updImg->execute([':url' => $imageUrl, ':img_id' => $existingImg['id']]);
        } else {
            $insImg = $db->prepare("INSERT INTO product_images (product_id, image_url, is_primary) VALUES (:pid, :url, 1)");
            $insImg->execute([':pid' => $id, ':url' => $imageUrl]);
        }
    }

    // Return updated product
    $resStmt = $db->prepare("SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                                    (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) AS image_url
                             FROM products p
                             LEFT JOIN categories c ON p.category_id = c.id
                             WHERE p.id = :id");
    $resStmt->execute([':id' => $id]);
    $updated = $resStmt->fetch();
    $updated['is_featured'] = (bool)$updated['is_featured'];
    $updated['is_active'] = (bool)$updated['is_active'];
    $updated['categories'] = [
        'name' => $updated['category_name'] ?: 'Umum',
        'slug' => $updated['category_slug'] ?: 'umum'
    ];

    jsonResponse($updated);
}

/**
 * DELETE Handler (Hapus Produk)
 */
function handleDeleteProduct($db) {
    requireAdmin();
    $data = getJsonInput();
    $id = isset($data['id']) ? (int)$data['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);

    if (!$id) {
        errorResponse('ID produk tidak disertakan', 422);
    }

    $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
    $stmt->execute([':id' => $id]);

    jsonResponse(['success' => true, 'message' => 'Produk berhasil dihapus']);
}
