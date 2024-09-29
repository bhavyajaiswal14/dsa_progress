import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    const { username, password } = await request.json()
    console.log('Received username:', username)
    console.log('Received password:', password)
  
    try {
      const user = await prisma.user.findUnique({ where: { username } })
      if (!user) {
        console.log('User not found')
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
      }

    if (user.password !== password) {
        console.log('Invalid password')
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }
  
      cookies().set('userId', user.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
      cookies().set('username', user.username, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
  
      return NextResponse.json({ message: 'Login successful' })
    } catch (error) {
      console.error('Login error:', error)
      return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 })
    }
  }
  