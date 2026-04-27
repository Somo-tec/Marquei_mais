<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Organization extends Model
{
    use HasUuids;
    protected $fillable = ['name','slug','phone','email','address','logo_url','plan','master_password','settings','active','asaas_customer_id','whatsapp_phone_number_id'];
    protected $casts = ['settings' => 'array', 'active' => 'boolean'];
    protected $hidden = ['master_password'];

    public function staffUsers() { return $this->hasMany(StaffUser::class); }
    public function clients() { return $this->hasMany(Client::class); }
    public function services() { return $this->hasMany(Service::class); }
    public function professionals() { return $this->hasMany(Professional::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function notifications() { return $this->hasMany(Notification::class); }
    public function cashiers() { return $this->hasMany(Cashier::class); }
    public function reviews() { return $this->hasMany(Review::class); }
}
