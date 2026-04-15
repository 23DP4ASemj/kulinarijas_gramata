<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'avg_rating' => (float) ($this->ratings_avg_value ?? 0),
            'ratings_count' => (int) ($this->ratings_count ?? 0),
            'prep_time_minutes' => $this->prep_time_minutes !== null ? (int) $this->prep_time_minutes : null,
            'difficulty' => $this->difficulty,
            'favorites_count' => (int) ($this->favorites_count ?? 0),
            'is_favorited_by_me' => (bool) ($this->is_favorited_by_me ?? false),
        ];
    }
}