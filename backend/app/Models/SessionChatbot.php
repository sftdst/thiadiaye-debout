<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SessionChatbot extends Model
{
    protected $table = 'sessions_chatbot';

    protected $fillable = ['telephone', 'membre_id'];

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(MessageEchange::class);
    }
}
