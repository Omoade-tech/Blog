<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class BlogController extends Controller
{
    public function index()
    {
        try {
            $blogs = Blog::with('user')->latest()->get();
            return response()->json([
                'status' => 'success',
                'data' => $blogs
            ], 200);
          } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error fetching blog posts',
                    'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function getUserBlogs($userId = null)
    // {
    //     try {
    //         // If no userId is provided, use the authenticated user's ID
    //         $userId = $userId ?? Auth::id();
            
    //         $blogs = Blog::with('user')
    //                     ->where('user_id', $userId)
    //                     ->latest()
    //                     ->get();

    //         $user = User::findOrFail($userId);

    //         return response()->json([
    //             'status' => 'success',
    //             'user' => [
    //                 'id' => $user->id,
    //                 'name' => $user->name,
    //                 'email' => $user->email
    //             ],
    //             'total_posts' => $blogs->count(),
    //             'data' => $blogs
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Error fetching user\'s blog posts',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function getMyBlogs()
    {
        try {
            $user = Auth::user();
            $blogs = Blog::with('user')
                        ->where('user_id', $user->id)
                        ->latest()
                        ->get();

            return response()->json([
                'status' => 'success',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ],
                'total_posts' => $blogs->count(),
                'data' => $blogs
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching your blog posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $blog = Blog::with('user')->findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $blog
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Blog post not found'
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'authorName' => 'required|string|max:255',
            ]);

            $user = Auth::user();
            $validatedData['user_id'] = $user->id;

            $blog = Blog::create($validatedData);

            return response()->json([
                'status' => 'success',
                'message' => 'Blog post created successfully',
                'data' => $blog->load('user')
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error creating blog post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $blog = Blog::findOrFail($id);
            
            // Check if the user is the owner of the blog post
            if ($blog->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this blog post'
                ], 403);
            }

            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'authorName' => 'required|string|max:255',
            ]);

            $blog->update($validatedData);

            return response()->json([
                'status' => 'success',
                'message' => 'Blog post updated successfully',
                'data' => $blog->load('user')
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error updating blog post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            
            // Check if the user is the owner of the blog post
            if ($blog->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this blog post'
                ], 403);
            }

            $blog->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Blog post deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error deleting blog post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $request->validate([
                'query' => 'required|string|min:2',
                'filter' => 'nullable|string|in:title,author,all'
            ]);

            $query = $request->input('query');
            $filter = $request->input('filter', 'all'); // default to 'all' if not specified

            $blogsQuery = Blog::with('user');

            switch ($filter) {
                case 'title':
                    $blogsQuery->where('title', 'LIKE', "%{$query}%");
                    break;
                
                case 'author':
                    $blogsQuery->where('authorName', 'LIKE', "%{$query}%");
                    break;
                
                default: // 'all'
                    $blogsQuery->where(function ($q) use ($query) {
                        $q->where('title', 'LIKE', "%{$query}%")
                          ->orWhere('authorName', 'LIKE', "%{$query}%");
                    });
                    break;
            }

            $blogs = $blogsQuery->latest()->get();

            if ($blogs->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No results found for your search',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'status' => 'success',
                'total_results' => $blogs->count(),
                'data' => $blogs
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid search parameters',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error performing search',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}