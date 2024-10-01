export interface Topic {
  id: string;
  name: string;
  progress: number;
  learning: number;
  leetcodeEasy: number;
  leetcodeMedium: number;
  leetcodeHard: number;
  userId: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  topics: Topic[];
  streak: number;
  lastActiveDate: Date;
  badges: Badge[];
  points: number;
  leetcodeUrl?: string;
  githubUrl?: string;
}

export interface LeaderboardEntry {
  name: string;
  progress: number;
  avatar: string;
  topics: Topic[];
  streak: number;
  points: number;
  githubUrl?: string;
  leetcodeUrl?: string;
}

export interface Toast {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}