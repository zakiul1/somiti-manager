<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerPortalAccountController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\GuarantorController;
use App\Http\Controllers\InstallmentController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PrintController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StaffWorkflowController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware('guest')->group(function () {
    Route::get('/customers/login', [AuthenticatedSessionController::class, 'createCustomer'])->name('customer.login');
    Route::post('/customers/login', [AuthenticatedSessionController::class, 'storeCustomer'])->name('customer.login.store');
});

Route::get('/', function () {
    if (auth()->check() && auth()->user()->hasRole('customer')) {
        return redirect()->route('portal.dashboard');
    }

    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'admin.access'])->group(function () {
    Route::get('/dashboard', [CustomerController::class, 'dashboard'])->name('dashboard');
    Route::get('/search', [SearchController::class, 'index'])->name('search.index');

    Route::get('/customers-export', [CustomerController::class, 'export'])->name('customers.export');
    Route::patch('/customers/{customer}/archive', [CustomerController::class, 'archive'])->name('customers.archive');
    Route::resource('customers', CustomerController::class);
    Route::get('/customers/{customer}/portal-account/create', [CustomerPortalAccountController::class, 'create'])->name('customer-portal-accounts.create');
    Route::post('/customers/{customer}/portal-account', [CustomerPortalAccountController::class, 'store'])->name('customer-portal-accounts.store');
    Route::get('/customers/{customer}/portal-account/edit', [CustomerPortalAccountController::class, 'edit'])->name('customer-portal-accounts.edit');
    Route::put('/customers/{customer}/portal-account', [CustomerPortalAccountController::class, 'update'])->name('customer-portal-accounts.update');
    Route::patch('/customers/{customer}/portal-account/toggle', [CustomerPortalAccountController::class, 'toggle'])->name('customer-portal-accounts.toggle');

    Route::get('/guarantors-export', [GuarantorController::class, 'export'])->name('guarantors.export');
    Route::patch('/guarantors/{guarantor}/archive', [GuarantorController::class, 'archive'])->name('guarantors.archive');
    Route::resource('guarantors', GuarantorController::class);

    Route::get('/loans-export', [LoanController::class, 'export'])->name('loans.export');
    Route::post('/loans/{loan}/approve', [LoanController::class, 'approve'])->name('loans.approve');
    Route::get('/loans/{loan}/disburse', [LoanController::class, 'createDisbursement'])->name('loans.disburse.create');
    Route::post('/loans/{loan}/disburse', [LoanController::class, 'storeDisbursement'])->name('loans.disburse.store');
    Route::resource('loans', LoanController::class);

    Route::get('/installments-export', [InstallmentController::class, 'export'])->name('installments.export');
    Route::resource('installments', InstallmentController::class)->only(['index', 'create', 'store']);
    Route::get('/loans/{loan}/installments', [InstallmentController::class, 'show'])->name('installments.show');

    Route::get('/payments-export', [PaymentController::class, 'export'])->name('payments.export');
    Route::resource('payments', PaymentController::class)->only(['index', 'create', 'store', 'show']);
    Route::get('/payments/{payment}/receipt', [PrintController::class, 'paymentReceipt'])->name('print.payment-receipt');
    Route::get('/payments/{payment}/receipt/pdf', [PrintController::class, 'paymentReceiptPdf'])->name('print.payment-receipt.pdf');
    Route::get('/loans/{loan}/statement', [PrintController::class, 'loanStatement'])->name('print.loan-statement');
    Route::get('/loans/{loan}/statement/pdf', [PrintController::class, 'loanStatementPdf'])->name('print.loan-statement.pdf');
    Route::get('/loans/{loan}/installments/print', [PrintController::class, 'installmentSchedule'])->name('print.installment-schedule');
    Route::get('/loans/{loan}/installments/pdf', [PrintController::class, 'installmentSchedulePdf'])->name('print.installment-schedule.pdf');

    Route::get('/documents-export', [DocumentController::class, 'export'])->name('documents.export');
    Route::resource('documents', DocumentController::class);

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports-export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('/staff-workflow', [StaffWorkflowController::class, 'index'])->name('staff-workflow.index');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    Route::get('/notifications', function () {
        return Inertia::render('notifications/index');
    })->name('notifications');

    Route::get('/admin-users', [AdminUserController::class, 'index'])->name('admin-users.index');
    Route::get('/admin-users/create', [AdminUserController::class, 'create'])->name('admin-users.create');
    Route::post('/admin-users', [AdminUserController::class, 'store'])->name('admin-users.store');
    Route::get('/admin-users/{user}/edit', [AdminUserController::class, 'edit'])->name('admin-users.edit');
    Route::put('/admin-users/{user}', [AdminUserController::class, 'update'])->name('admin-users.update');
    Route::patch('/admin-users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])->name('admin-users.toggle-status');

    Route::get('/settings', [SettingsController::class, 'edit'])->name('settings.index');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'customer.portal'])->group(function () {
    Route::get('/portal/dashboard', [CustomerPortalController::class, 'dashboard'])->name('portal.dashboard');
    Route::get('/portal/loans', [CustomerPortalController::class, 'loans'])->name('portal.loans');
    Route::get('/portal/installments', [CustomerPortalController::class, 'installments'])->name('portal.installments');
    Route::get('/portal/payments', [CustomerPortalController::class, 'payments'])->name('portal.payments');
});

require __DIR__.'/auth.php';
