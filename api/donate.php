<?php
require __DIR__ . '/db.php';

$d = input();

$amount = round((float)($d['amount'] ?? 0), 2);
$name   = clean($d['name']  ?? '', 120);
$phone  = clean($d['phone'] ?? '', 40);

if ($amount < 1 || $amount > 100000) {
    respond(422, ['ok' => false, 'error' => 'Please enter an amount between 1 and 100000 USD.']);
}
if (too_many('donation_pledges')) {
    respond(429, ['ok' => false, 'error' => 'Too many pledges. Please wait a few minutes.']);
}

try {
    $st = db()->prepare('INSERT INTO donation_pledges (amount_usd,donor_name,donor_phone,ip_address) VALUES (?,?,?,?)');
    $st->execute([$amount, $name ?: null, $phone ?: null, client_ip()]);
    respond(200, ['ok' => true, 'id' => (int)db()->lastInsertId()]);
} catch (PDOException $e) {
    error_log('ZEST donate: ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Could not save your pledge.']);
}
