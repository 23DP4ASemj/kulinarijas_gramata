<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'title' => $this->title,
            'category' => $this->category,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'image_url' => $this->image_url,
            'image_input_url' => $this->getRawOriginal('image_url'),
            'image_source' => $this->image_path ? 'file' : ($this->getRawOriginal('image_url') ? 'url' : null),
            'views' => (int) ($this->views_count ?? 0),
            'views_count' => (int) ($this->views_count ?? 0),
            'comments' => (int) ($this->comments_count ?? 0),
            'comments_count' => (int) ($this->comments_count ?? 0),
            'author_id' => (int) $this->user_id,
            'author_name' => $this->author?->name ?? 'Autors',
            'source' => 'Blogs',
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
