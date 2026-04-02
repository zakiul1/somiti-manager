<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(): Response
    {
        abort_unless(auth()->user()?->hasAnyRole(['super-admin', 'admin']), 403);

        return Inertia::render('settings/index', [
            'settings' => [
                'organization_name_en' => Setting::get('organization_name_en', Setting::get('app_name', 'Pachbaria Swapnasiri Foundation')),
                'organization_name_bn' => Setting::get('organization_name_bn', 'পাচবাড়িয়া স্বপ্নসিঁড়ি ফাউন্ডেশন'),
                'organization_address_en' => Setting::get('organization_address_en', ''),
                'organization_address_bn' => Setting::get('organization_address_bn', ''),
                'organization_phone' => Setting::get('organization_phone', ''),
                'organization_email' => Setting::get('organization_email', ''),
                'organization_footer_en' => Setting::get('organization_footer_en', 'Computer generated document.'),
                'organization_footer_bn' => Setting::get('organization_footer_bn', 'এটি একটি কম্পিউটার দ্বারা তৈরি ডকুমেন্ট।'),
                'organization_authority_name' => Setting::get('organization_authority_name', ''),
                'organization_authority_title_en' => Setting::get('organization_authority_title_en', 'Authorized Signature'),
                'organization_authority_title_bn' => Setting::get('organization_authority_title_bn', 'অনুমোদিত স্বাক্ষর'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless(auth()->user()?->hasAnyRole(['super-admin', 'admin']), 403);

        $validated = $request->validate([
            'organization_name_en' => ['required', 'string', 'max:255'],
            'organization_name_bn' => ['required', 'string', 'max:255'],
            'organization_address_en' => ['nullable', 'string', 'max:500'],
            'organization_address_bn' => ['nullable', 'string', 'max:500'],
            'organization_phone' => ['nullable', 'string', 'max:50'],
            'organization_email' => ['nullable', 'email', 'max:255'],
            'organization_footer_en' => ['nullable', 'string', 'max:500'],
            'organization_footer_bn' => ['nullable', 'string', 'max:500'],
            'organization_authority_name' => ['nullable', 'string', 'max:255'],
            'organization_authority_title_en' => ['nullable', 'string', 'max:255'],
            'organization_authority_title_bn' => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['group' => 'print', 'value' => $value ?? '']
            );
        }

        return back()->with('success', 'Settings saved successfully.');
    }
}