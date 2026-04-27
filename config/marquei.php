<?php
return [
    'staff_token_ttl' => env('STAFF_TOKEN_TTL', 43200),

    'groq' => [
        'api_key' => env('GROQ_API_KEY'),
        'model'   => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        'url'     => 'https://api.groq.com/openai/v1/chat/completions',
    ],

    'asaas' => [
        'api_key'     => env('ASAAS_API_KEY'),
        'environment' => env('ASAAS_ENVIRONMENT', 'sandbox'),
        'base_url'    => env('ASAAS_BASE_URL', 'https://sandbox.asaas.com/api/v3'),
    ],

    'whatsapp' => [
        'token'             => env('WHATSAPP_TOKEN'),
        'phone_number_id'   => env('WHATSAPP_PHONE_NUMBER_ID'),
        'verify_token'      => env('WHATSAPP_VERIFY_TOKEN', 'marquei_webhook_verify'),
        'api_version'       => env('WHATSAPP_API_VERSION', 'v22.0'),
    ],
];
