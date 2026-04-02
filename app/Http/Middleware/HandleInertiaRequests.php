<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Support\AppLocale;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'roles' => $request->user()->getRoleNames()->values(),
                        'is_active' => (bool) $request->user()->is_active,
                    ]
                    : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'app' => [
                'name' => Setting::get('app_name', config('app.name', 'Pachbaria Swapnasiri Foundation')),
                'locale' => AppLocale::normalize($request->cookie('somiti_locale'), Setting::get('default_locale', 'en')),
                'theme' => in_array($request->cookie('somiti_theme'), ['light', 'dark'], true)
                    ? $request->cookie('somiti_theme')
                    : Setting::get('app_theme', 'light'),
            ],
        ];
    }
}