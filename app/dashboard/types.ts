export interface Topic {
    name: string;
    progress: number;
    learning: number;
    leetcodeEasy: number;
    leetcodeMedium: number;
    leetcodeHard: number;
  }
  
  export interface User {
    id: string;
    username: string;
    topics: Topic[];
  }
  
  export interface LeaderboardEntry {
    name: string;
    progress: number;
    avatar: string;
    topics: Topic[];
  }



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

export interface Toast {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}