import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export function requireAuth() {
  // Get userId from cookies
  const userId = cookies().get('userId');

  // If the user is not authenticated, throw an error
  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // Return the authenticated userId if necessary
  return userId;
}
