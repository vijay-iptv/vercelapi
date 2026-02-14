<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get environment variables (set in Vercel dashboard)
$userToken = '1464687407';
$subscriberId = 'Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ';

$content_api = "https://tb.tapi.videoready.tv/content-detail/api/partner/cdn/player/details/chotiluli/647";

// Initialize cURL
$ch = curl_init();

curl_setopt_array($ch, array(
    CURLOPT_URL => $content_api,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 8, // Important for Vercel
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER => array(
        "Authorization: Bearer " . $userToken,
        "subscriberId: " . $subscriberId,
        "Content-Type: application/json",
        "Accept: application/json",
        "User-Agent: Mozilla/5.0"
    )
));

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(array(
        "error" => curl_error($ch)
    ));
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(array(
        "error" => "API returned HTTP " . $httpCode
    ));
    exit;
}

header("Content-Type: application/json");
echo $response;
