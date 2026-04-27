<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Client extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','name','email','phone','photo_url','status','notes','total_appointments','total_spent','last_visit_at'];
    protected $casts = ['total_spent' => 'decimal:2', 'last_visit_at' => 'datetime'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function reviews() { return $this->hasMany(Review::class); }
}
