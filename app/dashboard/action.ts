'use server'

import { cookies } from 'next/headers'
import { getUserById, getAllUsers, updateUserTopic } from '@/lib/data'
import { User, LeaderboardEntry, Topic } from './types'

export async function getUserData(): Promise<User> {
  const userId = cookies().get('userId')?.value
  if (!userId) {
    throw new Error('User not authenticated')
  }
  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const users = await getAllUsers()
  return users.map(user => ({
    name: user.username,
    progress: calculateOverallProgress(user.topics),
    avatar: '/placeholder.svg?height=40&width=40',
    topics: user.topics,
  })).sort((a, b) => b.progress - a.progress)
}

export async function updateTopic(topicName: string, field: keyof Topic, value: number): Promise<Topic> {
  const userId = cookies().get('userId')?.value
  if (!userId) {
    throw new Error('User not authenticated')
  }
  return await updateUserTopic(userId, topicName, field, value)
}

function calculateOverallProgress(topics: Topic[]): number {
  return Math.round(topics.reduce((sum, topic) => sum + topic.progress, 0) / topics.length)
}