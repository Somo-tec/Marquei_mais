<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StaffUser extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','name','email','password_hash','role','photo_url','active'];
    protected $hidden = ['password_hash'];
    protected $casts = ['active' => 'boolean'];
    public function organization() { return $this->belongsTo(Organization::class); }
}
