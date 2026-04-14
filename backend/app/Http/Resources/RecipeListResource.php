<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class RecipeListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'author' => $this->whenLoaded('author', fn () => new UserResource($this->author)),
            'avg_rating' => (float) ($this->ratings_avg_value ?? 0),
            'ratings_count' => (int) ($this->ratings_count ?? 0),
            'prep_time_minutes' => $this->prep_time_minutes !== null ? (int) $this->prep_time_minutes : null,
            'difficulty' => $this->difficulty,
            'image_url' => $this->image_url ?: ($this->image_path ? url(Storage::disk('public')->url($this->image_path)) : null),
            'favorites_count' => (int) ($this->favorites_count ?? 0),
            'is_favorited_by_me' => (bool) ($this->is_favorited_by_me ?? false),
        ];
    }
}
