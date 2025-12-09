import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Trophy,
  Star,
  Award,
  Target,
  TrendingUp,
  Users,
  ChefHat,
  Flame,
  Crown,
  Zap,
  Heart,
  Share2
} from 'lucide-react';

interface AchievementsPageProps {
  isMobile?: boolean;
}

export function AchievementsPage({ isMobile = false }: AchievementsPageProps) {
  const achievements = [
    {
      id: 1,
      icon: ChefHat,
      title: 'Premier Plat',
      description: 'Créer votre première recette',
      unlocked: true,
      unlockedAt: '2025-01-15',
      color: 'text-[#FF9900]',
      bgColor: 'bg-[#FF9900]/20',
      stars: 1
    },
    {
      id: 2,
      icon: Trophy,
      title: 'Chef Étoilé',
      description: 'Obtenir une note moyenne de 4.5/5',
      unlocked: true,
      unlockedAt: '2025-01-20',
      color: 'text-[#FFD700]',
      bgColor: 'bg-[#FFD700]/20',
      stars: 3
    },
    {
      id: 3,
      icon: Users,
      title: 'Influenceur Culinaire',
      description: 'Atteindre 100 followers',
      unlocked: true,
      unlockedAt: '2025-01-25',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
      stars: 2
    },
    {
      id: 4,
      icon: TrendingUp,
      title: 'Performance +100%',
      description: 'Créer une recette avec +100% de rendement',
      unlocked: true,
      unlockedAt: '2025-02-01',
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      stars: 3
    },
    {
      id: 5,
      icon: Share2,
      title: 'Viral',
      description: '100 copies de vos recettes',
      unlocked: true,
      unlockedAt: '2025-02-05',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20',
      stars: 2
    },
    {
      id: 6,
      icon: Flame,
      title: 'Risque Maximum',
      description: 'Créer 5 recettes "Très Élevé"',
      unlocked: false,
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      stars: 3
    },
    {
      id: 7,
      icon: Crown,
      title: 'Grand Chef',
      description: 'Créer 50 recettes',
      unlocked: false,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      stars: 5
    },
    {
      id: 8,
      icon: Heart,
      title: 'Favori de la Communauté',
      description: '1000 likes sur vos recettes',
      unlocked: false,
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      stars: 4
    },
    {
      id: 9,
      icon: Zap,
      title: 'Réaction Rapide',
      description: 'Profiter de 10 tendances en temps réel',
      unlocked: false,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/20',
      stars: 2
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalStars = unlockedAchievements.reduce((sum, a) => sum + a.stars, 0);
  const maxStars = achievements.reduce((sum, a) => sum + a.stars, 0);

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(count)].map((_, i) => (
          <Star key={i} className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#FFD700]/20 via-[#FF9900]/10 to-transparent border border-[#FFD700]/20 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 cookie-gradient-bg opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FF9900] rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mes Étoiles</h1>
              <p className="text-gray-400">Vos achievements et distinctions</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-[#FF9900]" />
                <span className="text-gray-400 text-sm">Achievements</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {unlockedAchievements.length}/{achievements.length}
              </p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-[#FFD700]" />
                <span className="text-gray-400 text-sm">Étoiles</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {totalStars}/{maxStars}
              </p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#2D9596]" />
                <span className="text-gray-400 text-sm">Progression</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-xl text-white font-semibold mb-4">Tous les Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <Card 
                key={achievement.id}
                className={`
                  bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 
                  ${achievement.unlocked 
                    ? 'hover:border-[#FFD700]/30 cursor-pointer' 
                    : 'opacity-50'
                  }
                  transition-all
                `}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      w-14 h-14 ${achievement.unlocked ? achievement.bgColor : 'bg-gray-800'}
                      rounded-xl flex items-center justify-center
                      ${achievement.unlocked ? 'cookie-glow-gold' : ''}
                    `}>
                      <Icon className={`w-7 h-7 ${achievement.unlocked ? achievement.color : 'text-gray-600'}`} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {renderStars(achievement.stars)}
                      {achievement.unlocked && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Débloqué
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h3 className={`
                    font-semibold mb-2
                    ${achievement.unlocked ? 'text-white' : 'text-gray-500'}
                  `}>
                    {achievement.title}
                  </h3>
                  
                  <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-500">
                      Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  
                  {!achievement.unlocked && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Target className="w-3 h-3" />
                        <span>En cours...</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Next Achievement */}
      <Card className="bg-gradient-to-br from-[#FF9900]/10 to-[#2D9596]/5 border-[#FF9900]/30">
        <CardHeader>
          <h2 className="text-xl text-white font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-[#FF9900]" />
            Prochain Objectif
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Risque Maximum</h3>
              <p className="text-sm text-gray-400">Créer 5 recettes "Très Élevé"</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FF9900] to-red-500 h-full" style={{ width: '40%' }} />
                </div>
                <span className="text-xs text-gray-400">2/5</span>
              </div>
            </div>
            <div className="flex gap-0.5">
              {renderStars(3)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
