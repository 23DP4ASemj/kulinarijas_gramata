<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category ? [
                'id' => (int) $this->category->id,
                'name' => $this->category->name,
            ] : null,
            'author' => $this->author ? [
                'id' => (int) $this->author->id,
                'name' => $this->author->name,
            ] : null,
            'ingredients' => IngredientResource::collection($this->whenLoaded('ingredients')),
            'steps' => $this->whenLoaded(
                'steps',
                fn () => $this->steps
                    ->map(fn ($step) => [
                        'id' => (int) $step->id,
                        'step_number' => (int) $step->step_number,
                        'instruction' => $step->instruction,
                    ])
                    ->values(),
                []
            ),
            'avg_rating' => (float) ($this->ratings_avg_value ?? 0),
            'ratings_count' => (int) ($this->ratings_count ?? 0),
            'my_rating' => $this->my_rating ?? null,
            'prep_time_minutes' => $this->prep_time_minutes !== null ? (int) $this->prep_time_minutes : null,
            'difficulty' => $this->difficulty,
            'quantity' => $this->quantity,
            'image_url' => $this->image_url,
            'image_input_url' => $this->getRawOriginal('image_url'),
            'image_source' => $this->image_path ? 'file' : ($this->getRawOriginal('image_url') ? 'url' : null),
            'favorites_count' => (int) ($this->favorites_count ?? 0),
            'is_favorited_by_me' => (bool) ($this->is_favorited_by_me ?? false),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
