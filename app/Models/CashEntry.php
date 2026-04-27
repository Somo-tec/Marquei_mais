<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CashEntry extends Model
{
    use HasUuids;
    protected $fillable = ['cashier_id','organization_id','appointment_id','professional_id','type','payment_method','amount','description'];
    protected $casts = ['amount' => 'decimal:2'];
    public function cashier() { return $this->belongsTo(Cashier::class); }
    public function appointment() { return $this->belongsTo(Appointment::class); }
    public function professional() { return $this->belongsTo(Professional::class); }
}
