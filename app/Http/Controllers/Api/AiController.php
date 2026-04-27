<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Services\OrgContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    private function groq(string $prompt): string
    {
        $response = Http::withToken(config('marquei.groq.api_key'))
            ->post(config('marquei.groq.url'), [
                'model'    => config('marquei.groq.model'),
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'max_tokens' => 800,
            ]);

        return $response->json('choices.0.message.content', '');
    }

    public function slotSuggestions(Request $request)
    {
        $org = OrgContext::org();
        $request->validate(['client_id' => 'required|uuid']);

        $client = Client::where('organization_id', $org->id)->with(['appointments.service'])->findOrFail($request->client_id);

        $history = $client->appointments->where('status', 'completed')->sortByDesc('starts_at')->take(10);
        $historyText = $history->map(fn ($a) => "{$a->starts_at->format('D H:i')} - {$a->service->name}")->join("\n");

        $prompt = "Você é um assistente de agendamento. Com base no histórico de agendamentos do cliente {$client->name}:\n{$historyText}\n\nSugira 3 melhores horários e dias da semana para o próximo agendamento. Seja conciso.";

        return response()->json(['suggestion' => $this->groq($prompt)]);
    }

    public function upsellSuggestion(Request $request)
    {
        $org = OrgContext::org();
        $request->validate(['appointment_id' => 'required|uuid']);

        $apt = Appointment::where('organization_id', $org->id)->with(['client','service'])->findOrFail($request->appointment_id);

        $otherServices = \App\Models\Service::where('organization_id', $org->id)
            ->where('id', '!=', $apt->service_id)->where('active', true)->pluck('name')->join(', ');

        $prompt = "Cliente '{$apt->client->name}' agendou '{$apt->service->name}'. Outros serviços disponíveis: {$otherServices}. Sugira 1 serviço complementar de forma natural e breve para o atendente oferecer.";

        return response()->json(['suggestion' => $this->groq($prompt)]);
    }

    public function retentionInsight()
    {
        $org = OrgContext::org();

        $atRisk = Client::where('organization_id', $org->id)
            ->where('status', 'active')
            ->whereNotNull('last_visit_at')
            ->where('last_visit_at', '<', now()->subDays(45))
            ->orderBy('last_visit_at')
            ->take(10)
            ->get(['id','name','last_visit_at','total_spent']);

        $prompt = "Clientes em risco de churn (última visita há mais de 45 dias): " . $atRisk->map(fn ($c) => "{$c->name} ({$c->last_visit_at->diffForHumans()})")->join(', ') . ". Sugira 2 ações de retenção práticas para o salão.";

        return response()->json([
            'at_risk_clients' => $atRisk,
            'suggestion'      => $atRisk->isEmpty() ? 'Nenhum cliente em risco.' : $this->groq($prompt),
        ]);
    }
}
