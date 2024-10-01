import { PrismaClient } from '@prisma/client'
import { User, Topic } from '@/app/dashboard/types'

const prisma = new PrismaClient()

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { topics: true, badges: true },
  })
  return user ? {
    id: user.id,
    username: user.username,
    topics: user.topics,
    streak: user.streak,
    lastActiveDate: user.lastActiveDate,
    badges: user.badges,
    points: user.points,
    leetcodeUrl: user.leetcodeUrl || undefined,
    githubUrl: user.githubUrl || undefined,
  } : null
}

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    include: { topics: true, badges: true },
  })
  return users.map(user => ({
    id: user.id,
    username: user.username,
    topics: user.topics,
    streak: user.streak,
    lastActiveDate: user.lastActiveDate,
    badges: user.badges,
    points: user.points,
    leetcodeUrl: user.leetcodeUrl || undefined,
    githubUrl: user.githubUrl || undefined,
  }))
}

// export async function updateUserTopic(userId: string, topicName: string, field: keyof Topic, value: number): Promise<Topic> {
//   const existingTopic = await prisma.topic.findUnique({
//     where: {
//       userId_name: {
//         userId: userId,
//         name: topicName,
//       },
//     },
//   });

//   if (!existingTopic) {
//     throw new Error('Topic not found');
//   }


//   // Update or create activity record
//   const today = new Date()
//   today.setHours(0, 0, 0, 0)

//   await prisma.activity.upsert({
//     where: {
//       userId_createdAt: {
//         userId: userId,
//         createdAt: today
//       }
//     },
//     update: {
//       count: {
//         increment: 1
//       }
//     },
//     create: {
//       userId: userId,
//       count: 1,
//       createdAt: today
//     }
//   })

//   const updatedTopicData: Partial<Topic> = {
//     name: topicName,
//     learning: existingTopic.learning,
//     leetcodeEasy: existingTopic.leetcodeEasy,
//     leetcodeMedium: existingTopic.leetcodeMedium,
//     leetcodeHard: existingTopic.leetcodeHard,
//     [field]: value,
//   };

//   const updatedTopic = await prisma.topic.update({
//     where: {
//       userId_name: {
//         userId: userId,
//         name: topicName,
//       },
//     },
//     data: {
//       [field]: value,
//       progress: calculateProgress(updatedTopicData),
//     },
//   });

//   // Update user's streak and points
//   await updateUserStreakAndPoints(userId);

//   return updatedTopic;
// }


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

  // Get the current UTC date
  let todayUTC = new Date();
  console.log("Today (UTC):", todayUTC);

  // Adjust the date to Indian Standard Time (UTC + 5:30)
  todayUTC = new Date(todayUTC.getTime() + 5.5 * 60 * 60 * 1000); // Add 5 hours 30 minutes
  console.log("Today (IST before normalization):", todayUTC);

  // Set hours to midnight for IST (instead of UTC)
  todayUTC.setHours(0, 0, 0, 0);
  console.log("Today (IST normalized to midnight):", todayUTC);

  // Update or create activity record
  await prisma.activity.upsert({
    where: {
      userId_createdAt: {
        userId: userId,
        createdAt: todayUTC, // Using adjusted IST date
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      userId: userId,
      count: 1,
      createdAt: todayUTC, // Create with IST midnight date
    },
  });

  const updatedTopicData: Partial<Topic> = {
    name: topicName,
    learning: existingTopic.learning,
    leetcodeEasy: existingTopic.leetcodeEasy,
    leetcodeMedium: existingTopic.leetcodeMedium,
    leetcodeHard: existingTopic.leetcodeHard,
    [field]: value,
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
      progress: calculateProgress(updatedTopicData),
    },
  });

  // Update user's streak and points
  await updateUserStreakAndPoints(userId);

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

async function updateUserStreakAndPoints(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActiveDate = new Date(user.lastActiveDate);
  lastActiveDate.setHours(0, 0, 0, 0);

  let newStreak = user.streak;
  let newPoints = user.points;

  if (today.getTime() === lastActiveDate.getTime()) {
    // User already active today, no changes
  } else if (today.getTime() - lastActiveDate.getTime() === 86400000) {
    // User active yesterday, increment streak and points
    newStreak += 1;
    newPoints += 10;
  } else {
    // Streak broken, reset to 1
    newStreak = 1;
    newPoints += 10;
  }

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastActiveDate: today,
      points: newPoints,
    },
  });

  // Check for new badges
  await checkAndAwardBadges(userId, newStreak, newPoints);
}

async function checkAndAwardBadges(userId: string, streak: number, points: number) {
  const badgesToAward = [];

  // Count total number of LeetCode easy, medium, and hard problems solved
  const topics = await prisma.topic.findMany({
    where: { userId },
  });

  const totalLeetCodeEasy = topics.reduce((acc, topic) => acc + (topic.leetcodeEasy || 0), 0);
  const totalLeetCodeMedium = topics.reduce((acc, topic) => acc + (topic.leetcodeMedium || 0), 0);
  const totalLeetCodeHard = topics.reduce((acc, topic) => acc + (topic.leetcodeHard || 0), 0);

  // Badge conditions for LeetCode problems solved
  if (totalLeetCodeEasy >= 50) badgesToAward.push({ name: 'Easy Peasy', description: 'Solved 50 LeetCode easy questions' });
  if (totalLeetCodeMedium >= 50) badgesToAward.push({ name: 'Medium Mastro', description: 'Solved 50 LeetCode medium questions' });
  if (totalLeetCodeHard >= 50) badgesToAward.push({ name: 'Hardcore Coder', description: 'Solved 50 LeetCode hard questions' });

  // Fun Hinglish Badges
  if (totalLeetCodeEasy >= 100) badgesToAward.push({ name: 'Aaram Se Bhai!', description: 'Solved 100 easy questions like a boss!' });
  if (totalLeetCodeMedium >= 100) badgesToAward.push({ name: 'Pakka Medium Mestro', description: 'Solved 100 medium LeetCode questions' });
  if (totalLeetCodeHard >= 100) badgesToAward.push({ name: 'Zindagi Ka Coding King!', description: 'Solved 100 hard LeetCode problems' });

  // Badge conditions for streaks
  if (streak >= 7) badgesToAward.push({ name: 'Week Warrior', description: 'Maintained a 7-day streak' });
  if (streak >= 15) badgesToAward.push({ name: 'Fortnight Warrior', description: 'Maintained a 15-day streak' });
  if (streak >= 30) badgesToAward.push({ name: 'Month Master', description: 'Maintained a 30-day streak' });
  if (streak >= 50) badgesToAward.push({ name: '50 Din Streak YAY', description: 'Solved questions for 50 days straight' });

  // Quirky Streak Badges
  if (streak >= 100) badgesToAward.push({ name: 'Main Legend Hoon', description: 'Maintained a 100-day streak! Kya baat!' });
  if (streak >= 365) badgesToAward.push({ name: '365 Din Wala Coder', description: '1-year streak! Kitni coding bhai?!' });

  // Badge conditions for points
  if (points >= 1000) badgesToAward.push({ name: 'Point Prodigy', description: 'Earned 1000 points' });
  if (points >= 5000) badgesToAward.push({ name: 'Paisa Hi Paisa', description: 'Earned 5000 points - coding se kamaal kar diya!' });
  if (points >= 10000) badgesToAward.push({ name: 'Lakshya Se Aage', description: '10,000 points scored! Mind-blowing stuff!' });

  // Check for top positions in leaderboard (based on points)
  const allUsers = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    take: 3,
  });

  if (allUsers[0]?.id === userId) {
    badgesToAward.push({ name: 'Topper', description: 'Ranked 1st on the leaderboard' });
  } else if (allUsers[1]?.id === userId) {
    badgesToAward.push({ name: 'Second Chance', description: 'Ranked 2nd on the leaderboard' });
  } else if (allUsers[2]?.id === userId) {
    badgesToAward.push({ name: 'Third Time Lucky', description: 'Ranked 3rd on the leaderboard' });
  }

  // Upsert badges into the database
  for (const badge of badgesToAward) {
    await prisma.badge.upsert({
      where: {
        userId_name: {
          userId: userId,
          name: badge.name,
        },
      },
      update: {},
      create: {
        name: badge.name,
        description: badge.description,
        userId: userId,
      },
    });
  }
}


export async function updateUserProfile(userId: string, leetcodeUrl: string, githubUrl: string): Promise<User> {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      leetcodeUrl,
      githubUrl,
    },
    include: { topics: true, badges: true },
  });

  return {
    id: updatedUser.id,
    username: updatedUser.username,
    topics: updatedUser.topics,
    streak: updatedUser.streak,
    lastActiveDate: updatedUser.lastActiveDate,
    badges: updatedUser.badges,
    points: updatedUser.points,
    leetcodeUrl: updatedUser.leetcodeUrl || undefined,
    githubUrl: updatedUser.githubUrl || undefined,
  };
}