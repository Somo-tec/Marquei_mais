<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WhatsappMessage extends Model
{
    use HasUuids;
    protected $fillable = ['conversation_id','wa_message_id','direction','type','content','payload','status'];
    protected $casts = ['payload' => 'array'];
    public function conversation() { return $this->belongsTo(WhatsappConversation::class); }
}
