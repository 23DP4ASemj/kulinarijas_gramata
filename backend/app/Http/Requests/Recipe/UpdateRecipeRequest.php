<?php

namespace App\Http\Requests\Recipe;

use App\Support\RecipeCategoryCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'category_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(
                    fn ($query) => $query->whereIn('name', RecipeCategoryCatalog::canonical())
                ),
            ],
            'prep_time_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'difficulty' => ['sometimes', 'nullable', 'string', Rule::in(['Easy', 'Medium', 'Hard'])],
            'quantity' => ['sometimes', 'nullable', 'string', 'max:120'],
            'image_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'remove_image' => ['sometimes', 'boolean'],
            'ingredients' => ['sometimes', 'nullable', 'array'],
            'ingredients.*.name' => ['required_with:ingredients', 'string', 'max:255'],
            'ingredients.*.amount' => ['nullable', 'string', 'max:50'],
            'ingredients.*.unit' => ['nullable', 'string', 'max:50'],
            'steps' => ['sometimes', 'array', 'min:1'],
            'steps.*' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'image_url.url' => 'Norādiet derīgu attēla URL.',
            'image.max' => 'Attēls nedrīkst būt lielāks par 5 MB.',
            'image.image' => 'Atļauti tikai attēlu faili.',
        ];
    }
}
