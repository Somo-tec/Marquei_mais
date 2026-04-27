<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Notification extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','appointment_id','type','title','message','read'];
    protected $casts = ['read' => 'boolean'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function appointment() { return $this->belongsTo(Appointment::class); }
}
