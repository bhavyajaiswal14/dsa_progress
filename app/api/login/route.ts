import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Parsing the request body
    let username: string, password: string;
    try {
      const body = await request.json();
      username = body.username;
      password = body.password;
      console.log('Received username:', username);
      console.log('Received password:', password);
    } catch (err) {
      console.error('Invalid JSON in request:', err);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Fetching user from database
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.error('User not found for username:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    // Validating password (without bcrypt)
    if (user.password !== password) {
      console.error('Invalid password for user:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    // Setting cookies with 1-week expiry
    try {
      cookies().set('userId', user.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 }); // 1 week expiry
      cookies().set('username', user.username, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    } catch (cookieError) {
      console.error('Error setting cookies:', cookieError);
      return NextResponse.json({ error: 'Error setting cookies' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}

