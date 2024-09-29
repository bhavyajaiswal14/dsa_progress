import { PrismaClient } from '@prisma/client'
import { User, Topic } from '@/app/dashboard/types'

const prisma = new PrismaClient()

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { topics: true },
  })
  return user ? {
    id: user.id,
    username: user.username,
    topics: user.topics,
  } : null
}

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    include: { topics: true },
  })
  return users.map(user => ({
    id: user.id,
    username: user.username,
    topics: user.topics,
  }))
}

export async function updateUserTopic(userId: string, topicName: string, field: keyof Topic, value: number): Promise<Topic> {
    const existingTopic = await prisma.topic.findUnique({
        where: {
          userId_name: {
            userId: userId,
            name: topicName,
          },
        },
      });

      if (!existingTopic) {
        throw new Error('Topic not found');
      }


        // Construct a Partial<Topic> with all fields defined
  const updatedTopicData: Partial<Topic> = {
    name: topicName,
    learning: existingTopic.learning,
    leetcodeEasy: existingTopic.leetcodeEasy,
    leetcodeMedium: existingTopic.leetcodeMedium,
    leetcodeHard: existingTopic.leetcodeHard,
    [field]: value, // Only update the specific field
  };



  const updatedTopic = await prisma.topic.update({
    where: {
      userId_name: {
        userId: userId,
        name: topicName,
      },
    },
    data: {
      [field]: value,
      progress: calculateProgress(updatedTopicData), // Now pass the complete Partial<Topic> object
    },
  });

  return updatedTopic;
}

function calculateProgress(topic: Partial<Topic>): number {
  return Math.round(
    ((topic.learning || 0) / 50 * 50) +
    ((topic.leetcodeEasy || 0) / 15 * 15) +
    ((topic.leetcodeMedium || 0) / 20 * 20) +
    ((topic.leetcodeHard || 0) / 15 * 15)
  )
}