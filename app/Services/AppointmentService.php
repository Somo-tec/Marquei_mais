<?php
namespace App\Services;
use App\Models\Appointment;
use App\Models\Professional;
use Carbon\Carbon;

class AppointmentService
{
    public function getAvailableSlots(Professional $professional, string $date, int $durationMinutes): array
    {
        $workingHours = $professional->working_hours ?? [];
        $dayKey = Carbon::parse($date)->locale('en')->dayName; // Monday, Tuesday...
        $daySchedule = $workingHours[$dayKey] ?? null;

        if (!$daySchedule || !($daySchedule['isWorking'] ?? false)) return [];

        $start = Carbon::parse("{$date} " . ($daySchedule['start'] ?? '08:00'));
        $end = Carbon::parse("{$date} " . ($daySchedule['end'] ?? '18:00'));

        $lunchStart = isset($daySchedule['lunchStart'])
            ? Carbon::parse("{$date} " . $daySchedule['lunchStart'])
            : null;
        $lunchEnd = isset($daySchedule['lunchEnd'])
            ? Carbon::parse("{$date} " . $daySchedule['lunchEnd'])
            : null;

        $booked = Appointment::where('professional_id', $professional->id)
            ->whereDate('starts_at', $date)
            ->whereNotIn('status', ['cancelled'])
            ->get()
            ->map(fn ($a) => [$a->starts_at, $a->endsAt()]);

        $slots = [];
        $cursor = $start->copy();

        while ($cursor->copy()->addMinutes($durationMinutes)->lte($end)) {
            $slotEnd = $cursor->copy()->addMinutes($durationMinutes);

            // Skip lunch break
            if ($lunchStart && $lunchEnd) {
                if ($cursor->lt($lunchEnd) && $slotEnd->gt($lunchStart)) {
                    $cursor = $lunchEnd->copy();
                    continue;
                }
            }

            // Check conflicts
            $hasConflict = $booked->contains(function ($b) use ($cursor, $slotEnd) {
                return $cursor->lt($b[1]) && $slotEnd->gt($b[0]);
            });

            if (!$hasConflict) {
                $slots[] = $cursor->format('H:i');
            }

            $cursor->addMinutes(15);
        }

        return $slots;
    }

    public function hasConflict(string $professionalId, Carbon $startsAt, int $duration, ?string $excludeId = null): bool
    {
        $endsAt = $startsAt->copy()->addMinutes($duration);

        return Appointment::where('professional_id', $professionalId)
            ->whereNotIn('status', ['cancelled'])
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->where('starts_at', '<', $endsAt)
            ->whereRaw("datetime(starts_at, '+' || duration_minutes || ' minutes') > ?", [$startsAt])
            ->exists();
    }
}
