const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fixed users with their passwords
const FIXED_USERS = [
  { username: "sumit", password: "sumit48" },
  { username: "bhavya", password: "bhavya200" },
  { username: "ayush", password: "ayush197" },
  { username: "amarendra", password: "das203" },
  { username: "hamzah", password: "hamzah31" }
];

// Fixed topics for all users
const FIXED_TOPICS = [
  "Maths", "Sorting", "Array", "BS", "Strings", "Linked List", "Recursion",
  "Bit Manip.", "Stack & Queues", "Sliding window", "Two Pointer", "Heaps",
  "Greedy Algo.", "BT", "BST", "Graphs", "DP", "Tries"
];

// Seed the database with users and topics
async function main() {
  for (const user of FIXED_USERS) {
    // Create the user
    const createdUser = await prisma.user.create({
      data: {
        username: user.username,
        password: user.password,
      },
    });

    // Seed the topics for the user
    await prisma.topic.createMany({
      data: FIXED_TOPICS.map((topic) => ({
        name: topic,
        userId: createdUser.id,
      })),
    });

    console.log(`Created user ${user.username} with topics.`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
