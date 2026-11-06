<?php
namespace App\Services;
use App\Models\Appointment;
use App\Models\Professional;
use Carbon\Carbon;

class AppointmentService
{
    /** Duracao maxima de um agendamento, em minutos. Limita a janela de busca de conflitos. */
    public const MAX_DURATION_MINUTES = 1440;

    /** Status que nao ocupam horario na agenda. */
    public const NON_BLOCKING_STATUSES = ['cancelled'];

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

        $booked = $this->blockingAppointments($professional->id, $start, $end);

        $slots = [];
        $cursor = $start->copy();

        while ($cursor->copy()->addMinutes($durationMinutes)->lte($end)) {
            $slotEnd = $cursor->copy()->addMinutes($durationMinutes);

            // Skip lunch break
            if ($lunchStart && $lunchEnd) {
                if ($this->overlaps($cursor, $slotEnd, $lunchStart, $lunchEnd)) {
                    $cursor = $lunchEnd->copy();
                    continue;
                }
            }

            $hasConflict = $booked->contains(
                fn (Appointment $a) => $this->overlaps($cursor, $slotEnd, $a->starts_at, $a->endsAt())
            );

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

        return $this->blockingAppointments($professionalId, $startsAt, $endsAt, $excludeId)
            ->contains(fn (Appointment $a) => $this->overlaps($startsAt, $endsAt, $a->starts_at, $a->endsAt()));
    }

    /**
     * Agendamentos do profissional que podem colidir com o intervalo [$from, $to).
     * A query e portavel entre bancos: o calculo do fim fica em PHP.
     */
    private function blockingAppointments(string $professionalId, Carbon $from, Carbon $to, ?string $excludeId = null)
    {
        return Appointment::where('professional_id', $professionalId)
            ->whereNotIn('status', self::NON_BLOCKING_STATUSES)
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->where('starts_at', '<', $to)
            ->where('starts_at', '>', $from->copy()->subMinutes(self::MAX_DURATION_MINUTES))
            ->get();
    }

    private function overlaps(Carbon $startA, Carbon $endA, Carbon $startB, Carbon $endB): bool
    {
        return $startA->lt($endB) && $endA->gt($startB);
    }
}
