<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Appointment extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','client_id','service_id','professional_id','starts_at','duration_minutes','price','status','notes','cancelled_reason','source'];
    protected $casts = ['starts_at' => 'datetime', 'price' => 'decimal:2'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function client() { return $this->belongsTo(Client::class); }
    public function service() { return $this->belongsTo(Service::class); }
    public function professional() { return $this->belongsTo(Professional::class); }
    public function review() { return $this->hasOne(Review::class); }

    public function endsAt(): \Carbon\Carbon
    {
        return $this->starts_at->addMinutes($this->duration_minutes);
    }
}
