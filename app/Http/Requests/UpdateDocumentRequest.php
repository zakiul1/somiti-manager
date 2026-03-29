<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'string', 'max:100'],
            'entity_type' => ['required', Rule::in(['customer', 'loan'])],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id', 'required_if:entity_type,customer'],
            'loan_id' => ['nullable', 'integer', 'exists:loans,id', 'required_if:entity_type,loan'],
            'issue_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:issue_date'],
            'file_reference' => ['nullable', 'string', 'max:255'],
            'upload_file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,webp,doc,docx,xls,xlsx,csv,txt'],
            'remove_file' => ['nullable', 'boolean'],
            'status' => ['required', Rule::in(['draft', 'active', 'expired', 'archived'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
