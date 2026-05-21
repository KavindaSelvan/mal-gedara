<?php
declare(strict_types=1);
header('Content-Type: application/json');

// ─── CONFIG ─────────────────────────────────────────────────
define('SUBSCRIBERS_FILE', __DIR__ . '/data/subscribers.txt');
define('SHOP_NAME',        'Mal Gedara');
define('SHOP_EMAIL',       'hello@malgedara.lk');

// ─── HELPERS ────────────────────────────────────────────────

/**
 * Return a JSON response and exit.
 *
 * @param bool   $success
 * @param string $message
 * @param int    $httpCode
 */
function jsonResponse(bool $success, string $message, int $httpCode = 200): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

/**
 * Basic email validation (filter + MX record check).
 *
 * @param string $email
 * @return bool
 */
function isValidEmail(string $email): bool
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    // Optional: check MX record exists for the domain
    $domain = substr(strrchr($email, '@'), 1);
    return checkdnsrr($domain, 'MX');
}

/**
 * Append a new subscriber to the flat-file store.
 * Format: timestamp | email | ip
 *
 * @param string $email
 * @param string $ip
 */
function saveSubscriber(string $email, string $ip): void
{
    $dir = dirname(SUBSCRIBERS_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $line = implode(' | ', [
        date('Y-m-d H:i:s'),
        strtolower($email),
        $ip,
    ]) . PHP_EOL;

    file_put_contents(SUBSCRIBERS_FILE, $line, FILE_APPEND | LOCK_EX);
}

/**
 * Check whether an email is already subscribed.
 *
 * @param string $email
 * @return bool
 */
function alreadySubscribed(string $email): bool
{
    if (!file_exists(SUBSCRIBERS_FILE)) {
        return false;
    }

    $email = strtolower($email);
    $lines = file(SUBSCRIBERS_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $parts = explode(' | ', $line);
        if (isset($parts[1]) && trim($parts[1]) === $email) {
            return true;
        }
    }

    return false;
}

/**
 * Send a welcome email to the new subscriber using PHP mail().
 *
 * @param string $email
 */
function sendWelcomeEmail(string $email): void
{
    $subject = 'ආයුබෝවන්! Welcome to ' . SHOP_NAME;

    $body  = "ආයුබෝවන් (Āyubōvan)!\r\n\r\n";
    $body .= "Thank you for joining the Colorful Bunch at " . SHOP_NAME . ".\r\n\r\n";
    $body .= "You will be the first to know about:\r\n";
    $body .= "  - New arrivals from our Sri Lankan gardens\r\n";
    $body .= "  - Exclusive member discounts\r\n";
    $body .= "  - Seasonal floral collections\r\n\r\n";
    $body .= "Visit us: https://www.malgedara.lk\r\n\r\n";
    $body .= "With fragrant regards,\r\n";
    $body .= SHOP_NAME . " Team\r\n";
    $body .= "Colombo, Sri Lanka 🌺\r\n";

    $headers  = "From: " . SHOP_NAME . " <" . SHOP_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . SHOP_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    @mail($email, $subject, $body, $headers);
}

// ─── MAIN LOGIC ─────────────────────────────────────────────

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.', 405);
}

// Parse JSON body
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE || empty($data['email'])) {
    jsonResponse(false, 'Invalid request data.', 400);
}

$email = trim($data['email']);

// Validate
if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address.');
}

// Duplicate check
if (alreadySubscribed($email)) {
    jsonResponse(false, 'You are already subscribed. ස්තූතියි!');
}

// Save
saveSubscriber($email, $_SERVER['REMOTE_ADDR'] ?? 'unknown');

// Welcome email (best-effort, won't fail if mail() not configured)
sendWelcomeEmail($email);

jsonResponse(true, 'You have been subscribed. ස්තූතියි! (Thank you!)');