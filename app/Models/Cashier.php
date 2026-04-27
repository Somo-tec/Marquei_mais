<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Cashier extends Model
{
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['organization_id','opened_by','closed_by','opening_balance','closing_balance','opened_at','closed_at','notes'];
    protected $casts = ['opened_at' => 'datetime', 'closed_at' => 'datetime', 'opening_balance' => 'decimal:2', 'closing_balance' => 'decimal:2'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function entries() { return $this->hasMany(CashEntry::class); }
    public function isOpen(): bool { return is_null($this->closed_at); }
}
