import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  ChefHat, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Flame,
  Shield,
  Sparkles,
  Lock,
  BarChart3
} from 'lucide-react';

interface MesRecettesPageProps {
  isMobile?: boolean;
}

interface UserRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{ name: string; allocation: number; isPremium: boolean }>;
  riskLevel: 'Douce' | 'Équilibrée' | 'Relevée';
  totalInvested: number;
  performance: string;
  performanceValue: number;
  createdAt: string;
}

const mockUserRecipes: UserRecipe[] = [
  {
    id: '1',
    name: 'Ma Recette Équilibrée',
    description: 'Mon mix personnel : sécurité et croissance',
    ingredients: [
      { name: 'Pain (ETF actions Monde)', allocation: 40, isPremium: false },
      { name: 'Riz (Obligations)', allocation: 30, isPremium: false },
      { name: 'Huile d\'olive (Or)', allocation: 15, isPremium: false },
      { name: 'Vin rouge (Bitcoin)', allocation: 10, isPremium: true },
      { name: 'Sel (Cash)', allocation: 5, isPremium: false }
    ],
    riskLevel: 'Équilibrée',
    totalInvested: 15000,
    performance: '+6.8%',
    performanceValue: 6.8,
    createdAt: '15 Nov 2025'
  },
  {
    id: '2',
    name: 'Mon Fonds Dividendes',
    description: 'Pour générer des revenus passifs',
    ingredients: [
      { name: 'Beurre (Actions dividendes)', allocation: 50, isPremium: false },
      { name: 'Fromage râpé (ETF factoriel)', allocation: 25, isPremium: false },
      { name: 'Crème (SCPI)', allocation: 25, isPremium: false }
    ],
    riskLevel: 'Douce',
    totalInvested: 8500,
    performance: '+4.2%',
    performanceValue: 4.2,
    createdAt: '8 Nov 2025'
  },
  {
    id: '3',
    name: 'Portfolio Agressif Tech',
    description: 'Focus sur la croissance et l\'innovation',
    ingredients: [
      { name: 'Bœuf (S&P 500)', allocation: 50, isPremium: false },
      { name: 'Herbes (Thématiques IA/Green)', allocation: 30, isPremium: false },
      { name: 'Piment (Altcoins)', allocation: 15, isPremium: true },
      { name: 'Safran (Memecoins)', allocation: 5, isPremium: true }
    ],
    riskLevel: 'Relevée',
    totalInvested: 5000,
    performance: '+22.5%',
    performanceValue: 22.5,
    createdAt: '3 Nov 2025'
  }
];

export function MesRecettesPage({ isMobile = false }: MesRecettesPageProps) {
  const [recipes, setRecipes] = useState<UserRecipe[]>(mockUserRecipes);
  const [deletingRecipe, setDeletingRecipe] = useState<string | null>(null);

  const handleDelete = (recipeId: string) => {
    setDeletingRecipe(recipeId);
    setTimeout(() => {
      setRecipes(recipes.filter(r => r.id !== recipeId));
      setDeletingRecipe(null);
    }, 500);
  };

  const getRiskIcon = (risk: UserRecipe['riskLevel']) => {
    switch (risk) {
      case 'Douce': return Shield;
      case 'Équilibrée': return Sparkles;
      case 'Relevée': return Flame;
    }
  };

  const getRiskColor = (risk: UserRecipe['riskLevel']) => {
    switch (risk) {
      case 'Douce': return 'bg-[#2D9596] text-white';
      case 'Équilibrée': return 'bg-[#FFB340] text-white';
      case 'Relevée': return 'bg-[#FF9900] text-white';
    }
  };

  const totalInvested = recipes.reduce((acc, r) => acc + r.totalInvested, 0);
  const weightedPerformance = recipes.reduce((acc, r) => {
    return acc + (r.performanceValue * r.totalInvested / totalInvested);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] via-white to-[#E6F7F7] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-[#FF9900]/20">
              <ChefHat className="w-4 h-4 text-[#FF9900]" />
              <span className="text-sm text-gray-700">Vos créations personnelles</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl text-gray-900">
              Mes <span className="text-[#FF9900]">Recettes</span>
            </h1>
            
            <p className="text-lg text-gray-600">
              Gérez et suivez vos stratégies d'investissement personnalisées.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#FF9900] to-[#FFB340] hover:from-[#FFB340] hover:to-[#FF9900] text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer une recette
            </Button>
          </motion.div>
        </motion.div>

        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-white to-[#FFF5E6] border-2 border-[#FF9900]/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Total investi</p>
                <p className="text-2xl text-gray-900">{totalInvested.toLocaleString('fr-FR')} €</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Performance moyenne</p>
                <p className={`text-2xl ${weightedPerformance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  +{weightedPerformance.toFixed(1)}%
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Recettes actives</p>
                <p className="text-2xl text-gray-900">{recipes.length}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Plus-value</p>
                <p className="text-2xl text-green-600">
                  +{(totalInvested * weightedPerformance / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </p>
              </div>

            </div>
          </Card>
        </motion.div>

        {/* Recipes List */}
        {recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="p-12 text-center bg-white border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <ChefHat className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl text-gray-900">Aucune recette pour le moment</h3>
                <p className="text-gray-600">
                  Créez votre première recette d'investissement en combinant vos ingrédients préférés !
                </p>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#FF9900] to-[#FFB340] hover:from-[#FFB340] hover:to-[#FF9900] text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer ma première recette
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {recipes.map((recipe, index) => {
                const RiskIcon = getRiskIcon(recipe.riskLevel);
                
                return (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <Card className={`
                      p-6 bg-white border border-gray-200 hover:border-[#FF9900]/50 transition-all h-full
                      ${deletingRecipe === recipe.id ? 'opacity-50' : ''}
                    `}>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl text-gray-900">{recipe.name}</h3>
                            <Badge className={`${getRiskColor(recipe.riskLevel)} flex items-center gap-1`}>
                              <RiskIcon className="w-3 h-3" />
                              {recipe.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{recipe.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Créée le {recipe.createdAt}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Montant investi</p>
                          <p className="text-lg text-gray-900">{recipe.totalInvested.toLocaleString('fr-FR')} €</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Performance</p>
                          <p className={`text-lg ${recipe.performanceValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {recipe.performance}
                          </p>
                        </div>
                      </div>

                      {/* Ingredients with Allocation */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-3">Allocation des ingrédients :</p>
                        <div className="space-y-3">
                          {recipe.ingredients.map((ingredient, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 flex items-center gap-2">
                                  {ingredient.name}
                                  {ingredient.isPremium && (
                                    <Lock className="w-3 h-3 text-[#FFD700]" />
                                  )}
                                </span>
                                <span className="text-gray-900">{ingredient.allocation}%</span>
                              </div>
                              <Progress 
                                value={ingredient.allocation} 
                                className="h-2 bg-gray-100"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analyser
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#2D9596] text-[#2D9596] hover:bg-[#2D9596]/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(recipe.id)}
                          disabled={deletingRecipe === recipe.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-r from-[#FF9900]/10 to-[#2D9596]/10 border-2 border-[#FF9900]/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF9900] flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg text-gray-900">Comment créer une recette ?</h3>
                <p className="text-sm text-gray-700">
                  Rendez-vous dans l'<strong>Épicerie Fine</strong> pour choisir vos ingrédients. 
                  Vous pouvez utiliser jusqu'à <strong>5 ingrédients gratuits</strong> par recette. 
                  Les ingrédients premium nécessitent un abonnement $COOKIE Pro.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="bg-green-100 text-green-700 border border-green-300">
                    5 ingrédients gratuits
                  </Badge>
                  <Badge className="bg-[#FFD700]/20 text-[#CC7A00] border border-[#FFD700]">
                    Ingrédients premium avec Pro
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
