<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Blog extends Model
{
    /** @use HasFactory<\Database\Factories\BlogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'authorName',
        'title',
        'content',
      
    ];
    protected $dates = [
        'created_at',
        'updated_at',
    ];


    /**
     * Get the user that owns the blog post.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
