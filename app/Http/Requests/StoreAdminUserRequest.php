<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super-admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'username' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                'unique:users,username',
            ],

            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],

            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-() ]+$/'],
            'designation' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],

            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'nid_front' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'nid_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],

            'remove_photo' => ['nullable', 'boolean'],
            'remove_nid_front' => ['nullable', 'boolean'],
            'remove_nid_back' => ['nullable', 'boolean'],

            'password' => ['required', 'confirmed', Password::defaults()],
            'password_confirmation' => ['required'],

            'role' => ['required', Rule::in(['super-admin', 'admin'])],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __('Admin name is required.'),
            'username.alpha_dash' => __('Username may only contain letters, numbers, dashes, and underscores.'),
            'username.unique' => __('This username is already used by another user.'),
            'email.required' => __('Email is required.'),
            'email.email' => __('Please enter a valid email address.'),
            'email.unique' => __('This email is already used by another user.'),
            'phone.regex' => __('Please enter a valid phone number.'),
            'photo.image' => __('Photo must be an image file.'),
            'photo.mimes' => __('Photo must be JPG, JPEG, PNG, or WEBP.'),
            'photo.max' => __('Photo may not be greater than 4 MB.'),
            'nid_front.mimes' => __('NID front must be JPG, JPEG, PNG, WEBP, or PDF.'),
            'nid_front.max' => __('NID front file may not be greater than 5 MB.'),
            'nid_back.mimes' => __('NID back must be JPG, JPEG, PNG, WEBP, or PDF.'),
            'nid_back.max' => __('NID back file may not be greater than 5 MB.'),
            'password.required' => __('Password is required.'),
            'password.confirmed' => __('Password confirmation does not match.'),
            'password_confirmation.required' => __('Password confirmation is required.'),
            'role.required' => __('Role is required.'),
            'role.in' => __('Selected role is invalid.'),
        ];
    }
}