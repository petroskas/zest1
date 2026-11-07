<?php
/**
 * ZEST – database connection + small helpers.
 * XAMPP defaults: user "root", empty password. Change for any live server.
 */
const DB_HOST = '127.0.0.1';
const DB_NAME = 'zest_db';
const DB_USER = 'root';
const DB_PASS = '';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
             PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
             PDO::ATTR_EMULATE_PREPARES => false]
        );
    } catch (PDOException $e) {
        error_log('ZEST DB connect: ' . $e->getMessage());
        respond(500, ['ok' => false, 'error' => 'Database unavailable. Is MySQL running and schema.sql imported?']);
    }
    return $pdo;
}

/** Accepts JSON (fetch) or normal form posts. */
function input(): array {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false, 'error' => 'POST only']);
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

function clean(?string $v, int $max): string {
    $v = trim((string)$v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
}

function client_ip(): string {
    return substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
}

/** Simple abuse guard: max $limit rows per IP in the last 10 minutes. */
function too_many(string $table, int $limit = 5): bool {
    $st = db()->prepare("SELECT COUNT(*) FROM `$table` WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 10 MINUTE)");
    $st->execute([client_ip()]);
    return (int)$st->fetchColumn() >= $limit;
}
