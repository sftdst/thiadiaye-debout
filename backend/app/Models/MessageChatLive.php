<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageChatLive extends Model
{
    protected $table = 'messages_chat_live';

    protected $fillable = ['live_session_id', 'membre_id', 'contenu'];

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }
}
