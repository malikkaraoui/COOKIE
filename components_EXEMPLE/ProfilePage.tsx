import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  ChefHat,
  Star,
  Users,
  TrendingUp,
  Wallet,
  Trophy,
  BookOpen,
  Target,
  Award,
  Calendar,
  Sparkles,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Coins,
  PieChart,
  Activity,
  Gift,
  Crown,
  Flame,
  Zap,
  Heart
} from 'lucide-react';
import { XPProgressBar } from './XPProgressBar';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

interface ProfilePageProps {
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
    xp?: number;
    level?: string;
    nextLevel?: string;
    xpForNextLevel?: number;
    xpCurrentLevel?: number;
    pendingRewards?: number;
    nextUnlock?: string;
    recipesCreated?: number;
    stars?: number;
    followers?: number;
  };
  isMobile?: boolean;
}

export function ProfilePage({ user, isMobile = false }: ProfilePageProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Mock data pour les graphiques
  const performanceData = [
    { month: 'Jan', value: 2400, target: 2000 },
    { month: 'Fév', value: 3200, target: 2500 },
    { month: 'Mar', value: 2800, target: 2500 },
    { month: 'Avr', value: 3800, target: 3000 },
    { month: 'Mai', value: 4200, target: 3500 },
    { month: 'Juin', value: 5100, target: 4000 }
  ];

  const portfolioData = [
    { name: 'Actions', value: 45, color: '#FF9900' },
    { name: 'Obligations', value: 25, color: '#2D9596' },
    { name: 'ETFs', value: 20, color: '#FFD700' },
    { name: 'Crypto', value: 10, color: '#FF6B6B' }
  ];

  const achievements = [
    { id: 1, name: 'Premier Pas', icon: '🌱', description: 'Première recette créée', unlocked: true, date: '15 Jan 2024' },
    { id: 2, name: 'Chef Populaire', icon: '⭐', description: '100 followers atteints', unlocked: true, date: '20 Fév 2024' },
    { id: 3, name: 'Master Chef', icon: '👨‍🍳', description: '10 recettes publiées', unlocked: true, date: '5 Mar 2024' },
    { id: 4, name: 'Stratège', icon: '🎯', description: 'Performance +10%', unlocked: true, date: '12 Avr 2024' },
    { id: 5, name: 'Influenceur', icon: '🔥', description: '500 followers', unlocked: false, progress: 234 },
    { id: 6, name: 'Légende', icon: '👑', description: '50 recettes parfaites', unlocked: false, progress: 12 }
  ];

  const recentActivity = [
    { action: 'Recette créée', name: 'Croissance Équilibrée', date: '2h', icon: '📝', color: 'text-green-600' },
    { action: 'Niveau atteint', name: 'Chef Confirmé', date: '1j', icon: '⬆️', color: 'text-[#FF9900]' },
    { action: 'Follower +12', name: 'Marie L., Pierre D...', date: '2j', icon: '👥', color: 'text-blue-600' },
    { action: 'Étoile gagnée', name: 'Recette "Safe Haven"', date: '3j', icon: '⭐', color: 'text-yellow-600' }
  ];

  const stats = {
    followers: user.followers || 234,
    following: 156,
    recipesCreated: user.recipesCreated || 12,
    stars: user.stars || 47,
    totalInvested: 28500,
    performance: 8.7,
    portfolioValue: 31000,
    rank: 142
  };

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] via-white to-[#E6F7F7] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Hero Section - Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="overflow-hidden bg-gradient-to-br from-[#FF9900] via-[#FFB340] to-[#FFD700] border-none shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                
                {/* Avatar avec animation */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    <Avatar className="w-32 h-32 ring-4 ring-white shadow-2xl">
                      <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-white text-[#FF9900] text-4xl">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Badge de niveau */}
                    <motion.div
                      className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ChefHat className="w-6 h-6 text-[#FF9900]" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Info utilisateur */}
                <div className="flex-1 text-center md:text-left text-white">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl">
                      Chef {user.firstName} {user.lastName}
                    </h1>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      <Crown className="w-3 h-3 mr-1" />
                      {user.level || 'Chef Confirmé'}
                    </Badge>
                  </div>

                  <p className="text-white/90 mb-4">
                    Membre depuis Janvier 2024 • Rang #{stats.rank} mondial
                  </p>

                  {/* Stats rapides */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="w-5 h-5" />
                      <div>
                        <p className="text-2xl">{stats.followers}</p>
                        <p className="text-xs text-white/80">Followers</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-5 h-5" />
                      <div>
                        <p className="text-2xl">{stats.recipesCreated}</p>
                        <p className="text-xs text-white/80">Recettes</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Star className="w-5 h-5 fill-white" />
                      <div>
                        <p className="text-2xl">{stats.stars}</p>
                        <p className="text-xs text-white/80">Étoiles</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Trophy className="w-5 h-5 fill-white" />
                      <div>
                        <p className="text-2xl">{achievements.filter(a => a.unlocked).length}/{achievements.length}</p>
                        <p className="text-xs text-white/80">Succès</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* XP Progress dans le header */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/90">Progression vers {user.nextLevel}</span>
                      <span className="text-sm text-white/90">
                        {user.xp || 3250} / {user.xpForNextLevel || 5000} XP
                      </span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((user.xp || 3250) / (user.xpForNextLevel || 5000)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Grid de cartes interactives */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Wallet Card - Expandable */}
          <motion.div
            layout
            className={`${expandedCard === 'wallet' ? 'md:col-span-2 lg:col-span-3' : ''}`}
          >
            <motion.div
              whileHover={{ scale: expandedCard === 'wallet' ? 1 : 1.02, y: expandedCard === 'wallet' ? 0 : -4 }}
              onClick={() => toggleCard('wallet')}
              className="cursor-pointer"
            >
              <Card className={`p-6 h-full transition-all duration-300 ${
                walletConnected 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300' 
                  : 'bg-white border-2 border-gray-200 hover:border-[#FF9900]/50'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      walletConnected ? 'bg-green-500' : 'bg-gray-100'
                    }`}>
                      <Wallet className={`w-6 h-6 ${walletConnected ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900">Wallet Crypto</h3>
                      <p className="text-xs text-gray-500">
                        {walletConnected ? 'Connecté' : 'Non connecté'}
                      </p>
                    </div>
                  </div>
                  {walletConnected ? (
                    <Unlock className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedCard === 'wallet' ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {walletConnected ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-1">Adresse</p>
                              <p className="text-sm text-gray-900 font-mono">0x742d...3f8a</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-1">Balance</p>
                              <p className="text-sm text-gray-900">2.45 ETH</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWalletConnected(false);
                            }}
                          >
                            Déconnecter
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">
                            Connectez votre wallet pour débloquer les fonctionnalités crypto et participer aux stratégies DeFi.
                          </p>
                          <Button 
                            className="w-full bg-gradient-to-r from-[#FF9900] to-[#FFB340] hover:from-[#FF8800] hover:to-[#FFA030] text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWalletConnected(true);
                            }}
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Connecter mon Wallet
                          </Button>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <Button 
                      className={`w-full ${
                        walletConnected 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gradient-to-r from-[#FF9900] to-[#FFB340] hover:from-[#FF8800] hover:to-[#FFA030]'
                      } text-white`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!walletConnected) {
                          setWalletConnected(true);
                        }
                      }}
                    >
                      {walletConnected ? 'Gérer mon wallet' : 'Connecter'}
                    </Button>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.div>

          {/* Performance Card - Expandable */}
          <motion.div
            layout
            className={`${expandedCard === 'performance' ? 'md:col-span-2 lg:col-span-3' : ''}`}
          >
            <motion.div
              whileHover={{ scale: expandedCard === 'performance' ? 1 : 1.02, y: expandedCard === 'performance' ? 0 : -4 }}
              onClick={() => toggleCard('performance')}
              className="cursor-pointer"
            >
              <Card className="p-6 h-full bg-gradient-to-br from-green-50 to-white border-2 border-green-200 hover:border-green-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900">Performance</h3>
                      <p className="text-xs text-gray-500">6 derniers mois</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    +{stats.performance}%
                  </Badge>
                </div>

                <AnimatePresence>
                  {expandedCard === 'performance' ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={performanceData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="target" 
                            stroke="#FF9900" 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-600">Performance réelle</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FF9900]"></div>
                          <span className="text-xs text-gray-600">Objectif</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-3xl text-green-600 mb-1">+{stats.performance}%</p>
                      <p className="text-xs text-gray-500">Cliquez pour voir les détails</p>
                    </div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.div>

          {/* Portfolio Card - Expandable */}
          <motion.div
            layout
            className={`${expandedCard === 'portfolio' ? 'md:col-span-2 lg:col-span-3' : ''}`}
          >
            <motion.div
              whileHover={{ scale: expandedCard === 'portfolio' ? 1 : 1.02, y: expandedCard === 'portfolio' ? 0 : -4 }}
              onClick={() => toggleCard('portfolio')}
              className="cursor-pointer"
            >
              <Card className="p-6 h-full bg-white border-2 border-gray-200 hover:border-[#2D9596]/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2D9596] flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900">Portfolio</h3>
                      <p className="text-xs text-gray-500">Répartition actuelle</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-gray-900">{stats.portfolioValue.toLocaleString()} €</p>
                    <p className="text-xs text-gray-500">Valeur totale</p>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedCard === 'portfolio' ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <RePieChart>
                          <Pie
                            data={portfolioData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {portfolioData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-3">
                        {portfolioData.map((item) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <p className="text-sm text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.value}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex justify-around py-4">
                      {portfolioData.map((item) => (
                        <div key={item.name} className="text-center">
                          <div 
                            className="w-3 h-3 rounded-full mx-auto mb-1" 
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="text-xs text-gray-500">{item.name}</p>
                          <p className="text-sm text-gray-900">{item.value}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.div>

        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FF9900]" />
              Succès & Badges
            </h2>
            <Badge className="bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30">
              {achievements.filter(a => a.unlocked).length}/{achievements.length} débloqués
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`p-4 text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-[#FFD700]/20 to-white border-2 border-[#FFD700]'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                }`}>
                  <div className="text-4xl mb-2 filter grayscale-0">
                    {achievement.icon}
                  </div>
                  <h4 className="text-sm text-gray-900 mb-1">{achievement.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{achievement.description}</p>
                  {achievement.unlocked ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      {achievement.date}
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#FF9900] rounded-full"
                          style={{ width: `${(achievement.progress! / 500) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{achievement.progress}/500</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#2D9596]" />
            Activité Récente
          </h2>

          <Card className="p-6 bg-white">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${activity.color}`}>{activity.action}</p>
                      <span className="text-xs text-gray-400">{activity.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{activity.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
