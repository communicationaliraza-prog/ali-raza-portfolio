<?php
header('Content-Type: application/json');

// Simple function to load .env file
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load environment variables
loadEnv(__DIR__ . '/.env');

$apiKey = getenv('GEMINI_API_KEY');
if (!$apiKey || $apiKey === 'your_gemini_api_key_here') {
    echo json_encode(['error' => 'API Key not configured in .env file']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';

if (!$userMessage) {
    echo json_encode(['error' => 'No message provided']);
    exit;
}

// Prepare the request for Gemini API
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;

$data = [
    "system_instruction" => [
        "parts" => [
            ["text" => "You are a helpful, professional, and friendly AI assistant on the personal portfolio website of Ali Raza, an IT Officer and IT Support Specialist. You answer questions about Ali's skills, experience, projects, and contact info based on his portfolio. Keep responses concise, professional, and helpful."]
        ]
    ],
    "contents" => [
        [
            "role" => "user",
            "parts" => [
                ["text" => $userMessage]
            ]
        ]
    ]
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];
$context  = stream_context_create($options);

// Suppress errors to handle them manually
$response = @file_get_contents($url, false, $context);

if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to connect to AI service. Please check your API key and connection.']);
    exit;
}

$result = json_decode($response, true);
$aiReply = $result['candidates'][0]['content']['parts'][0]['text'] ?? "Sorry, I couldn't understand that.";

echo json_encode(['reply' => $aiReply]);
