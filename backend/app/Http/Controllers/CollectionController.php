<?php

namespace App\Http\Controllers;

use App\Http\Requests\Collection\StoreCollectionRequest;
use App\Http\Requests\Collection\UpdateCollectionRequest;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use App\Models\Recipe;
use App\Services\CollectionService;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::query()->with(['recipes:id,title']);

        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $collections = $query->orderBy('created_at', 'desc')->get();

        return CollectionResource::collection($collections);
    }

    public function store(StoreCollectionRequest $request, CollectionService $collectionService)
    {
        $collection = $collectionService->create($request->user(), $request->validated());

        return response()->json(['collection' => new CollectionResource($collection)], 201);
    }

    public function show(Collection $collection)
    {
        $this->authorize('update', $collection);

        $collection->load(['recipes:id,title']);

        return response()->json(['collection' => new CollectionResource($collection)]);
    }

    public function update(UpdateCollectionRequest $request, Collection $collection, CollectionService $collectionService)
    {
        $this->authorize('update', $collection);

        $collection = $collectionService->update($collection, $request->validated());

        return response()->json(['collection' => new CollectionResource($collection)]);
    }

    public function destroy(Collection $collection, CollectionService $collectionService)
    {
        $this->authorize('delete', $collection);

        $collectionService->delete($collection);

        return response()->json(['message' => 'Kolekcija dzēsta.']);
    }

    public function addRecipe(Request $request, Collection $collection, Recipe $recipe, CollectionService $collectionService)
    {
        $this->authorize('update', $collection);

        $collectionService->addRecipe($collection, $recipe);

        return response()->json(['message' => 'Recepte pievienota.']);
    }

    public function removeRecipe(Collection $collection, Recipe $recipe, CollectionService $collectionService)
    {
        $this->authorize('update', $collection);

        $collectionService->removeRecipe($collection, $recipe);

        return response()->json(['message' => 'Recepte noņemta.']);
    }
}
