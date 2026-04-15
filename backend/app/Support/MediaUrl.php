<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class MediaUrl
{
    public static function publicDisk(?string $explicitUrl, ?string $path): ?string
    {
        $normalizedExplicitUrl = static::normalize($explicitUrl);
        if ($normalizedExplicitUrl !== null) {
            return $normalizedExplicitUrl;
        }

        if (!$path) {
            return null;
        }

        return static::absolute(Storage::disk('public')->url($path));
    }

    public static function normalize(?string $value): ?string
    {
        $value = trim((string) $value);
        if ($value === '') {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        return static::absolute($value);
    }

    private static function absolute(string $path): string
    {
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        $request = app()->bound('request') ? app('request') : null;
        $root = $request && $request->getHost()
            ? $request->getSchemeAndHttpHost()
            : rtrim((string) config('app.url'), '/');

        return rtrim($root, '/').'/'.ltrim($path, '/');
    }
}
