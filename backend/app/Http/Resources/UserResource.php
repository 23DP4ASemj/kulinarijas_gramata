<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'role' => $this->effective_role,
            'assigned_role' => $this->getAssignedRole(),
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'avatar_url' => $this->avatar_url,
            'avatar_input_url' => $this->getRawOriginal('avatar_url'),
            'avatar_source' => $this->avatar_path ? 'file' : ($this->getRawOriginal('avatar_url') ? 'url' : null),
        ];
    }
}
