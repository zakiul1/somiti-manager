<?php

namespace App\Support;

class AppLocale
{
    public static function normalize(?string $locale, string $fallback = 'en'): string
    {
        return in_array($locale, ['en', 'bn'], true) ? $locale : $fallback;
    }

    public static function digits(string $value, string $locale): string
    {
        if ($locale !== 'bn') {
            return $value;
        }

        return strtr($value, [
            '0' => '০',
            '1' => '১',
            '2' => '২',
            '3' => '৩',
            '4' => '৪',
            '5' => '৫',
            '6' => '৬',
            '7' => '৭',
            '8' => '৮',
            '9' => '৯',
        ]);
    }

    public static function money(float|int|string $amount, string $locale): string
    {
        return self::digits(number_format((float) $amount, 2), $locale);
    }

    public static function integer(int|float|string $value, string $locale): string
    {
        return self::digits((string) (int) $value, $locale);
    }

    public static function date(?string $date, string $locale): string
    {
        if (! $date) {
            return '-';
        }

        return self::digits($date, $locale);
    }
}
