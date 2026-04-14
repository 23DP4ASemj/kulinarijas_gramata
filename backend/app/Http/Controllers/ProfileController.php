<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\UserAchievementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request, UserAchievementService $achievementService)
    {
        $user = $request->user();
        $achievementProfile = $achievementService->getProfileData($user);

        return response()->json([
            'user' => new UserResource($user),
            'stats' => $achievementProfile['metrics'],
            'achievement_summary' => $achievementProfile['summary'],
            'achievements' => $achievementProfile['achievements'],
            'achievement_notifications' => [
                'pending' => $achievementProfile['notifications'],
            ],
            'recipes' => $achievementService->getOwnRecipes($user),
        ]);
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();
        $user->name = $validated['name'];
        $shouldRemoveAvatar = (bool) ($validated['remove_avatar'] ?? false);
        $hasNewAvatar = $request->hasFile('avatar') && $request->file('avatar')->isValid();
        $hasIncomingAvatarUrl = array_key_exists('avatar_url', $validated);

        if ($shouldRemoveAvatar || $hasNewAvatar || $hasIncomingAvatarUrl) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $user->avatar_path = null;
        }

        if ($shouldRemoveAvatar) {
            $user->avatar_url = null;
        }

        if ($hasNewAvatar) {
            $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = null;
        }

        if ($hasIncomingAvatarUrl) {
            if (trim((string) $validated['avatar_url']) === '') {
                $user->avatar_url = null;
            } else {
                $user->avatar_url = $validated['avatar_url'];
            }
        }

        $user->save();

        return response()->json(['user' => new UserResource($user)]);
    }

    public function achievementNotifications(Request $request, UserAchievementService $achievementService)
    {
        $achievementProfile = $achievementService->getProfileData($request->user());

        return response()->json([
            'notifications' => $achievementProfile['notifications'],
        ]);
    }

    public function markAchievementNotificationsAsRead(Request $request, UserAchievementService $achievementService)
    {
        $updated = $achievementService->markNotificationsAsRead($request->user());

        return response()->json([
            'updated' => $updated,
        ]);
    }
}
