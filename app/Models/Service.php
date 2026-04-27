<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Service extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','name','description','price','duration_minutes','color','active'];
    protected $casts = ['price' => 'decimal:2', 'active' => 'boolean'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function professionals() { return $this->belongsToMany(Professional::class, 'professional_services'); }
}
