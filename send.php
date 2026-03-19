<?php
header('Content-Type: text/html; charset=utf-8');

// Ключи Telegram
$token = "8218461409:AAEQPP4RkZcjUuiEKsVG3HPFDcLiRy4QUqY";
$chat_id = "1179782469";

// Сбор данных
$name = isset($_POST['name']) ? trim($_POST['name']) : (isset($_POST['consult_name']) ? trim($_POST['consult_name']) : '');
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : (isset($_POST['consult_phone']) ? trim($_POST['consult_phone']) : '');
$comment = isset($_POST['comment']) ? trim($_POST['comment']) : (isset($_POST['consult_comment']) ? trim($_POST['consult_comment']) : '');
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

// Проверка на пустой телефон (защита от спама)
if (empty($phone)) {
    header('Location: /');
    exit;
}

// Формирование текста сообщения
$arr = array(
  "🔥 Новая заявка с сайта!" => "",
  "Имя: " => $name,
  "Телефон: " => $phone,
  "Компания/ИНН: " => $company,
  "Email: " => $email,
  "Комментарий: " => $comment
);

$txt = "";
foreach($arr as $key => $value) {
    if (!empty($value) || $key == "🔥 Новая заявка с сайта!") {
        $txt .= "<b>".$key."</b> ".$value."%0A";
    }
}

// Отправка в Telegram
$sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");

// ЗАДЕЛ ПОД ALBATO (amoCRM)
// Здесь позже будет CURL-запрос на вебхук Albato

// Редирект на success.html
if ($sendToTelegram) {
    header('Location: /success.html');
} else {
    header('Location: /success.html'); // Даже при ошибке ТГ не пугаем клиента
}
?>
