<?php
require __DIR__ . '/db.php';

$data = input();
if (!is_string($data['question'] ?? null)) {
    respond(422, ['ok' => false, 'error' => 'Enter a question.']);
}
$question = clean($data['question'], 500);
if ($question === '') respond(422, ['ok' => false, 'error' => 'Enter a question.']);

$topicPattern = '/epilep|seizure|\bfit(s)?\b|disabil|accessib|inclus|impair|deaf|blind|autis|cerebral palsy|down syndrome|sign language|assistive|reasonable accommodation|discrimination|crpd|persons with disabilities/i';
if (!preg_match($topicPattern, $question)) {
    respond(422, ['ok' => false, 'error' => 'This assistant answers questions about epilepsy and disability only.']);
}

session_start(['use_strict_mode' => 1, 'cookie_httponly' => true, 'cookie_samesite' => 'Lax']);
$now = time();
$requests = array_values(array_filter(
    $_SESSION['zest_chat_requests'] ?? [],
    static fn($timestamp) => is_int($timestamp) && $timestamp > $now - 600
));
if (count($requests) >= 10) {
    respond(429, ['ok' => false, 'error' => 'Please wait a few minutes before asking another question.']);
}
$requests[] = $now;
$_SESSION['zest_chat_requests'] = $requests;
session_write_close();

$apiKey = getenv('GEMINI_API_KEY');
if (!$apiKey) respond(503, ['ok' => false, 'error' => 'The online assistant is not configured.']);
if (!function_exists('curl_init')) {
    error_log('ZEST chat: PHP cURL extension is unavailable.');
    respond(503, ['ok' => false, 'error' => 'The online assistant is unavailable.']);
}

$model = getenv('GEMINI_MODEL') ?: 'gemini-2.5-flash';
$url = 'https://generativelanguage.googleapis.com/v1beta/models/'
    . rawurlencode($model) . ':generateContent';
$payload = [
    'systemInstruction' => [
        'parts' => [[
            'text' => 'You are ZEST, an educational assistant restricted to epilepsy and disability, accessibility, inclusion and disability rights. Refuse all unrelated requests, even if they contain one of these keywords. Use Google Search grounding for factual answers and cite reliable sources. Always describe epilepsy as a neurological condition and use “people with epilepsy”; never say “people living with epilepsy”. Give general education only, not a diagnosis or individual treatment plan. Never tell users to start, stop or change medicine; refer medical decisions to a qualified clinician. For legal questions, state that laws vary and refer users to the source law or a qualified adviser. Keep answers concise, respectful and accessible.'
        ]]
    ],
    'contents' => [[
        'role' => 'user',
        'parts' => [['text' => $question]]
    ]],
    'tools' => [['google_search' => new stdClass()]],
    'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 600]
];

$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $apiKey
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 25
]);
$body = curl_exec($curl);
$status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
if ($body === false) {
    error_log('ZEST Gemini request: ' . curl_error($curl));
    curl_close($curl);
    respond(502, ['ok' => false, 'error' => 'The online assistant is temporarily unavailable.']);
}
curl_close($curl);

$result = json_decode($body, true);
$answer = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
if ($status < 200 || $status >= 300 || !is_string($answer) || $answer === '') {
    error_log('ZEST Gemini response status: ' . $status);
    respond(502, ['ok' => false, 'error' => 'The online assistant could not answer this question.']);
}

$answer = preg_replace('/people living with epilepsy/i', 'people with epilepsy', $answer) ?? $answer;
$answer = preg_replace('/\bepilepsy is (?:a )?medical condition\b/i', 'Epilepsy is a neurological condition', $answer) ?? $answer;
$sources = [];
foreach ($result['candidates'][0]['groundingMetadata']['groundingChunks'] ?? [] as $chunk) {
    $sourceUrl = $chunk['web']['uri'] ?? '';
    $sourceTitle = $chunk['web']['title'] ?? '';
    if (is_string($sourceUrl) && str_starts_with($sourceUrl, 'https://')) {
        $sources[] = ['url' => $sourceUrl, 'title' => is_string($sourceTitle) ? $sourceTitle : 'Source'];
    }
}
respond(200, ['ok' => true, 'answer' => $answer, 'sources' => array_slice($sources, 0, 4)]);
