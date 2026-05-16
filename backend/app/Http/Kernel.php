<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * Global HTTP middleware stack.
     *
     * @var array<int, class-string|string>
     */
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,

        \App\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * Route middleware groups.
     *
     * IMPORTANT:
     * We define BOTH 'api' and a MINIMAL 'web' group to prevent:
     * "Target class [web] does not exist".
     *
     * @var array<string, array<int, class-string|string>>
     */
    protected $middlewareGroups = [
        // Minimal web group (NO cookies/sessions/csrf)
        'web' => [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * Middleware aliases.
     *
     * @var array<string, class-string>
     */
    protected $middlewareAliases = [
        // Auth
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,

        // Authorization
        'can' => \Illuminate\Auth\Middleware\Authorize::class,

        // Throttling
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,

        // Signed URLs (harmless)
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,

        // Roles & email verification
        'role' => \App\Http\Middleware\RoleMiddleware::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];
}
