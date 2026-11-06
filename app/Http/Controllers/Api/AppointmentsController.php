<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Notification;
use App\Services\AppointmentService;
use App\Services\OrgContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AppointmentsController extends Controller
{
    public function __construct(private AppointmentService $svc) {}

    public function index(Request $request)
    {
        $org = OrgContext::org();
        $query = Appointment::where('organization_id', $org->id)
            ->with(['client','service','professional']);

        if ($request->date) $query->whereDate('starts_at', $request->date);
        if ($request->from) $query->where('starts_at', '>=', $request->from);
        if ($request->to)   $query->where('starts_at', '<=', $request->to);
        if ($request->status) $query->where('status', $request->status);
        if ($request->professional_id) $query->where('professional_id', $request->professional_id);

        return response()->json($query->orderBy('starts_at')->get());
    }

    public function store(Request $request)
    {
        $org = OrgContext::org();
        $data = $request->validate([
            'client_id'       => ['required', 'uuid', $this->belongsToOrg('clients')],
            'service_id'      => ['required', 'uuid', $this->belongsToOrg('services')],
            'professional_id' => ['required', 'uuid', $this->belongsToOrg('professionals')],
            'starts_at'       => 'required|date',
            'duration_minutes'=> 'required|integer|min:5|max:' . AppointmentService::MAX_DURATION_MINUTES,
            'price'           => 'required|numeric|min:0',
            'notes'           => 'nullable|string',
            'source'          => 'nullable|string',
        ]);

        $startsAt = $this->parseDate($data['starts_at']);

        if ($this->svc->hasConflict($data['professional_id'], $startsAt, $data['duration_minutes'])) {
            return response()->json(['error' => 'Conflito de horário para este profissional'], 422);
        }

        $appointment = Appointment::create([
            'id'              => Str::uuid(),
            'organization_id' => $org->id,
            ...$data,
            'starts_at'       => $startsAt,
            'status'          => 'pending',
        ]);

        // Notification
        Notification::create([
            'id'              => Str::uuid(),
            'organization_id' => $org->id,
            'appointment_id'  => $appointment->id,
            'type'            => 'new_appointment',
            'title'           => 'Novo agendamento',
            'message'         => "Agendamento criado para " . $startsAt->format('d/m H:i'),
        ]);

        return response()->json($appointment->load(['client','service','professional']), 201);
    }

    public function show(string $id)
    {
        $apt = Appointment::where('organization_id', OrgContext::org()->id)
            ->with(['client','service','professional','review'])
            ->findOrFail($id);
        return response()->json($apt);
    }

    public function update(Request $request, string $id)
    {
        $apt = Appointment::where('organization_id', OrgContext::org()->id)->findOrFail($id);
        $data = $request->validate([
            'starts_at'        => 'sometimes|date',
            'duration_minutes' => 'sometimes|integer|min:5|max:' . AppointmentService::MAX_DURATION_MINUTES,
            'price'            => 'sometimes|numeric|min:0',
            'status'           => 'sometimes|in:pending,confirmed,cancelled,completed,no_show',
            'notes'            => 'nullable|string',
            'cancelled_reason' => 'nullable|string',
            'professional_id'  => ['sometimes', 'uuid', $this->belongsToOrg('professionals')],
        ]);

        if (isset($data['starts_at'])) {
            $data['starts_at'] = $this->parseDate($data['starts_at']);
        }

        $oldStatus = $apt->status;
        $newStatus = $data['status'] ?? $oldStatus;
        $startsAt  = $data['starts_at'] ?? $apt->starts_at;
        $duration  = $data['duration_minutes'] ?? $apt->duration_minutes;
        $profId    = $data['professional_id'] ?? $apt->professional_id;

        // Revalida conflito sempre que o horario ocupado muda: novo inicio, nova duracao,
        // outro profissional, ou um agendamento cancelado voltando a ocupar a agenda.
        $slotChanged = isset($data['starts_at'])
            || (isset($data['duration_minutes']) && (int) $data['duration_minutes'] !== (int) $apt->duration_minutes)
            || (isset($data['professional_id']) && $data['professional_id'] !== $apt->professional_id)
            || (in_array($oldStatus, AppointmentService::NON_BLOCKING_STATUSES)
                && !in_array($newStatus, AppointmentService::NON_BLOCKING_STATUSES));

        $willBlock = !in_array($newStatus, AppointmentService::NON_BLOCKING_STATUSES);

        if ($slotChanged && $willBlock && $this->svc->hasConflict($profId, $startsAt, $duration, $apt->id)) {
            return response()->json(['error' => 'Conflito de horário para este profissional'], 422);
        }

        $oldPrice = $apt->price;

        DB::transaction(function () use ($apt, $data, $oldStatus, $newStatus, $oldPrice) {
            $apt->update($data);

            // Estatisticas do cliente acompanham a transicao de status, sem contar em dobro.
            $client = $apt->client;
            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                $client->increment('total_appointments');
                $client->increment('total_spent', $apt->price);
                $client->update(['last_visit_at' => now()]);
            } elseif ($oldStatus === 'completed' && $newStatus !== 'completed') {
                $client->update([
                    'total_appointments' => max(0, $client->total_appointments - 1),
                    'total_spent'        => max(0, $client->total_spent - $oldPrice),
                ]);
            }
        });

        return response()->json($apt->fresh(['client','service','professional']));
    }

    public function destroy(string $id)
    {
        $apt = Appointment::where('organization_id', OrgContext::org()->id)->findOrFail($id);
        $apt->delete();
        return response()->json(['ok' => true]);
    }

    public function availableSlots(Request $request)
    {
        $request->validate([
            'professional_id'  => 'required|uuid',
            'date'             => 'required|date',
            'duration_minutes' => 'required|integer|min:5',
        ]);

        $professional = \App\Models\Professional::where('organization_id', OrgContext::org()->id)
            ->findOrFail($request->professional_id);

        $slots = $this->svc->getAvailableSlots($professional, $request->date, $request->duration_minutes);
        return response()->json(['slots' => $slots]);
    }

    /** Regra de validacao: o registro existe e pertence a organizacao atual. */
    private function belongsToOrg(string $table)
    {
        return Rule::exists($table, 'id')->where('organization_id', OrgContext::org()->id);
    }

    /** Normaliza a data recebida (ISO com qualquer offset) para o fuso da aplicacao. */
    private function parseDate(string $value): Carbon
    {
        return Carbon::parse($value)->setTimezone(config('app.timezone'));
    }
}
