import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    cookies().set('userId', user.id, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 * 7 
    });
    cookies().set('username', user.username, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 * 7 
    });

    return NextResponse.json({ 
      message: 'Login successful', 
      user: { 
        id: user.id, 
        username: user.username,
        streak: user.streak,
        points: user.points,
        leetcodeUrl: user.leetcodeUrl,
        githubUrl: user.githubUrl
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}