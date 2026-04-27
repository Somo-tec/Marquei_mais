<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Appointment;
use App\Services\OrgContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReviewsController extends Controller
{
    public function index(Request $request)
    {
        $q = Review::where('organization_id', OrgContext::org()->id)->with(['client','professional','appointment']);
        if ($request->professional_id) $q->where('professional_id', $request->professional_id);
        if ($request->rating) $q->where('rating', $request->rating);
        return response()->json($q->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'appointment_id' => 'required|uuid',
            'rating'         => 'required|integer|min:1|max:5',
            'comment'        => 'nullable|string|max:500',
        ]);

        $apt = Appointment::where('organization_id', OrgContext::org()->id)
            ->where('status', 'completed')
            ->findOrFail($data['appointment_id']);

        if ($apt->review) return response()->json(['error' => 'Avaliação já existe'], 422);

        $review = Review::create([
            'id'              => Str::uuid(),
            'organization_id' => OrgContext::org()->id,
            'appointment_id'  => $apt->id,
            'client_id'       => $apt->client_id,
            'professional_id' => $apt->professional_id,
            'rating'          => $data['rating'],
            'comment'         => $data['comment'] ?? null,
        ]);

        return response()->json($review->load(['client','professional']), 201);
    }

    public function stats()
    {
        $org = OrgContext::org();
        $reviews = Review::where('organization_id', $org->id);

        return response()->json([
            'average'     => round($reviews->avg('rating'), 1),
            'total'       => $reviews->count(),
            'distribution'=> $reviews->selectRaw('rating, count(*) as count')->groupBy('rating')->pluck('count','rating'),
        ]);
    }
}
