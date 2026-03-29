<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Customer;
use App\Models\Document;
use App\Models\Loan;
use App\Services\AuditLogService;
use App\Services\CsvExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->string('search');
        $entityType = (string) $request->string('entity_type');
        $status = (string) $request->string('status');
        $documentType = (string) $request->string('document_type');

        $documents = Document::query()
            ->with(['customer:id,name,customer_code', 'loan:id,loan_code'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('document_code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('document_type', 'like', "%{$search}%")
                        ->orWhere('file_reference', 'like', "%{$search}%")
                        ->orWhere('original_file_name', 'like', "%{$search}%");
                });
            })
            ->when($entityType !== '', fn ($query) => $query->where('entity_type', $entityType))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($documentType !== '', fn ($query) => $query->where('document_type', $documentType))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Document $document) => [
                'id' => $document->id,
                'document_code' => $document->document_code,
                'title' => $document->title,
                'document_type' => $document->document_type,
                'entity_type' => $document->entity_type,
                'status' => $document->status,
                'issue_date' => optional($document->issue_date)->toDateString(),
                'expiry_date' => optional($document->expiry_date)->toDateString(),
                'file_reference' => $document->file_reference,
                'original_file_name' => $document->original_file_name,
                'file_url' => $document->file_url,
                'readable_file_size' => $document->readable_file_size,
                'has_file' => filled($document->file_path),
                'customer' => $document->customer ? [
                    'id' => $document->customer->id,
                    'name' => $document->customer->name,
                    'customer_code' => $document->customer->customer_code,
                ] : null,
                'loan' => $document->loan ? [
                    'id' => $document->loan->id,
                    'loan_code' => $document->loan->loan_code,
                ] : null,
            ]);

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'filters' => [
                'search' => $search,
                'entity_type' => $entityType,
                'status' => $status,
                'document_type' => $documentType,
            ],
            'stats' => [
                'total' => Document::count(),
                'active' => Document::where('status', 'active')->count(),
                'storedFiles' => Document::whereNotNull('file_path')->count(),
                'expiring' => Document::whereNotNull('expiry_date')->whereBetween('expiry_date', [today(), today()->addDays(30)])->count(),
                'expired' => Document::where('status', 'expired')->orWhere(function ($query) {
                    $query->whereNotNull('expiry_date')->whereDate('expiry_date', '<', today());
                })->count(),
            ],
        ]);
    }


    public function export(Request $request)
    {
        $search = (string) $request->string('search');
        $entityType = (string) $request->string('entity_type');
        $status = (string) $request->string('status');
        $documentType = (string) $request->string('document_type');

        $rows = Document::query()
            ->with(['customer:id,name,customer_code', 'loan:id,loan_code'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('document_code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('document_type', 'like', "%{$search}%")
                        ->orWhere('file_reference', 'like', "%{$search}%")
                        ->orWhere('original_file_name', 'like', "%{$search}%");
                });
            })
            ->when($entityType !== '', fn ($query) => $query->where('entity_type', $entityType))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($documentType !== '', fn ($query) => $query->where('document_type', $documentType))
            ->latest()
            ->get()
            ->map(fn (Document $document) => [
                $document->document_code,
                $document->title,
                $document->document_type,
                $document->entity_type,
                $document->customer?->customer_code,
                $document->customer?->name,
                $document->loan?->loan_code,
                $document->status,
                $document->issue_date?->format('Y-m-d'),
                $document->expiry_date?->format('Y-m-d'),
                $document->original_file_name,
                $document->created_at?->format('Y-m-d H:i:s'),
            ]);

        return CsvExportService::download('documents-' . now()->format('Y-m-d-His') . '.csv', ['Document Code', 'Title', 'Document Type', 'Entity Type', 'Customer Code', 'Customer Name', 'Loan Code', 'Status', 'Issue Date', 'Expiry Date', 'Stored File', 'Created At'], $rows);
    }

    public function create(Request $request): Response
    {
        $entityType = $request->query('entity_type', 'customer');
        $customerId = $request->query('customer_id');
        $loanId = $request->query('loan_id');

        return Inertia::render('documents/create', [
            'documentCode' => $this->generateDocumentCode(),
            'customers' => Customer::query()->select('id', 'name', 'customer_code')->orderBy('name')->get(),
            'loans' => Loan::query()->with('customer:id,name')->select('id', 'loan_code', 'customer_id')->latest()->get()->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'customer_id' => $loan->customer_id,
                'customer_name' => $loan->customer?->name,
            ]),
            'selectedEntity' => [
                'entity_type' => $entityType,
                'customer_id' => $customerId ? (int) $customerId : null,
                'loan_id' => $loanId ? (int) $loanId : null,
            ],
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('upload_file');
        $data['document_code'] = $this->generateDocumentCode();
        $data = $this->attachStoredFileData($request, $data);

        $document = Document::create([
            ...$data,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        AuditLogService::log('document', 'created', 'Document created.', $document, $request->user()?->id, $document->document_code, [
            'entity_type' => $document->entity_type,
            'status' => $document->status,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Document created successfully.');
    }

    public function show(Document $document): Response
    {
        $document->load(['customer:id,name,customer_code,phone,email', 'loan:id,loan_code,customer_id,status']);

        return Inertia::render('documents/show', [
            'document' => [
                'id' => $document->id,
                'document_code' => $document->document_code,
                'title' => $document->title,
                'document_type' => $document->document_type,
                'entity_type' => $document->entity_type,
                'status' => $document->status,
                'issue_date' => optional($document->issue_date)->toDateString(),
                'expiry_date' => optional($document->expiry_date)->toDateString(),
                'file_reference' => $document->file_reference,
                'original_file_name' => $document->original_file_name,
                'mime_type' => $document->mime_type,
                'file_size_bytes' => $document->file_size_bytes,
                'readable_file_size' => $document->readable_file_size,
                'file_url' => $document->file_url,
                'has_file' => filled($document->file_path),
                'notes' => $document->notes,
                'created_at' => optional($document->created_at)->toDateTimeString(),
                'updated_at' => optional($document->updated_at)->toDateTimeString(),
                'customer' => $document->customer ? [
                    'id' => $document->customer->id,
                    'name' => $document->customer->name,
                    'customer_code' => $document->customer->customer_code,
                    'phone' => $document->customer->phone,
                    'email' => $document->customer->email,
                ] : null,
                'loan' => $document->loan ? [
                    'id' => $document->loan->id,
                    'loan_code' => $document->loan->loan_code,
                    'status' => $document->loan->status,
                ] : null,
            ],
        ]);
    }

    public function edit(Document $document): Response
    {
        return Inertia::render('documents/edit', [
            'document' => [
                'id' => $document->id,
                'document_code' => $document->document_code,
                'title' => $document->title,
                'document_type' => $document->document_type,
                'entity_type' => $document->entity_type,
                'customer_id' => $document->customer_id,
                'loan_id' => $document->loan_id,
                'issue_date' => optional($document->issue_date)->toDateString(),
                'expiry_date' => optional($document->expiry_date)->toDateString(),
                'file_reference' => $document->file_reference,
                'original_file_name' => $document->original_file_name,
                'mime_type' => $document->mime_type,
                'readable_file_size' => $document->readable_file_size,
                'file_url' => $document->file_url,
                'has_file' => filled($document->file_path),
                'status' => $document->status,
                'notes' => $document->notes,
            ],
            'customers' => Customer::query()->select('id', 'name', 'customer_code')->orderBy('name')->get(),
            'loans' => Loan::query()->with('customer:id,name')->select('id', 'loan_code', 'customer_id')->latest()->get()->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'customer_id' => $loan->customer_id,
                'customer_name' => $loan->customer?->name,
            ]),
        ]);
    }

    public function update(UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        $data = $request->safe()->except(['upload_file', 'remove_file']);

        if ($request->boolean('remove_file')) {
            $this->deleteStoredFile($document);
            $data['file_path'] = null;
            $data['original_file_name'] = null;
            $data['mime_type'] = null;
            $data['file_size_bytes'] = null;
        }

        if ($request->hasFile('upload_file')) {
            $this->deleteStoredFile($document);
            $data = $this->attachStoredFileData($request, $data);
        }

        $document->update([
            ...$data,
            'updated_by' => $request->user()?->id,
        ]);

        AuditLogService::log('document', 'updated', 'Document updated.', $document, $request->user()?->id, $document->document_code, [
            'entity_type' => $document->entity_type,
            'status' => $document->status,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Document updated successfully.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        AuditLogService::log('document', 'deleted', 'Document deleted.', $document, request()->user()?->id, $document->document_code, [
            'entity_type' => $document->entity_type,
        ]);

        $this->deleteStoredFile($document);
        $document->delete();

        return redirect()->route('documents.index')->with('success', 'Document deleted successfully.');
    }

    private function attachStoredFileData(Request $request, array $data): array
    {
        if (! $request->hasFile('upload_file')) {
            return $data;
        }

        $file = $request->file('upload_file');
        $folder = 'documents/' . now()->format('Y/m');
        $storedName = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $storedName, 'public');

        $data['file_path'] = $path;
        $data['original_file_name'] = $file->getClientOriginalName();
        $data['mime_type'] = $file->getClientMimeType();
        $data['file_size_bytes'] = $file->getSize();

        if (blank($data['file_reference'] ?? null)) {
            $data['file_reference'] = $file->getClientOriginalName();
        }

        return $data;
    }

    private function deleteStoredFile(Document $document): void
    {
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
    }

    private function generateDocumentCode(): string
    {
        $prefix = 'DOC-';
        $codes = Document::query()->pluck('document_code');

        $max = 0;
        foreach ($codes as $code) {
            if (preg_match('/DOC-(\d+)/', (string) $code, $matches)) {
                $max = max($max, (int) $matches[1]);
            }
        }

        return $prefix . str_pad((string) ($max + 1), 5, '0', STR_PAD_LEFT);
    }
}
