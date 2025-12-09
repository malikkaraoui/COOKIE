import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Gift, Lock, TrendingUp, Sparkles } from 'lucide-react';

interface XPProgressBarProps {
  xp: number;
  level: string;
  nextLevel: string;
  xpForNextLevel: number;
  xpCurrentLevel: number;
  pendingRewards?: number;
  nextUnlock?: string;
  isMobile?: boolean;
}

export function XPProgressBar({ 
  xp, 
  level, 
  nextLevel, 
  xpForNextLevel, 
  xpCurrentLevel,
  pendingRewards = 0,
  nextUnlock,
  isMobile = false
}: XPProgressBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate progress percentage
  const totalXPNeeded = xpForNextLevel - xpCurrentLevel;
  const currentProgress = xp - xpCurrentLevel;
  const progressPercentage = Math.min((currentProgress / totalXPNeeded) * 100, 100);
  const xpRemaining = xpForNextLevel - xp;

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress Bar with padding */}
      <div className={`px-4 pb-2 ${isMobile ? 'pt-1' : 'pt-1.5'}`}>
        <div className="flex items-center gap-3">
          {/* Level indicator - Start */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
            </motion.div>
            <span className="text-xs text-gray-700">{level}</span>
          </div>

          {/* Progress Bar - Middle */}
          <div className="relative flex-1 h-2 bg-gray-100 rounded-full overflow-hidden cursor-pointer group shadow-inner">
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Progress fill */}
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF9900] via-[#FFB340] to-[#FFD700] relative overflow-hidden rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Pulsing dot at the end of progress */}
            {progressPercentage > 0 && progressPercentage < 100 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${progressPercentage}%` }}
                animate={{ 
                  scale: [1, 1.5, 1], 
                  opacity: [1, 0.6, 1] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-[#FFD700] rounded-full shadow-lg ring-2 ring-white" />
              </motion.div>
            )}

            {/* Hover effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#FF9900]/10 via-[#FFB340]/10 to-[#FFD700]/10 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Next level indicator - End */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-gray-500">{nextLevel}</span>
            {pendingRewards > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative"
              >
                <Gift className="w-4 h-4 text-[#FF9900]" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white flex items-center justify-center text-[8px]">
                  {pendingRewards}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80"
          >
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45" />
            
            <div className="space-y-3 relative z-10">
              {/* Header with Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Star className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-gray-900">{level}</p>
                    <p className="text-xs text-gray-500">{xp.toLocaleString()} XP</p>
                  </div>
                </div>
                
                {pendingRewards > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="relative"
                  >
                    <Gift className="w-5 h-5 text-[#FF9900]" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center text-[9px]">
                      {pendingRewards}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Progress visualization */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progression</span>
                  <span className="text-xs text-[#FF9900]">{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF9900] via-[#FFB340] to-[#FFD700]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Next Level */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#2D9596]" />
                  <span className="text-sm text-gray-900">Prochain palier</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{nextLevel}</span>
                  <span className="text-sm text-gray-900">{xpForNextLevel.toLocaleString()} XP</span>
                </div>
                <div className="bg-[#FFF5E6] rounded-lg p-2">
                  <p className="text-xs text-[#FF9900]">
                    <strong>{xpRemaining.toLocaleString()} XP</strong> restants
                  </p>
                </div>
              </div>

              {/* Pending Rewards */}
              {pendingRewards > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700]/10 to-[#FF9900]/10 rounded-lg p-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Gift className="w-5 h-5 text-[#FF9900]" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {pendingRewards} cadeau{pendingRewards > 1 ? 'x' : ''} en attente
                      </p>
                      <p className="text-xs text-gray-500">Cliquez pour débloquer</p>
                    </div>
                  </div>
                </>
              )}

              {/* Next Unlock */}
              {nextUnlock && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Prochaine fonctionnalité</p>
                      <p className="text-sm text-gray-900">{nextUnlock}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Tips */}
              <div className="border-t border-gray-100" />
              <div className="flex items-start gap-2 bg-[#E6F7F7] rounded-lg p-3">
                <Sparkles className="w-4 h-4 text-[#2D9596] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-700">
                    Gagnez des XP en votant quotidiennement, en créant des recettes, 
                    et en participant à la communauté !
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}