import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Soup, 
  TrendingUp, 
  Users, 
  Coins, 
  Flame, 
  Sparkles,
  ChefHat,
  ArrowRight,
  Shield,
  Brain,
  Trophy,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface MarmitePageProps {
  isMobile?: boolean;
}

export function MarmitePage({ isMobile = false }: MarmitePageProps) {
  const [selectedVote, setSelectedVote] = useState<'douce' | 'relevee' | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (choice: 'douce' | 'relevee') => {
    setSelectedVote(choice);
    setHasVoted(true);
  };

  const marmiteStats = {
    totalAmount: 1247850,
    participants: 3842,
    performance: '+12.4%',
    dailyVotes: {
      douce: 1823,
      relevee: 2019
    }
  };

  const votePercentage = {
    douce: (marmiteStats.dailyVotes.douce / (marmiteStats.dailyVotes.douce + marmiteStats.dailyVotes.relevee)) * 100,
    relevee: (marmiteStats.dailyVotes.relevee / (marmiteStats.dailyVotes.douce + marmiteStats.dailyVotes.relevee)) * 100
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] via-white to-[#E6F7F7] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-[#FF9900]/20">
            <Sparkles className="w-4 h-4 text-[#FF9900]" />
            <span className="text-sm text-gray-700">L'épargne collective qui vous rapporte</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl text-gray-900">
            La <span className="text-[#FF9900]">Marmite</span> Communautaire
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Le mix parfait entre <span className="text-[#2D9596]">Polymarket</span> et l'<span className="text-[#FF9900]">épargne communautaire</span>. 
            Votez votre conviction, mais votre épargne suit toujours la majorité.
          </p>
          
          {/* Key Promise */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full"
            >
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Vous ne perdez jamais</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-[#E6F7F7] border border-[#2D9596]/30 px-4 py-2 rounded-full"
            >
              <Brain className="w-4 h-4 text-[#2D9596]" />
              <span className="text-sm text-[#2D9596]">La majorité a raison</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-[#FFF5E6] border border-[#FF9900]/30 px-4 py-2 rounded-full"
            >
              <Trophy className="w-4 h-4 text-[#FF9900]" />
              <span className="text-sm text-[#FF9900]">Chaque vote est une leçon</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated Marmite + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Marmite Animation */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card className="p-8 bg-gradient-to-br from-white to-[#FFF5E6] border-2 border-[#FF9900]/30 shadow-2xl overflow-hidden">
              
              {/* Floating particles in background */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: i % 2 === 0 ? '#FF9900' : '#2D9596'
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}

              {/* Marmite SVG with Animation */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                
                {/* Enhanced Steam bubbles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full opacity-60"
                    style={{
                      left: `${25 + i * 8}%`,
                      bottom: '60%',
                      width: `${10 + Math.random() * 10}px`,
                      height: `${10 + Math.random() * 10}px`,
                      background: i % 2 === 0 ? '#2D9596' : '#4DB8B9'
                    }}
                    animate={{
                      y: [-100, -220],
                      opacity: [0.6, 0],
                      scale: [1, 1.8],
                      x: [0, (Math.random() - 0.5) * 40]
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeOut"
                    }}
                  />
                ))}

                {/* Marmite Icon with enhanced animation */}
                <motion.div
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={!hasVoted ? {
                      scale: [1, 1.03, 1],
                    } : {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={!hasVoted ? {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {
                      duration: 0.5,
                      repeat: 2
                    }}
                  >
                    <Soup className="w-64 h-64 text-[#FF9900] drop-shadow-2xl" strokeWidth={1.5} />
                  </motion.div>
                </motion.div>

                {/* Enhanced Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-[#FF9900]/20 to-transparent rounded-full blur-3xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Ring animation on vote */}
                {hasVoted && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-[#FFD700]"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                )}
              </div>

              {/* Stats Overlay */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl mb-1">
                    <Coins className="w-5 h-5 text-[#FFD700]" />
                    <span className="text-gray-900">{(marmiteStats.totalAmount / 1000).toFixed(0)}K€</span>
                  </div>
                  <p className="text-xs text-gray-500">Total épargné</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl mb-1">
                    <Users className="w-5 h-5 text-[#2D9596]" />
                    <span className="text-gray-900">{marmiteStats.participants}</span>
                  </div>
                  <p className="text-xs text-gray-500">Chefs actifs</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl mb-1 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                    <span>{marmiteStats.performance}</span>
                  </div>
                  <p className="text-xs text-gray-500">Performance</p>
                </div>
              </div>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button 
                  className="w-full py-6 bg-gradient-to-r from-[#FF9900] to-[#FFB340] hover:from-[#FFB340] hover:to-[#FF9900] text-white shadow-xl"
                  size="lg"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  Déposer dans la Marmite
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Card>
          </motion.div>

          {/* Question du Chef (Vote) */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Animated glow around the card */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-[#2D9596] via-[#FF9900] to-[#2D9596] rounded-2xl opacity-20 blur-xl"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <Card className="relative p-6 md:p-8 bg-white border-2 border-[#2D9596]/30 shadow-xl overflow-hidden">
              
              {/* Animated background particles */}
              {!hasVoted && [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#FF9900] rounded-full opacity-40"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D9596] to-[#4DB8B9] flex items-center justify-center relative"
                  animate={!hasVoted ? {
                    boxShadow: [
                      '0 0 0 0 rgba(45, 149, 150, 0.4)',
                      '0 0 0 10px rgba(45, 149, 150, 0)',
                      '0 0 0 0 rgba(45, 149, 150, 0)'
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <ChefHat className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-2xl text-gray-900">Question du Chef</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Vote quotidien</p>
                    <span className="text-gray-300">·</span>
                    <motion.p 
                      className="text-sm text-[#FF9900]"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Expire dans 8h
                    </motion.p>
                  </div>
                </div>
                {!hasVoted && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-6 h-6 text-[#FF9900]" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-6 relative z-10">
                
                <div className="text-center py-4">
                  <p className="text-xl md:text-2xl text-gray-900 mb-2">
                    Quelle stratégie pour la marmite aujourd'hui ?
                  </p>
                  <p className="text-sm text-gray-500">
                    {!hasVoted ? 'Votez selon votre conviction' : 'Votre vote est enregistré'}
                  </p>
                </div>

                {/* Vote Options */}
                <div className="space-y-4 relative">
                  
                  {/* VS Divider */}
                  {!hasVoted && (
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D9596] to-[#FF9900] flex items-center justify-center shadow-2xl border-4 border-white">
                        <span className="text-white text-sm">VS</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Option Douce */}
                  <motion.button
                    whileHover={!hasVoted ? { scale: 1.02, x: -5 } : {}}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVote('douce')}
                    disabled={hasVoted}
                    className={`
                      relative w-full p-6 rounded-xl border-2 transition-all overflow-hidden
                      ${selectedVote === 'douce' 
                        ? 'border-[#2D9596] bg-gradient-to-br from-[#2D9596]/10 to-[#E6F7F7]' 
                        : 'border-gray-200 hover:border-[#2D9596]/50 bg-white'
                      }
                      ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* Animated background on hover */}
                    {!hasVoted && selectedVote !== 'douce' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#2D9596]/5 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    )}

                    {/* Success animation */}
                    {selectedVote === 'douce' && hasVoted && (
                      <motion.div
                        className="absolute top-4 right-4"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 0.6 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-[#2D9596]" />
                      </motion.div>
                    )}

                    <div className="flex items-start gap-4 relative z-10">
                      <motion.div 
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center relative
                          ${selectedVote === 'douce' ? 'bg-[#2D9596]' : 'bg-gray-100'}
                        `}
                        animate={selectedVote === 'douce' && hasVoted ? {
                          boxShadow: [
                            '0 0 0 0 rgba(45, 149, 150, 0.4)',
                            '0 0 0 15px rgba(45, 149, 150, 0)',
                          ]
                        } : {}}
                        transition={{ duration: 1, repeat: 3 }}
                      >
                        <Sparkles className={`w-6 h-6 ${selectedVote === 'douce' ? 'text-white' : 'text-gray-400'}`} />
                      </motion.div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg mb-2 text-gray-900">Version mijotée (Douce)</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          On reste prudent et on laisse la marmite sur feu doux. Stratégie défensive avec plus de cash et d'obligations.
                        </p>
                        {hasVoted && (
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ delay: 0.3 }}
                          >
                            <Progress value={votePercentage.douce} className="h-2" />
                            <p className="text-xs text-gray-500">
                              {marmiteStats.dailyVotes.douce} votes ({votePercentage.douce.toFixed(1)}%)
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>

                  {/* Option Relevée */}
                  <motion.button
                    whileHover={!hasVoted ? { scale: 1.02, x: 5 } : {}}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVote('relevee')}
                    disabled={hasVoted}
                    className={`
                      relative w-full p-6 rounded-xl border-2 transition-all overflow-hidden
                      ${selectedVote === 'relevee' 
                        ? 'border-[#FF9900] bg-gradient-to-br from-[#FF9900]/10 to-[#FFF5E6]' 
                        : 'border-gray-200 hover:border-[#FF9900]/50 bg-white'
                      }
                      ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* Animated background on hover */}
                    {!hasVoted && selectedVote !== 'relevee' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#FF9900]/5 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    )}

                    {/* Success animation */}
                    {selectedVote === 'relevee' && hasVoted && (
                      <motion.div
                        className="absolute top-4 right-4"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 0.6 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-[#FF9900]" />
                      </motion.div>
                    )}

                    <div className="flex items-start gap-4 relative z-10">
                      <motion.div 
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          ${selectedVote === 'relevee' ? 'bg-[#FF9900]' : 'bg-gray-100'}
                        `}
                        animate={selectedVote === 'relevee' && hasVoted ? {
                          boxShadow: [
                            '0 0 0 0 rgba(255, 153, 0, 0.4)',
                            '0 0 0 15px rgba(255, 153, 0, 0)',
                          ]
                        } : {}}
                        transition={{ duration: 1, repeat: 3 }}
                      >
                        <Flame className={`w-6 h-6 ${selectedVote === 'relevee' ? 'text-white' : 'text-gray-400'}`} />
                      </motion.div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg mb-2 text-gray-900">Version relevée (Piment)</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          On ajoute une pincée de piment et on augmente le risque pour chercher plus de rendement. Plus d'actions et de crypto.
                        </p>
                        {hasVoted && (
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ delay: 0.3 }}
                          >
                            <Progress value={votePercentage.relevee} className="h-2 bg-[#FF9900]/20" />
                            <p className="text-xs text-gray-500">
                              {marmiteStats.dailyVotes.relevee} votes ({votePercentage.relevee.toFixed(1)}%)
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>

                </div>

                <AnimatePresence>
                  {hasVoted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-[#E6F7F7] border-2 border-green-200 p-6">
                        {/* Confetti animation */}
                        {[...Array(15)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                              left: `${Math.random() * 100}%`,
                              background: ['#FF9900', '#2D9596', '#FFD700', '#4DB8B9'][Math.floor(Math.random() * 4)]
                            }}
                            initial={{ y: -20, opacity: 1, scale: 0 }}
                            animate={{ 
                              y: 100, 
                              opacity: 0, 
                              scale: 1,
                              rotate: Math.random() * 360
                            }}
                            transition={{ 
                              duration: 1 + Math.random(),
                              delay: i * 0.05,
                              ease: "easeOut"
                            }}
                          />
                        ))}

                        <div className="flex items-start gap-4 relative z-10">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                          </motion.div>
                          <div className="flex-1">
                            <h4 className="text-green-900 mb-2">Vote enregistré avec succès !</h4>
                            <p className="text-sm text-green-700 mb-3">
                              La stratégie gagnante sera appliquée à minuit. Votre épargne suivra la décision de la majorité.
                            </p>
                            <div className="bg-white/70 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Votre vote :</span>
                                <span className={`flex items-center gap-1 ${selectedVote === 'douce' ? 'text-[#2D9596]' : 'text-[#FF9900]'}`}>
                                  {selectedVote === 'douce' ? <Sparkles className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                                  {selectedVote === 'douce' ? 'Douce' : 'Relevée'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">XP gagné :</span>
                                <span className="text-[#FFD700]">+50 XP</span>
                              </div>
                              {selectedVote === (votePercentage.relevee > votePercentage.douce ? 'relevee' : 'douce') && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 }}
                                  className="flex items-center gap-2 text-sm bg-[#FFD700]/20 rounded px-2 py-1"
                                >
                                  <Trophy className="w-4 h-4 text-[#FFD700]" />
                                  <span className="text-gray-700">Vous êtes du côté de la majorité ! +25 XP bonus</span>
                                </motion.div>
                              )}
                              {selectedVote !== (votePercentage.relevee > votePercentage.douce ? 'relevee' : 'douce') && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 }}
                                  className="flex items-center gap-2 text-sm bg-blue-50 rounded px-2 py-1"
                                >
                                  <Brain className="w-4 h-4 text-blue-600" />
                                  <span className="text-gray-700">Minorité, mais vous apprenez ! Pas de perte, juste une leçon.</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </Card>
          </motion.div>

        </div>

        {/* Main Concept - Polymarket meets Épargne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Why you never lose */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 relative overflow-hidden">
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900">Pourquoi vous ne perdez jamais ?</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-900 mb-1">Votre épargne suit la majorité</p>
                    <p className="text-sm text-gray-600">
                      Peu importe votre vote, votre argent suit toujours la stratégie gagnante décidée par la communauté.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-900 mb-1">La sagesse collective a raison</p>
                    <p className="text-sm text-gray-600">
                      Statistiquement, la majorité prend de meilleures décisions que les individus isolés.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-900 mb-1">Chaque vote est une leçon</p>
                    <p className="text-sm text-gray-600">
                      Votez "mal" ? Aucun impact sur votre épargne, mais vous apprenez comment le marché pense. Votez "bien" ? Bonus XP !
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#2D9596]" />
                    <span className="text-sm text-gray-700">Comme Polymarket</span>
                  </div>
                  <span className="text-2xl">+</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#FF9900]" />
                    <span className="text-sm text-gray-700">Épargne protégée</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* How it works */}
          <Card className="p-6 md:p-8 bg-white border border-gray-200">
            <h3 className="text-2xl mb-6 text-gray-900">Comment ça marche ?</h3>
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9900] to-[#FFB340] flex items-center justify-center flex-shrink-0">
                  <span className="text-white">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">Déposez votre épargne</h4>
                  <p className="text-sm text-gray-600">
                    Alimentez la marmite avec le montant de votre choix. Pas de minimum, pas de maximum.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D9596] to-[#4DB8B9] flex items-center justify-center flex-shrink-0">
                  <span className="text-white">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">Votez selon votre conviction</h4>
                  <p className="text-sm text-gray-600">
                    Chaque jour, exprimez votre opinion sur la stratégie. Une personne = une voix. Gagnez des XP pour chaque vote.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center flex-shrink-0">
                  <span className="text-white">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">Profitez des rendements collectifs</h4>
                  <p className="text-sm text-gray-600">
                    Votre épargne suit la stratégie gagnante. Si vous votez avec la majorité, bonus XP. Sinon, vous apprenez !
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-[#FFF5E6] to-[#E6F7F7] rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-[#FFD700]" />
                  <p className="text-sm text-gray-900">Système de récompenses</p>
                </div>
                <p className="text-xs text-gray-600">
                  Vote quotidien : +50 XP · Avec la majorité : +25 XP bonus · Série de votes : multiplicateur x2
                </p>
              </div>

            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
