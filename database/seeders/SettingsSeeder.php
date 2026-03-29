<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['group' => 'general', 'key' => 'app_name', 'value' => 'Somiti Manager'],
            ['group' => 'general', 'key' => 'default_locale', 'value' => 'en'],
            ['group' => 'general', 'key' => 'currency', 'value' => 'BDT'],
            ['group' => 'general', 'key' => 'currency_symbol', 'value' => '৳'],
            ['group' => 'print', 'key' => 'organization_name_en', 'value' => 'Somiti Manager'],
            ['group' => 'print', 'key' => 'organization_name_bn', 'value' => 'সমিতি ম্যানেজার'],
            ['group' => 'print', 'key' => 'organization_address_en', 'value' => 'Single Branch Cooperative Office'],
            ['group' => 'print', 'key' => 'organization_address_bn', 'value' => 'একক শাখা সমিতি অফিস'],
            ['group' => 'print', 'key' => 'organization_phone', 'value' => ''],
            ['group' => 'print', 'key' => 'organization_email', 'value' => ''],
            ['group' => 'print', 'key' => 'organization_footer_en', 'value' => 'Computer generated document. Please verify before filing.'],
            ['group' => 'print', 'key' => 'organization_footer_bn', 'value' => 'এটি কম্পিউটার দ্বারা তৈরি ডকুমেন্ট। ফাইল করার আগে যাচাই করুন।'],
            ['group' => 'print', 'key' => 'organization_authority_name', 'value' => ''],
            ['group' => 'print', 'key' => 'organization_authority_title_en', 'value' => 'Authorized Signature'],
            ['group' => 'print', 'key' => 'organization_authority_title_bn', 'value' => 'অনুমোদিত স্বাক্ষর'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
