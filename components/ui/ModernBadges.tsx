import React from 'react';
import { Award, Shield, Star, TrendingUp, Trophy, Zap, Flame, Heart } from 'lucide-react';

interface BadgeProps {
  name: string;
}

const Badge: React.FC<BadgeProps> = ({ name }) => {
  const getIconAndColor = () => {
    switch (name) {
      // Streak Badges
      case 'Week Warrior':
        return { icon: Shield, color: 'from-blue-500 to-cyan-700' };
      case 'Fortnight Warrior':
        return { icon: TrendingUp, color: 'from-green-500 to-emerald-700' };
      case 'Month Master':
        return { icon: Star, color: 'from-purple-500 to-indigo-700' };
      case '50 Din Streak YAY':
        return { icon: Shield, color: 'from-cyan-500 to-blue-700' };
      case 'Main Legend Hoon':
        return { icon: Star, color: 'from-green-400 to-lime-600' };
      case '365 Din Wala Coder':
        return { icon: Flame, color: 'from-yellow-500 to-amber-700' };

      // LeetCode Problem Badges
      case 'Easy Peasy':
        return { icon: Award, color: 'from-pink-500 to-rose-700' };
      case 'Medium Mastro':
        return { icon: Flame, color: 'from-orange-500 to-yellow-700' };
      case 'Hardcore Coder':
        return { icon: Zap, color: 'from-red-500 to-rose-700' };
      case 'Aaram Se Bhai!':
        return { icon: Trophy, color: 'from-red-500 to-pink-700' };
      case 'Pakka Medium Mestro':
        return { icon: Flame, color: 'from-orange-500 to-yellow-700' };
      case 'Zindagi Ka Coding King!':
        return { icon: Award, color: 'from-indigo-500 to-purple-700' };

      // Points Badges
      case 'Point Prodigy':
        return { icon: Star, color: 'from-yellow-500 to-amber-700' };
      case 'Paisa Hi Paisa':
        return { icon: Heart, color: 'from-pink-500 to-fuchsia-700' };
      case 'Lakshya Se Aage':
        return { icon: Trophy, color: 'from-blue-500 to-purple-700' };

      // Quirky Leaderboard Position Badges
      case 'Topper':
        return { icon: Trophy, color: 'from-purple-500 to-indigo-700' };
      case 'Second Chance':
        return { icon: TrendingUp, color: 'from-orange-500 to-red-700' };
      case 'Third Time Lucky':
        return { icon: Award, color: 'from-teal-500 to-green-700' };

      default:
        return { icon: Award, color: 'from-gray-500 to-gray-700' };
    }
  };

  const { icon: Icon, color } = getIconAndColor();

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${color} text-white shadow-lg transition-all duration-300 hover:scale-105`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {name}
    </div>
  );
};

interface ModernBadgesProps {
  badges: { name: string }[];
}

const ModernBadges: React.FC<ModernBadgesProps> = ({ badges }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge key={badge.name} name={badge.name} />
      ))}
    </div>
  );
};

export default ModernBadges;
