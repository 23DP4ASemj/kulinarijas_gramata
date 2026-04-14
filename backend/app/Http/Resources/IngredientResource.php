<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IngredientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'amount' => $this->when(isset($this->pivot), $this->pivot?->amount),
            'unit' => $this->when(isset($this->pivot), $this->pivot?->unit),
        ];
    }
}
