<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageEchange extends Model
{
    protected $table = 'messages_echanges';

    protected $fillable = ['session_chatbot_id', 'direction', 'contenu'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(SessionChatbot::class, 'session_chatbot_id');
    }
}
