'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      if (data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.username}!`,
        })
        router.push('/dashboard')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-950">
      <Card className="w-full max-w-md bg-black border-green-600">
        <CardHeader>
          <CardTitle className="text-green-500 text-2xl font-bold text-center">Login to DSA Progress</CardTitle>
          <CardDescription className="text-gray-400 text-center">Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-200">Username</label>
              <Input
                id="username"
                className="text-white bg-stone-900 border-green-600 focus:ring-green-500 focus:border-green-500"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">Password</label>
              <Input
                id="password"
                className="text-white bg-stone-900 border-green-600 focus:ring-green-500 focus:border-green-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button 
              className="w-full text-lg mt-6 bg-green-600 hover:bg-green-700 text-white transition-colors duration-300"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}