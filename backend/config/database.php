<?php

use Illuminate\Support\Str;

// Parse DATABASE_URL manually to avoid Laravel's ConfigurationUrlParser
// misinterpreting query-string parameters (e.g. client_encoding='utf8') as
// part of the port number — a known issue with the Postgres SSL template.
$dbUrl = env('DATABASE_URL', env('DB_URL'));
$dbParsed = [];
if ($dbUrl) {
    $parts = parse_url($dbUrl);
    if ($parts !== false) {
        $dbParsed['host']     = $parts['host'] ?? null;
        $dbParsed['port']     = isset($parts['port']) ? (string) $parts['port'] : null;
        $dbParsed['database'] = isset($parts['path']) ? ltrim($parts['path'], '/') : null;
        $dbParsed['username'] = $parts['user'] ?? null;
        $dbParsed['password'] = isset($parts['pass']) ? urldecode($parts['pass']) : null;

        // Extract query-string options (e.g. sslmode, client_encoding)
        if (!empty($parts['query'])) {
            parse_str($parts['query'], $query);
            $dbParsed['sslmode'] = $query['sslmode'] ?? null;
        }
    }
}

return [
    'default' => env('DB_CONNECTION', 'sqlite'),

    'connections' => [

    'pgsql' => [
        'driver' => 'pgsql',
        // Do NOT pass 'url' here — we parse it ourselves above to avoid the
        // port-parsing bug in Laravel's ConfigurationUrlParser.
        'host'     => $dbParsed['host']     ?? env('DB_HOST', '127.0.0.1'),
        'port'     => $dbParsed['port']     ?? env('DB_PORT', '5432'),
        'database' => $dbParsed['database'] ?? env('DB_DATABASE', 'forge'),
        'username' => $dbParsed['username'] ?? env('DB_USERNAME', 'forge'),
        'password' => $dbParsed['password'] ?? env('DB_PASSWORD', ''),
        'charset' => 'utf8',
        'prefix' => '',
        'prefix_indexes' => true,
        'search_path' => env('DB_SCHEMA', 'public'),
        'sslmode' => $dbParsed['sslmode'] ?? env('DB_SSLMODE', 'prefer'),
        ],
    'sqlite' => [
        'driver' => 'sqlite',
        'url' => env('DATABASE_URL'),
        'database' => env('DB_DATABASE', database_path('database.sqlite')),
        'prefix' => '',
        'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DATABASE_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],
    ],

    'migrations' => 'migrations',
];
