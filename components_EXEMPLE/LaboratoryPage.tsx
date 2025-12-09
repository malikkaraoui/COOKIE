import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  ChefHat, 
  TrendingUp, 
  Users, 
  Star,
  Trophy,
  Flame,
  Shield,
  Target,
  BookOpen,
  Copy,
  Heart,
  Clock
} from 'lucide-react';

interface LaboratoryPageProps {
  isMobile?: boolean;
}

export function LaboratoryPage({ isMobile = false }: LaboratoryPageProps) {
  const stats = [
    {
      icon: ChefHat,
      label: 'Recettes Créées',
      value: '12',
      color: 'text-[#FF9900]',
      bgColor: 'bg-[#FF9900]/10'
    },
    {
      icon: Star,
      label: 'Note Moyenne',
      value: '4.5',
      color: 'text-[#FFD700]',
      bgColor: 'bg-[#FFD700]/10'
    },
    {
      icon: Copy,
      label: 'Fois Copiée',
      value: '234',
      color: 'text-[#2D9596]',
      bgColor: 'bg-[#2D9596]/10'
    },
    {
      icon: Users,
      label: 'Followers',
      value: '567',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  const recentActivity = [
    {
      user: 'Chef Marcus',
      action: 'a copié votre recette',
      recipe: 'Le Soufflé à Haut Rendement',
      time: 'Il y a 2h',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      user: 'Chef Sophie',
      action: 'a noté 5 étoiles',
      recipe: 'La Ratatouille Équilibrée',
      time: 'Il y a 5h',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
    },
    {
      user: 'Chef Antoine',
      action: 'suit votre profil',
      recipe: '',
      time: 'Il y a 1 jour',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const myRecipes = [
    {
      name: 'Crypto Swing Special',
      ingredients: 5,
      stars: 4.8,
      copies: 89,
      risk: 'Élevé',
      returns: '+180%'
    },
    {
      name: 'DeFi Yield Paradise',
      ingredients: 7,
      stars: 4.6,
      copies: 156,
      risk: 'Très Élevé',
      returns: '+320%'
    },
    {
      name: 'Stable Dividend Mix',
      ingredients: 4,
      stars: 4.3,
      copies: 234,
      risk: 'Faible',
      returns: '+12%'
    }
  ];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Faible':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"><Shield className="w-3 h-3 mr-1" />{risk}</Badge>;
      case 'Élevé':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"><Flame className="w-3 h-3 mr-1" />{risk}</Badge>;
      case 'Très Élevé':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs"><Flame className="w-3 h-3 mr-1" />{risk}</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">{risk}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#FF9900]/20 via-[#2D9596]/10 to-transparent border border-[#FF9900]/20 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 cookie-gradient-bg opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF9900] to-[#FFB340] rounded-2xl flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mon Laboratoire</h1>
              <p className="text-gray-400">Créez et gérez vos stratégies financières</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#FF9900]/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Recipes */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl text-white font-semibold">Mes Recettes</h2>
                <Button size="sm" className="cookie-btn-primary">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Nouvelle Recette
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {myRecipes.map((recipe, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-[#FF9900]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold group-hover:text-[#FF9900] transition-colors">
                        {recipe.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {recipe.ingredients} ingrédients
                      </p>
                    </div>
                    {getRiskBadge(recipe.risk)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                        <span className="text-gray-400">{recipe.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Copy className="w-4 h-4 text-[#2D9596]" />
                        <span className="text-gray-400">{recipe.copies}</span>
                      </div>
                    </div>
                    <div className="text-green-400 font-semibold">
                      {recipe.returns}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <h2 className="text-xl text-white font-semibold">Activité Récente</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <img 
                    src={activity.avatar} 
                    alt={activity.user}
                    className="w-10 h-10 rounded-full ring-2 ring-[#FF9900]/30"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">
                      <span className="text-white font-medium">{activity.user}</span>
                      {' '}{activity.action}
                    </p>
                    {activity.recipe && (
                      <p className="text-xs text-[#FF9900] mt-1">{activity.recipe}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#FF9900]/10 to-[#FFB340]/5 border-[#FF9900]/30 cursor-pointer hover:border-[#FF9900]/50 transition-all group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[#FF9900]/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-[#FF9900]" />
            </div>
            <h3 className="text-white font-semibold mb-1">Explorer les Ingrédients</h3>
            <p className="text-sm text-gray-400">Découvrez de nouveaux produits financiers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#2D9596]/10 to-[#4DB8B9]/5 border-[#2D9596]/30 cursor-pointer hover:border-[#2D9596]/50 transition-all group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[#2D9596]/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-[#2D9596]" />
            </div>
            <h3 className="text-white font-semibold mb-1">Rejoindre la Communauté</h3>
            <p className="text-sm text-gray-400">Échangez avec d'autres chefs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 border-[#FFD700]/30 cursor-pointer hover:border-[#FFD700]/50 transition-all group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[#FFD700]/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-[#FFD700]" />
            </div>
            <h3 className="text-white font-semibold mb-1">Mes Achievements</h3>
            <p className="text-sm text-gray-400">Consultez vos étoiles et badges</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
