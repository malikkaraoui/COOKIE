import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Users, 
  Copy,
  ChefHat,
  Flame,
  Shield,
  Sparkles
} from 'lucide-react';

interface RecettesPopulairesPageProps {
  isMobile?: boolean;
}

interface Recipe {
  id: string;
  name: string;
  author: string;
  authorAvatar: string;
  description: string;
  ingredients: string[];
  stars: number;
  copies: number;
  performance: string;
  performanceValue: number;
  riskLevel: 'Douce' | 'Équilibrée' | 'Relevée';
  totalInvestors: number;
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Le Bouillon Défensif',
    author: 'Chef Antoine',
    authorAvatar: '👨‍🍳',
    description: 'Une recette équilibrée parfaite pour les débutants. Mix d\'obligations, d\'or et d\'ETF monde avec une touche de Bitcoin.',
    ingredients: ['Pain', 'Riz', 'Huile d\'olive', 'Vin rouge', 'Sel'],
    stars: 4.8,
    copies: 2847,
    performance: '+8.4%',
    performanceValue: 8.4,
    riskLevel: 'Équilibrée',
    totalInvestors: 1204
  },
  {
    id: '2',
    name: 'Le Bourguignon Agressif',
    author: 'Chef Marie',
    authorAvatar: '👩‍🍳',
    description: 'Pour les gourmands de rendement ! ETF S&P 500, actions tech et une pincée d\'altcoins. Risqué mais savoureux.',
    ingredients: ['Bœuf', 'Vin rouge', 'Tomates', 'Piment d\'Espelette', 'Herbes de Provence'],
    stars: 4.6,
    copies: 1923,
    performance: '+18.2%',
    performanceValue: 18.2,
    riskLevel: 'Relevée',
    totalInvestors: 876
  },
  {
    id: '3',
    name: 'La Ratatouille Prudente',
    author: 'Chef Lucas',
    authorAvatar: '🧑‍🍳',
    description: 'Sécurité et rendement stable. Fonds euros, SCPI et obligations avec un soupçon d\'ETF monde.',
    ingredients: ['Pommes de terre', 'Pâtes', 'Carottes', 'Tomates', 'Huile d\'olive'],
    stars: 4.9,
    copies: 3421,
    performance: '+5.2%',
    performanceValue: 5.2,
    riskLevel: 'Douce',
    totalInvestors: 2103
  },
  {
    id: '4',
    name: 'Le Pot-au-Feu All Weather',
    author: 'Chef Sophie',
    authorAvatar: '👩‍🍳',
    description: 'Résiste à toutes les conditions de marché. Diversification maximale avec risk-parity et stratégies alternatives.',
    ingredients: ['Bouillon', 'Carottes', 'Poireaux', 'Bœuf', 'Pain', 'Sel'],
    stars: 4.7,
    copies: 2156,
    performance: '+9.8%',
    performanceValue: 9.8,
    riskLevel: 'Équilibrée',
    totalInvestors: 987
  },
  {
    id: '5',
    name: 'La Bouillabaisse Crypto',
    author: 'Chef Thomas',
    authorAvatar: '👨‍🍳',
    description: 'Pour les aventuriers ! Bitcoin, Ethereum et DeFi. Volatile mais avec un potentiel explosif.',
    ingredients: ['Poisson blanc', 'Vin blanc', 'Safran', 'Curcuma', 'Piment d\'Espelette'],
    stars: 4.3,
    copies: 743,
    performance: '+34.7%',
    performanceValue: 34.7,
    riskLevel: 'Relevée',
    totalInvestors: 412
  },
  {
    id: '6',
    name: 'Le Gratin Dividendes',
    author: 'Chef Emma',
    authorAvatar: '👩‍🍳',
    description: 'Flux de revenus réguliers avec des actions à dividendes et des REIT. Parfait pour l\'indépendance financière.',
    ingredients: ['Beurre', 'Fromage râpé', 'Crème fraîche', 'Pommes de terre', 'Lardons'],
    stars: 4.8,
    copies: 2634,
    performance: '+7.9%',
    performanceValue: 7.9,
    riskLevel: 'Équilibrée',
    totalInvestors: 1543
  }
];

export function RecettesPopulairesPage({ isMobile = false }: RecettesPopulairesPageProps) {
  const [copiedRecipe, setCopiedRecipe] = useState<string | null>(null);

  const handleCopy = (recipeId: string) => {
    setCopiedRecipe(recipeId);
    setTimeout(() => setCopiedRecipe(null), 2000);
  };

  const getRiskIcon = (risk: Recipe['riskLevel']) => {
    switch (risk) {
      case 'Douce': return Shield;
      case 'Équilibrée': return Sparkles;
      case 'Relevée': return Flame;
    }
  };

  const getRiskColor = (risk: Recipe['riskLevel']) => {
    switch (risk) {
      case 'Douce': return 'bg-[#2D9596] text-white';
      case 'Équilibrée': return 'bg-[#FFB340] text-white';
      case 'Relevée': return 'bg-[#FF9900] text-white';
    }
  };

  const sortedRecipes = [...mockRecipes].sort((a, b) => b.copies - a.copies);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] via-white to-[#E6F7F7] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-[#FFD700]/30">
            <Trophy className="w-4 h-4 text-[#FFD700]" />
            <span className="text-sm text-gray-700">Les meilleures recettes de la communauté</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl text-gray-900">
            Recettes <span className="text-[#FF9900]">Populaires</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les stratégies d'investissement les plus copiées et les mieux notées par la communauté.
            Inspirez-vous et adaptez-les à votre profil !
          </p>
        </motion.div>

        {/* Podium (Top 3) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {sortedRecipes.slice(0, 3).map((recipe, index) => {
            const podiumColors = [
              'from-[#FFD700] to-[#FFA500]', // Gold
              'from-[#C0C0C0] to-[#A8A8A8]', // Silver
              'from-[#CD7F32] to-[#A0522D]'  // Bronze
            ];
            const podiumIcons = ['🥇', '🥈', '🥉'];

            return (
              <Card 
                key={recipe.id}
                className={`p-6 bg-gradient-to-br ${podiumColors[index]} text-white border-none shadow-xl`}
              >
                <div className="text-center space-y-3">
                  <div className="text-5xl">{podiumIcons[index]}</div>
                  <h3 className="text-xl">{recipe.name}</h3>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Copy className="w-4 h-4" />
                      {recipe.copies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      {recipe.stars}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>

        {/* All Recipes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockRecipes.map((recipe, index) => {
            const RiskIcon = getRiskIcon(recipe.riskLevel);
            
            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 bg-white border border-gray-200 hover:border-[#FF9900]/50 transition-all h-full">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9900] to-[#FFB340] flex items-center justify-center text-2xl">
                        {recipe.authorAvatar}
                      </div>
                      <div>
                        <h3 className="text-lg text-gray-900">{recipe.name}</h3>
                        <p className="text-sm text-gray-500">par {recipe.author}</p>
                      </div>
                    </div>
                    <Badge className={`${getRiskColor(recipe.riskLevel)} flex items-center gap-1`}>
                      <RiskIcon className="w-3 h-3" />
                      {recipe.riskLevel}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">
                    {recipe.description}
                  </p>

                  {/* Ingredients */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Ingrédients principaux :</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ingredient, i) => (
                        <Badge key={i} variant="secondary" className="bg-[#FFF5E6] text-gray-700 border border-[#FF9900]/20">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4 py-4 border-t border-b border-gray-100">
                    <div className="text-center">
                      <div className={`text-lg ${recipe.performanceValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {recipe.performance}
                      </div>
                      <p className="text-xs text-gray-500">Perf.</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg text-gray-900 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-[#FFD700] fill-current" />
                        {recipe.stars}
                      </div>
                      <p className="text-xs text-gray-500">Note</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg text-gray-900">{recipe.copies}</div>
                      <p className="text-xs text-gray-500">Copies</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg text-gray-900">{recipe.totalInvestors}</div>
                      <p className="text-xs text-gray-500">Chefs</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    onClick={() => handleCopy(recipe.id)}
                    className={`
                      w-full transition-all
                      ${copiedRecipe === recipe.id
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-to-r from-[#FF9900] to-[#FFB340] hover:from-[#FFB340] hover:to-[#FF9900]'
                      }
                      text-white
                    `}
                  >
                    {copiedRecipe === recipe.id ? (
                      <>
                        <span className="mr-2">✓</span>
                        Recette copiée !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copier cette recette
                      </>
                    )}
                  </Button>

                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-r from-[#2D9596]/10 to-[#FF9900]/10 border-2 border-[#2D9596]/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2D9596] flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg text-gray-900">Comment copier une recette ?</h3>
                <p className="text-sm text-gray-700">
                  Cliquez sur "Copier cette recette" pour l'ajouter à votre portefeuille. Vous pouvez ensuite 
                  la personnaliser dans <strong>"Mes Recettes"</strong> en ajustant les proportions ou en 
                  ajoutant/retirant des ingrédients selon votre profil de risque.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
