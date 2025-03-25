<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function getProfile()
    {
        $user = Auth::user();
        
        // If user has an image, set the image_url
        if ($user->image) {
            $user->image_url = url('storage/profiles/' . $user->image);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email'=> 'required|email|unique:users,email,'.$user->id,
                'age'=> 'nullable|integer',
                'sex'=> 'nullable|in:male,female,other',
                'phoneNumber'=> 'nullable|string',
                'status'=> 'nullable|in:married,single,divorce',
                'address'=> 'nullable|string',
                'city'=> 'nullable|string',
                'state'=> 'nullable|string',
                'country'=> 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            // Handle image upload if present
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                // Delete old image if exists
                if ($user->image) {
                    Storage::disk('public')->delete('profiles/' . $user->image);
                }

                $image = $request->file('image');
                $filename = time() . '_' . $image->getClientOriginalName();
                $path = $image->storeAs('public/profiles', $filename);
                
                $validatedData['image'] = $filename;
                $validatedData['image_url'] = url('storage/profiles/' . $filename);
            }

            // Update user with validated data
            $user->update($validatedData);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'data' => $user
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while updating the profile.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}