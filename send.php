<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const RATE_LIMIT_SECONDS = 30;

function jsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sanitizeText(?string $value, int $maxLength = 255): string
{
    $value = trim((string) $value);
    $value = strip_tags($value);
    $value = preg_replace('/\s+/u', ' ', $value) ?? $value;

    if (function_exists('mb_substr')) {
        $value = mb_substr($value, 0, $maxLength, 'UTF-8');
    } else {
        $value = substr($value, 0, $maxLength);
    }

    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function sanitizePhone(?string $value): string
{
    $value = trim((string) $value);
    $value = preg_replace('/[^0-9+]/', '', $value) ?? '';

    if ($value === '') {
        return '';
    }

    $hasLeadingPlus = isset($value[0]) && $value[0] === '+';
    $digitsOnly = preg_replace('/\D/', '', $value) ?? '';

    return $hasLeadingPlus ? '+' . $digitsOnly : $digitsOnly;
}

function loadTelegramConfig(): array
{
    $token = trim((string) getenv('TG_BOT_TOKEN'));
    $chatId = trim((string) getenv('TG_CHAT_ID'));

    /*
     * В ПРОДАКШЕНЕ ВЫНЕСТИ В .env ИЛИ config.php ЗА ПРЕДЕЛЫ PUBLIC_HTML.
     * Если используете config.php, подключайте его до этой точки и задавайте
     * значения через environment variables или защищенные константы.
     */

    if ($token === '' || $chatId === '') {
        jsonResponse(500, [
            'status' => 'error',
            'message' => 'Server configuration error.',
        ]);
    }

    return [$token, $chatId];
}

function sendTelegramMessage(string $token, string $chatId, string $message): void
{
    if (!function_exists('curl_init')) {
        jsonResponse(500, [
            'status' => 'error',
            'message' => 'cURL is not available on the server.',
        ]);
    }

    $endpoint = sprintf('https://api.telegram.org/bot%s/sendMessage', $token);
    $payload = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ];

    $ch = curl_init($endpoint);

    if ($ch === false) {
        jsonResponse(500, [
            'status' => 'error',
            'message' => 'Failed to initialize request.',
        ]);
    }

    $encodedPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $encodedPayload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
    ]);

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($response === false) {
        error_log('Telegram send failed: ' . $curlError);
        jsonResponse(502, [
            'status' => 'error',
            'message' => 'Failed to deliver the message.',
        ]);
    }

    $decodedResponse = json_decode($response, true);

    if ($httpCode !== 200 || !is_array($decodedResponse) || empty($decodedResponse['ok'])) {
        error_log('Telegram API error. HTTP ' . $httpCode . '. Response: ' . $response);
        jsonResponse(502, [
            'status' => 'error',
            'message' => 'Failed to deliver the message.',
        ]);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    jsonResponse(405, [
        'status' => 'error',
        'message' => 'Method not allowed.',
    ]);
}

if (isset($_SESSION['last_submit']) && (time() - (int) $_SESSION['last_submit']) < RATE_LIMIT_SECONDS) {
    jsonResponse(429, [
        'status' => 'error',
        'message' => 'Too many requests. Please try again later.',
    ]);
}

$name = sanitizeText($_POST['user_name'] ?? '', 120);
$phone = sanitizePhone($_POST['user_phone'] ?? '');
$formSubject = sanitizeText($_POST['form_subject'] ?? 'New lead from website', 160);
$company = sanitizeText($_POST['company'] ?? '', 160);
$email = trim((string) ($_POST['email'] ?? ''));
$comment = sanitizeText($_POST['comment'] ?? '', 500);

$phoneDigits = preg_replace('/\D/', '', $phone) ?? '';

if ($phoneDigits === '' || strlen($phoneDigits) < 10) {
    jsonResponse(422, [
        'status' => 'error',
        'message' => 'Invalid phone number.',
    ]);
}

if ($email !== '') {
    $email = filter_var($email, FILTER_VALIDATE_EMAIL) ?: '';
    if ($email === '') {
        jsonResponse(422, [
            'status' => 'error',
            'message' => 'Invalid email address.',
        ]);
    }

    $email = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

if ($name === '') {
    $name = 'Не указано';
}

[$telegramToken, $telegramChatId] = loadTelegramConfig();

$messageLines = [
    '<b>Новая заявка с сайта</b>',
    '<b>Тема:</b> ' . $formSubject,
    '<b>Имя:</b> ' . $name,
    '<b>Телефон:</b> ' . htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
];

if ($company !== '') {
    $messageLines[] = '<b>Компания / ИНН:</b> ' . $company;
}

if ($email !== '') {
    $messageLines[] = '<b>Email:</b> ' . $email;
}

if ($comment !== '') {
    $messageLines[] = '<b>Комментарий:</b> ' . $comment;
}

$messageText = implode("\n", $messageLines);

sendTelegramMessage($telegramToken, $telegramChatId, $messageText);

$_SESSION['last_submit'] = time();

jsonResponse(200, [
    'status' => 'success',
]);
