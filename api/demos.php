<?php
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $rows = db()->query(
            'SELECT d.slug, d.title, d.brain_type AS brainType, d.description, '
            . 'd.first_aid AS firstAid, d.animation_class AS animationClass, '
            . 'COALESCE(s.view_count, 0) AS views '
            . 'FROM seizure_demos d LEFT JOIN seizure_demo_stats s ON s.demo_slug = d.slug '
            . 'ORDER BY d.sort_order'
        )->fetchAll();
        if (!$rows) respond(503, ['ok' => false, 'error' => 'The seizure dataset has not been imported.']);
        respond(200, $rows);
    } catch (PDOException $e) {
        error_log('ZEST demos: ' . $e->getMessage());
        respond(500, ['ok' => false, 'error' => 'Could not load the seizure dataset.']);
    }
}

$data = input();
$slug = clean($data['slug'] ?? '', 2);
$allowed = ['tc', 'ab', 'fa', 'my', 'at', 'to'];
if (!in_array($slug, $allowed, true)) {
    respond(422, ['ok' => false, 'error' => 'Choose a valid demonstration.']);
}

try {
    $update = db()->prepare('UPDATE seizure_demo_stats SET view_count = view_count + 1 WHERE demo_slug = ?');
    $update->execute([$slug]);
    if ($update->rowCount() !== 1) {
        respond(404, ['ok' => false, 'error' => 'Demonstration not found.']);
    }
    $count = db()->prepare('SELECT view_count FROM seizure_demo_stats WHERE demo_slug = ?');
    $count->execute([$slug]);
    respond(200, ['ok' => true, 'views' => (int)$count->fetchColumn()]);
} catch (PDOException $e) {
    error_log('ZEST demo view: ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Could not save this demonstration view.']);
}
