<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Professional extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','name','email','phone','photo_url','roles','working_hours','commission_percent','active'];
    protected $casts = ['roles' => 'array', 'working_hours' => 'array', 'active' => 'boolean', 'commission_percent' => 'decimal:2'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function services() { return $this->belongsToMany(Service::class, 'professional_services'); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function reviews() { return $this->hasMany(Review::class); }
}
