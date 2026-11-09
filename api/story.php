<?php
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false, 'error' => 'POST only']);
if (!empty($_SERVER['HTTP_ORIGIN'])) {
    $originHost = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST);
    $requestHost = parse_url('//' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST);
    if (!$originHost || !$requestHost || strcasecmp($originHost, $requestHost) !== 0) {
        respond(403, ['ok' => false, 'error' => 'Story submission was rejected.']);
    }
}
if (!empty($_POST['website'])) respond(200, ['ok' => true]);
if (($_POST['consent'] ?? '') !== '1') {
    respond(422, ['ok' => false, 'error' => 'Please confirm you have permission to share this story.']);
}

$story = clean($_POST['story'] ?? '', 5000);
$anonymous = isset($_POST['anonymous']) && $_POST['anonymous'] === '1';
$displayName = $anonymous ? null : clean($_POST['display_name'] ?? '', 80);

if ($story === '' || (!$anonymous && $displayName === '')) {
    respond(422, ['ok' => false, 'error' => 'Enter your story and the name to display, or choose anonymous sharing.']);
}

session_start(['use_strict_mode' => 1, 'cookie_httponly' => true, 'cookie_samesite' => 'Lax']);
$now = time();
$submissions = array_values(array_filter(
    $_SESSION['zest_story_submissions'] ?? [],
    static fn($timestamp) => is_int($timestamp) && $timestamp > $now - 3600
));
if (count($submissions) >= 5) {
    respond(429, ['ok' => false, 'error' => 'Please wait before sharing another story.']);
}
$submissions[] = $now;
$_SESSION['zest_story_submissions'] = $submissions;
session_write_close();

$photo = $_FILES['photo'] ?? null;
if ($photo && $photo['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($photo['error'] !== UPLOAD_ERR_OK || $photo['size'] > 3 * 1024 * 1024) {
        respond(422, ['ok' => false, 'error' => 'Choose an image smaller than 3 MB.']);
    }
    $image = @getimagesize($photo['tmp_name']);
    $mime = $image['mime'] ?? '';
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!$image || !isset($extensions[$mime]) || !is_uploaded_file($photo['tmp_name'])) {
        respond(422, ['ok' => false, 'error' => 'Use a valid JPG, PNG or WebP photo.']);
    }
} else {
    $photo = null;
}

$storedPhoto = null;
$temporaryPhotoPath = null;
try {
    $pdo = db();
    $pdo->beginTransaction();
    $insert = $pdo->prepare(
        'INSERT INTO community_stories (story, display_name, is_anonymous, status) VALUES (?, ?, ?, ?)'
    );
    $insert->execute([$story, $displayName, $anonymous ? 1 : 0, 'pending']);
    $id = (int)$pdo->lastInsertId();

    if ($photo) {
        $uploadRoot = getenv('ZEST_STORY_UPLOAD_DIR')
            ?: dirname($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__))
                . DIRECTORY_SEPARATOR . 'zest-private' . DIRECTORY_SEPARATOR . 'stories';
        $directory = rtrim($uploadRoot, DIRECTORY_SEPARATOR);
        if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
            throw new RuntimeException('Story photo storage is unavailable.');
        }
        $realDirectory = realpath($directory);
        $documentRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
        if ($realDirectory === false
            || ($documentRoot !== false
                && str_starts_with(
                    strtolower($realDirectory . DIRECTORY_SEPARATOR),
                    strtolower(rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR)
                ))) {
            throw new RuntimeException('Story photos must be stored outside the public web root.');
        }
        $filename = $id . '-' . bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
        $temporaryPhotoPath = $directory . DIRECTORY_SEPARATOR . $filename;
        if (!move_uploaded_file($photo['tmp_name'], $temporaryPhotoPath)) {
            throw new RuntimeException('Story photo could not be stored.');
        }
        $storedPhoto = 'stories/' . $filename;
        $update = $pdo->prepare('UPDATE community_stories SET photo_path = ? WHERE id = ?');
        $update->execute([$storedPhoto, $id]);
    }

    $pdo->commit();
    respond(200, ['ok' => true, 'status' => 'pending']);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
    if ($temporaryPhotoPath && is_file($temporaryPhotoPath)) unlink($temporaryPhotoPath);
    error_log('ZEST story: ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Could not save your story. Please try again.']);
}
