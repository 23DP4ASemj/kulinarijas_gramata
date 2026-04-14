<?php

namespace App\Http\Controllers;

use App\Http\Requests\Blog\StoreBlogPostRequest;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::query()->with('author');

        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            $query->where(function ($inner) use ($q) {
                $inner->where('title', 'like', '%'.$q.'%')
                    ->orWhere('excerpt', 'like', '%'.$q.'%')
                    ->orWhere('content', 'like', '%'.$q.'%');
            });
        }

        $category = trim((string) $request->query('category', ''));
        if ($category !== '') {
            $query->where('category', $category);
        }

        $sort = $request->query('sort', 'newest');
        if ($sort === 'oldest') {
            $query->orderBy('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        $posts = $query->paginate((int) $request->query('per_page', 6));

        return BlogPostResource::collection($posts);
    }

    public function show(BlogPost $blogPost)
    {
        $blogPost->increment('views_count');
        $blogPost->refresh();
        $blogPost->load('author');

        return response()->json([
            'blog_post' => new BlogPostResource($blogPost),
        ]);
    }

    public function store(StoreBlogPostRequest $request)
    {
        $validated = $request->validated();
        $excerpt = trim((string) ($validated['excerpt'] ?? ''));
        if ($excerpt === '') {
            $excerpt = Str::limit(
                preg_replace('/\s+/', ' ', strip_tags((string) ($validated['content'] ?? ''))),
                220
            );
        }

        $data = [
            ...$validated,
            'excerpt' => $excerpt,
            'user_id' => $request->user()->id,
        ];

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $data['image_path'] = $request->file('image')->store('blog_posts', 'public');
            $data['image_url'] = null;
        } elseif (array_key_exists('image_url', $data)) {
            $data['image_url'] = trim((string) $data['image_url']) ?: null;
        }

        $blogPost = BlogPost::create($data);

        $blogPost->load('author');

        return response()->json([
            'blog_post' => new BlogPostResource($blogPost),
        ], 201);
    }
}
