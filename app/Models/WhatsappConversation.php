<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WhatsappConversation extends Model
{
    use HasUuids;
    protected $fillable = ['organization_id','client_id','wa_phone','wa_name','unread_count','last_message_at'];
    protected $casts = ['last_message_at' => 'datetime'];
    public function organization() { return $this->belongsTo(Organization::class); }
    public function client() { return $this->belongsTo(Client::class); }
    public function messages() { return $this->hasMany(WhatsappMessage::class, 'conversation_id')->orderBy('created_at'); }
}
