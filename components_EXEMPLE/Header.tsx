import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bell, ChefHat, Star, Coins, TrendingUp } from 'lucide-react';
import { XPProgressBar } from './XPProgressBar';
import cookieLogo from 'figma:asset/51ee84cfca40ad000b3f50758c8a0f35910535cd.png';

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
    completionPercentage: number;
    unlockedModules: number;
    totalModules: number;
    role?: 'user' | 'admin' | 'staff';
    stars?: number;
    recipesCreated?: number;
    followers?: number;
    xp?: number;
    level?: string;
    nextLevel?: string;
    xpForNextLevel?: number;
    xpCurrentLevel?: number;
    pendingRewards?: number;
    nextUnlock?: string;
  };
  onAccessAdmin?: () => void;
  onProfileClick?: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

export function Header({ 
  user, 
  onAccessAdmin, 
  onProfileClick, 
  isMobile = false, 
  isTablet = false 
}: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20 shadow-sm relative">
      <div className={`${isMobile ? 'p-3' : isTablet ? 'p-4' : 'px-8 py-4'}`}>
        <div className="flex items-center justify-between">
        {/* Logo $COOKIE */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-gradient-to-br from-[#FF9900] to-[#FFB340] p-0.5">
            <div className="w-full h-full bg-white rounded-lg flex items-center justify-center p-1">
              <img 
                src={cookieLogo} 
                alt="$COOKIE" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {!isMobile && (
            <div>
              <h1 className="text-gray-900 font-bold text-xl">$COOKIE</h1>
              <p className="text-gray-500 text-xs">Votre épargne communautaire</p>
            </div>
          )}
        </div>

        {/* User Stats - Desktop Only */}
        {!isMobile && !isTablet && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF5E6] rounded-lg">
              <Coins className="w-4 h-4 text-[#FF9900]" />
              <div>
                <p className="text-xs text-gray-500">Total épargné</p>
                <p className="text-gray-900">28 500 €</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Performance</p>
                <p className="text-green-600">+8.7%</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {!isMobile && (
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </Button>
          )}
          
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onProfileClick}
          >
            <Avatar className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} ring-2 ring-[#FF9900]/30 hover:ring-[#FF9900]/60 transition-all`}>
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-gradient-to-br from-[#FF9900] to-[#FFB340] text-white">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>

            {!isMobile && (
              <div>
                <p className="text-sm text-gray-900">Chef {user.firstName}</p>
                <p className="text-xs text-gray-500">{user.recipesCreated || 3} recettes</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* XP Progress Bar - Bottom of Header */}
      {user.xp !== undefined && user.level && user.nextLevel && user.xpForNextLevel && user.xpCurrentLevel !== undefined && (
        <XPProgressBar
          xp={user.xp}
          level={user.level}
          nextLevel={user.nextLevel}
          xpForNextLevel={user.xpForNextLevel}
          xpCurrentLevel={user.xpCurrentLevel}
          pendingRewards={user.pendingRewards}
          nextUnlock={user.nextUnlock}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}