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
use Illuminate\Support\Str;

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
            'client_id'       => 'required|uuid',
            'service_id'      => 'required|uuid',
            'professional_id' => 'required|uuid',
            'starts_at'       => 'required|date',
            'duration_minutes'=> 'required|integer|min:5',
            'price'           => 'required|numeric|min:0',
            'notes'           => 'nullable|string',
            'source'          => 'nullable|string',
        ]);

        $startsAt = Carbon::parse($data['starts_at']);

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
            'duration_minutes' => 'sometimes|integer|min:5',
            'price'            => 'sometimes|numeric|min:0',
            'status'           => 'sometimes|in:pending,confirmed,cancelled,completed,no_show',
            'notes'            => 'nullable|string',
            'cancelled_reason' => 'nullable|string',
            'professional_id'  => 'sometimes|uuid',
        ]);

        if (isset($data['starts_at'])) {
            $startsAt = Carbon::parse($data['starts_at']);
            $duration = $data['duration_minutes'] ?? $apt->duration_minutes;
            $profId   = $data['professional_id'] ?? $apt->professional_id;

            if ($this->svc->hasConflict($profId, $startsAt, $duration, $apt->id)) {
                return response()->json(['error' => 'Conflito de horário'], 422);
            }
            $data['starts_at'] = $startsAt;
        }

        $apt->update($data);

        // Update client stats on completion
        if (($data['status'] ?? null) === 'completed') {
            $client = $apt->client;
            $client->increment('total_appointments');
            $client->increment('total_spent', $apt->price);
            $client->update(['last_visit_at' => now()]);
        }

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
}
