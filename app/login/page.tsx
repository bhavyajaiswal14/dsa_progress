'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'


export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) {
        throw new Error('Login failed')
      }
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Login Error",
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md bg-black border-green-600">
        <CardHeader>
          <CardTitle className='text-green-600 flex justify-center items-center'>Login to DSA Progress</CardTitle>
          <CardDescription className='text-gray-600 flex justify-center items-center'>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          className='text-white bg-black border-green-600'
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <Input
        className='text-white bg-black border-green-600'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Button className='text-white w-full text-lg my-10  border border-input bg-green-600 hover:bg-green-950 hover:text-white' type="submit">Login</Button>
      </form>
      </CardContent>
      </Card>
    </div>
  )
}