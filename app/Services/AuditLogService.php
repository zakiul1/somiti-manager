<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogService
{
    public static function log(
        string $module,
        string $action,
        string $description,
        ?Model $auditable = null,
        ?int $actorId = null,
        ?string $subjectCode = null,
        array $metadata = [],
    ): ActivityLog {
        return ActivityLog::create([
            'module' => $module,
            'action' => $action,
            'description' => $description,
            'subject_code' => $subjectCode,
            'metadata' => $metadata,
            'actor_id' => $actorId,
            'auditable_type' => $auditable?->getMorphClass(),
            'auditable_id' => $auditable?->getKey(),
        ]);
    }

    public static function recentFor(Model $auditable, int $limit = 8)
    {
        return ActivityLog::query()
            ->with('actor:id,name,email')
            ->where('auditable_type', $auditable->getMorphClass())
            ->where('auditable_id', $auditable->getKey())
            ->latest('id')
            ->limit($limit)
            ->get();
    }
}
