<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Review extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','appointment_id','client_id','professional_id','rating','comment','public'];
    protected $casts = ['public' => 'boolean'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function appointment() { return $this->belongsTo(Appointment::class); }
    public function client() { return $this->belongsTo(Client::class); }
    public function professional() { return $this->belongsTo(Professional::class); }
}
