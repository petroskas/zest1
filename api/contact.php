<?php
require __DIR__ . '/db.php';

$d = input();

// Honeypot: real people leave this hidden field empty. Pretend success to bots.
if (!empty($d['website'])) respond(200, ['ok' => true]);

$name  = clean($d['name']  ?? '', 120);
$email = clean($d['email'] ?? '', 190);
$phone = clean($d['phone'] ?? '', 40);
$type  = clean($d['type']  ?? 'person', 20);
$msg   = clean($d['msg']   ?? ($d['message'] ?? ''), 3000);

$types = ['person','family','professional','employer','partner','volunteer','training','other'];
if (!in_array($type, $types, true)) $type = 'other';

if ($name === '' || $msg === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'Please complete name, a valid email and a message.']);
}
if (too_many('contact_messages')) {
    respond(429, ['ok' => false, 'error' => 'Too many messages. Please wait a few minutes.']);
}

try {
    $st = db()->prepare(
        'INSERT INTO contact_messages (full_name,email,phone,enquiry_type,message,ip_address,user_agent)
         VALUES (?,?,?,?,?,?,?)'
    );
    $st->execute([$name, $email, $phone ?: null, $type, $msg, client_ip(),
                  substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)]);
    respond(200, ['ok' => true, 'id' => (int)db()->lastInsertId()]);
} catch (PDOException $e) {
    error_log('ZEST contact: ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Could not save your message.']);
}
