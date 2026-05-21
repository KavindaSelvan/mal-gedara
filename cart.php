<?php

declare(strict_types=1);
session_start();
header('Content-Type: application/json');

// ─── HELPERS ────────────────────────────────────────────────

function jsonResponse(bool $success, string $message, array $extra = [], int $code = 200): void
{
    http_response_code($code);
    echo json_encode(array_merge(
        ['success' => $success, 'message' => $message],
        $extra
    ));
    exit;
}

function &getCart(): array
{
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }
    return $_SESSION['cart'];
}

function cartTotal(array $cart): string
{
    $total = 0.0;
    foreach ($cart as $item) {
        // Price stored as "රු. 2,800" — strip non-numeric characters for calculation
        $numericPrice = (float) preg_replace('/[^\d.]/', '', $item['price']);
        $total += $numericPrice * $item['qty'];
    }
    return 'රු. ' . number_format($total, 2);
}

// ─── ROUTING ────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'];

// Allow GET for ?action=get convenience
if ($method === 'GET') {
    $cart = &getCart();
    jsonResponse(true, 'Cart retrieved.', [
        'cart'  => $cart,
        'count' => array_sum(array_column($cart, 'qty')),
        'total' => cartTotal($cart),
    ]);
}

if ($method !== 'POST') {
    jsonResponse(false, 'Method not allowed.', [], 405);
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    jsonResponse(false, 'Invalid JSON body.', [], 400);
}

$action = strtolower(trim($data['action'] ?? ''));
$cart   = &getCart();

// ─── ADD ────────────────────────────────────────────────────
if ($action === 'add') {
    $name  = htmlspecialchars(trim($data['name']  ?? ''), ENT_QUOTES, 'UTF-8');
    $price = htmlspecialchars(trim($data['price'] ?? '0'), ENT_QUOTES, 'UTF-8');
    $qty   = max(1, (int) ($data['qty'] ?? 1));

    if (empty($name)) {
        jsonResponse(false, 'Product name is required.', [], 400);
    }

    // Check if item already in cart → increment qty
    $found = false;
    foreach ($cart as &$item) {
        if ($item['name'] === $name) {
            $item['qty'] += $qty;
            $found = true;
            break;
        }
    }
    unset($item);

    if (!$found) {
        $cart[] = [
            'name'  => $name,
            'price' => $price,
            'qty'   => $qty,
            'added' => date('Y-m-d H:i:s'),
        ];
    }

    jsonResponse(true, '"' . $name . '" added to cart. 🌸', [
        'cart'  => $cart,
        'count' => array_sum(array_column($cart, 'qty')),
        'total' => cartTotal($cart),
    ]);
}

// ─── REMOVE ─────────────────────────────────────────────────
if ($action === 'remove') {
    $index = (int) ($data['index'] ?? -1);

    if (!isset($cart[$index])) {
        jsonResponse(false, 'Item not found in cart.', [], 404);
    }

    $removed = $cart[$index]['name'];
    array_splice($cart, $index, 1);
    $cart = array_values($cart); // re-index

    jsonResponse(true, '"' . $removed . '" removed from cart.', [
        'cart'  => $cart,
        'count' => array_sum(array_column($cart, 'qty')),
        'total' => cartTotal($cart),
    ]);
}

// ─── CLEAR ──────────────────────────────────────────────────
if ($action === 'clear') {
    $_SESSION['cart'] = [];
    jsonResponse(true, 'Cart cleared.', ['cart' => [], 'count' => 0, 'total' => 'රු. 0.00']);
}

// ─── GET ────────────────────────────────────────────────────
if ($action === 'get') {
    jsonResponse(true, 'Cart retrieved.', [
        'cart'  => $cart,
        'count' => array_sum(array_column($cart, 'qty')),
        'total' => cartTotal($cart),
    ]);
}

jsonResponse(false, 'Unknown action: ' . htmlspecialchars($action), [], 400);