<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\UserAchievementService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(RegisterRequest $request, AuthService $authService, UserAchievementService $achievementService)
    {
        $data = $request->validated();
        $result = $authService->register($data);
        $user = $result['user'];
        $token = $result['token'];
        $achievementService->initializeForNewUser($user);

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
            'message' => 'Verifikācijas e-pasts nosūtīts.',
        ]);
    }

    public function login(LoginRequest $request, AuthService $authService)
    {
        $data = $request->validated();
        $result = $authService->login($data);
        $user = $result['user'];
        $token = $result['token'];

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Izrakstīšanās veiksmīga.']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'E-pasts jau ir verificēts.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verifikācijas e-pasts nosūtīts.']);
    }
}
