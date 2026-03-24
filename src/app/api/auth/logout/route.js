import { NextResponse } from 'next/server';

// === POST ===
// Handler for logging out a user
export async function POST() {

    // Creates a JSON response and returns { success: true } to indicate logout succeeded
    const response = NextResponse.json({ success: true });

    // Clears the authentication cookie
    // Setting the cookie with an empty value and an expiration in the past deletes it
    response.cookies.set('token', '', {
        httpOnly: true, // Cookie is not accessible through JS
        expires: new Date(0), // Sets expiration to the past to delete cookie
        path: '/', // Matches the path of the original cookie
    });

    // Return the response
    return response;
}