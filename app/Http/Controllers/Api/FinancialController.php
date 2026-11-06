<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cashier;
use App\Models\CashEntry;
use App\Models\Appointment;
use App\Services\OrgContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FinancialController extends Controller
{
    // ─── Cashier ─────────────────────────────────────────────────────────
    public function openCashier(Request $request)
    {
        $org = OrgContext::org();
        $token = OrgContext::token();

        if (Cashier::where('organization_id', $org->id)->whereNull('closed_at')->exists()) {
            return response()->json(['error' => 'Já existe um caixa aberto'], 422);
        }

        $cashier = Cashier::create([
            'id'              => Str::uuid(),
            'organization_id' => $org->id,
            'opened_by'       => $token['sub'] === 'master' ? null : $token['sub'],
            'opening_balance' => $request->input('opening_balance', 0),
            'opened_at'       => now(),
        ]);

        return response()->json($cashier, 201);
    }

    public function closeCashier(Request $request, string $id)
    {
        $cashier = Cashier::where('organization_id', OrgContext::org()->id)->whereNull('closed_at')->findOrFail($id);
        $token = OrgContext::token();

        $cashier->update([
            'closed_by'       => $token['sub'] === 'master' ? null : $token['sub'],
            'closing_balance' => $request->input('closing_balance'),
            'closed_at'       => now(),
            'notes'           => $request->notes,
        ]);

        return response()->json($cashier->fresh());
    }

    public function currentCashier()
    {
        $cashier = Cashier::where('organization_id', OrgContext::org()->id)
            ->whereNull('closed_at')
            ->with('entries')
            ->first();

        return response()->json($cashier);
    }

    // ─── Entries ──────────────────────────────────────────────────────────
    public function storeEntry(Request $request)
    {
        $cashier = Cashier::where('organization_id', OrgContext::org()->id)->whereNull('closed_at')->firstOrFail();

        $data = $request->validate([
            'type'             => 'required|in:income,expense,commission',
            'payment_method'   => 'required|in:cash,card,pix,transfer,other',
            'amount'           => 'required|numeric|min:0.01',
            'description'      => 'required|string',
            'appointment_id'   => ['nullable', 'uuid', Rule::exists('appointments', 'id')->where('organization_id', OrgContext::org()->id)],
            'professional_id'  => ['nullable', 'uuid', Rule::exists('professionals', 'id')->where('organization_id', OrgContext::org()->id)],
        ]);

        $entry = CashEntry::create([
            'id'              => Str::uuid(),
            'cashier_id'      => $cashier->id,
            'organization_id' => OrgContext::org()->id,
            ...$data,
        ]);

        return response()->json($entry, 201);
    }

    // ─── Reports ──────────────────────────────────────────────────────────
    public function report(Request $request)
    {
        $org = OrgContext::org();
        $from = Carbon::parse($request->from ?? now()->startOfMonth());
        $to   = Carbon::parse($request->to ?? now()->endOfMonth());

        $appointments = Appointment::where('organization_id', $org->id)
            ->whereBetween('starts_at', [$from, $to])
            ->where('status', 'completed')
            ->with('professional')
            ->get();

        $revenue = $appointments->sum('price');
        $count   = $appointments->count();

        $byProfessional = $appointments->groupBy('professional_id')->map(function ($apts) {
            $prof = $apts->first()->professional;
            $total = $apts->sum('price');
            $commission = $apts->sum(fn ($a) => $a->price * ($a->professional->commission_percent / 100));
            return [
                'professional'    => $prof->only(['id','name','photo_url']),
                'appointments'    => $apts->count(),
                'revenue'         => $total,
                'commission'      => round($commission, 2),
                'net'             => round($total - $commission, 2),
            ];
        })->values();

        $byService = $appointments->groupBy('service_id')->map(function ($apts) {
            return [
                'service'      => $apts->first()->service_id,
                'appointments' => $apts->count(),
                'revenue'      => $apts->sum('price'),
            ];
        })->values();

        $byDay = $appointments->groupBy(fn ($a) => $a->starts_at->toDateString())
            ->map(fn ($apts) => ['date' => $apts->first()->starts_at->toDateString(), 'revenue' => $apts->sum('price'), 'count' => $apts->count()])
            ->values();

        return response()->json(compact('revenue','count','byProfessional','byService','byDay'));
    }

    public function commissions(Request $request)
    {
        $org = OrgContext::org();
        $from = Carbon::parse($request->from ?? now()->startOfMonth());
        $to   = Carbon::parse($request->to ?? now()->endOfMonth());

        $appointments = Appointment::where('organization_id', $org->id)
            ->whereBetween('starts_at', [$from, $to])
            ->where('status', 'completed')
            ->with('professional','service')
            ->get();

        $result = $appointments->groupBy('professional_id')->map(function ($apts) {
            $prof = $apts->first()->professional;
            return [
                'professional' => $prof->only(['id','name','commission_percent']),
                'appointments' => $apts->map(fn ($a) => [
                    'id'         => $a->id,
                    'starts_at'  => $a->starts_at,
                    'service'    => $a->service->name,
                    'price'      => $a->price,
                    'commission' => round($a->price * ($prof->commission_percent / 100), 2),
                ]),
                'total_revenue'    => $apts->sum('price'),
                'total_commission' => round($apts->sum(fn ($a) => $a->price * ($prof->commission_percent / 100)), 2),
            ];
        })->values();

        return response()->json($result);
    }
}
