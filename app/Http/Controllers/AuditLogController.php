<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $module = (string) $request->string('module', 'all');
        $action = (string) $request->string('action', 'all');

        $logs = ActivityLog::query()
            ->with('actor:id,name,email')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('description', 'like', "%{$search}%")
                        ->orWhere('subject_code', 'like', "%{$search}%")
                        ->orWhereHas('actor', fn ($actorQuery) => $actorQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when($module !== 'all', fn ($query) => $query->where('module', $module))
            ->when($action !== 'all', fn ($query) => $query->where('action', $action))
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ActivityLog $log) => [
                'id' => $log->id,
                'module' => $log->module,
                'action' => $log->action,
                'description' => $log->description,
                'subject_code' => $log->subject_code,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at?->format('Y-m-d h:i A'),
                'actor' => $log->actor ? [
                    'name' => $log->actor->name,
                    'email' => $log->actor->email,
                ] : null,
            ]);

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'module' => $module,
                'action' => $action,
            ],
            'stats' => [
                'total' => ActivityLog::count(),
                'today' => ActivityLog::whereDate('created_at', today())->count(),
                'users' => ActivityLog::whereNotNull('actor_id')->distinct('actor_id')->count('actor_id'),
            ],
            'modules' => ActivityLog::query()->select('module')->distinct()->orderBy('module')->pluck('module')->values(),
            'actions' => ActivityLog::query()->select('action')->distinct()->orderBy('action')->pluck('action')->values(),
        ]);
    }
}
