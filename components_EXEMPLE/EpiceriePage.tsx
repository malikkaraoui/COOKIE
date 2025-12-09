import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ShoppingBasket, 
  Star, 
  Lock, 
  Info,
  Sparkles,
  Plus,
  Check
} from 'lucide-react';
import { ingredients, type IngredientFrequency } from '../data/ingredients';
import { RecipeBasket } from './RecipeBasket';

interface EpiceriePageProps {
  isMobile?: boolean;
}

export function EpiceriePage({ isMobile = false }: EpiceriePageProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [basketIngredients, setBasketIngredients] = useState<string[]>([]);

  const frequencyOrder: IngredientFrequency[] = [
    'omniprésent',
    'très fréquent', 
    'fréquent',
    'occasionnel',
    'rare',
    'très rare'
  ];

  const frequencyColors: Record<IngredientFrequency, string> = {
    'omniprésent': 'bg-green-100 text-green-700 border-green-300',
    'très fréquent': 'bg-blue-100 text-blue-700 border-blue-300',
    'fréquent': 'bg-purple-100 text-purple-700 border-purple-300',
    'occasionnel': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'rare': 'bg-orange-100 text-orange-700 border-orange-300',
    'très rare': 'bg-red-100 text-red-700 border-red-300'
  };

  const groupedIngredients = frequencyOrder.reduce((acc, freq) => {
    acc[freq] = ingredients.filter(ing => ing.frequency === freq);
    return acc;
  }, {} as Record<IngredientFrequency, typeof ingredients>);

  const handleAddToBasket = (ingredientId: string) => {
    if (!basketIngredients.includes(ingredientId)) {
      setBasketIngredients([...basketIngredients, ingredientId]);
    }
  };

  const handleRemoveFromBasket = (ingredientId: string) => {
    setBasketIngredients(basketIngredients.filter(id => id !== ingredientId));
  };

  const handleClearBasket = () => {
    setBasketIngredients([]);
  };

  const handleCreateRecipe = (recipeName: string) => {
    console.log('Creating recipe:', recipeName, 'with ingredients:', basketIngredients);
    // TODO: Navigate to recipe creation or save recipe
    alert(`Recette "${recipeName}" créée avec ${basketIngredients.length} ingrédients !`);
    handleClearBasket();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] via-white to-[#E6F7F7] p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-[#FF9900]/20">
            <ShoppingBasket className="w-4 h-4 text-[#FF9900]" />
            <span className="text-sm text-gray-700">Votre garde-manger financier</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl text-gray-900">
            L'<span className="text-[#FF9900]">Épicerie</span> Fine
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            30 ingrédients financiers pour composer vos recettes d'investissement.
            Chaque ingrédient correspond à un produit ou une stratégie financière.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">{ingredients.filter(i => !i.isPremium).length} gratuits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FFD700]"></div>
              <span className="text-sm text-gray-600">{ingredients.filter(i => i.isPremium).length} premium</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs: Tous / Gratuits / Premium */}
        <Tabs defaultValue="tous" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="gratuits">Gratuits ({ingredients.filter(i => !i.isPremium).length})</TabsTrigger>
            <TabsTrigger value="premium">Premium ({ingredients.filter(i => i.isPremium).length})</TabsTrigger>
          </TabsList>

          {/* Tous */}
          <TabsContent value="tous" className="space-y-8 mt-6">
            {frequencyOrder.map((frequency) => {
              const freqIngredients = groupedIngredients[frequency];
              if (freqIngredients.length === 0) return null;

              return (
                <motion.div
                  key={frequency}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${frequencyColors[frequency]} border px-3 py-1`}>
                      {frequency}
                    </Badge>
                    <span className="text-sm text-gray-500">{freqIngredients.length} ingrédients</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {freqIngredients.map((ingredient) => (
                      <IngredientCard 
                        key={ingredient.id} 
                        ingredient={ingredient}
                        onClick={() => setSelectedIngredient(ingredient.id)}
                        addToBasket={handleAddToBasket}
                        removeFromBasket={handleRemoveFromBasket}
                        isInBasket={basketIngredients.includes(ingredient.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Gratuits */}
          <TabsContent value="gratuits" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredients.filter(i => !i.isPremium).map((ingredient) => (
                <IngredientCard 
                  key={ingredient.id} 
                  ingredient={ingredient}
                  onClick={() => setSelectedIngredient(ingredient.id)}
                  addToBasket={handleAddToBasket}
                  removeFromBasket={handleRemoveFromBasket}
                  isInBasket={basketIngredients.includes(ingredient.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Premium */}
          <TabsContent value="premium" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredients.filter(i => i.isPremium).map((ingredient) => (
                <IngredientCard 
                  key={ingredient.id} 
                  ingredient={ingredient}
                  onClick={() => setSelectedIngredient(ingredient.id)}
                  addToBasket={handleAddToBasket}
                  removeFromBasket={handleRemoveFromBasket}
                  isInBasket={basketIngredients.includes(ingredient.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-r from-[#FF9900]/10 to-[#2D9596]/10 border-2 border-[#FF9900]/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF9900] flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg text-gray-900">Comment utiliser les ingrédients ?</h3>
                <p className="text-sm text-gray-700">
                  Chaque ingrédient représente un produit financier. Combinez-les pour créer vos propres recettes 
                  d'investissement dans la section <strong>"Mes Recettes"</strong>. Les ingrédients gratuits sont 
                  disponibles pour tous, les ingrédients premium nécessitent un abonnement.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="bg-green-100 text-green-700 border border-green-300">
                    Gratuit : illimité
                  </Badge>
                  <Badge className="bg-[#FFD700]/20 text-[#CC7A00] border border-[#FFD700]">
                    Premium : accès réservé
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Recipe Basket - Floating Button */}
      <RecipeBasket
        selectedIngredients={basketIngredients}
        onRemoveIngredient={handleRemoveFromBasket}
        onClear={handleClearBasket}
        onCreateRecipe={handleCreateRecipe}
      />
    </div>
  );
}

interface IngredientCardProps {
  ingredient: typeof ingredients[0];
  onClick: () => void;
  addToBasket: (ingredientId: string) => void;
  removeFromBasket: (ingredientId: string) => void;
  isInBasket: boolean;
}

function IngredientCard({ ingredient, onClick, addToBasket, removeFromBasket, isInBasket }: IngredientCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`
        p-4 h-full transition-all duration-200 
        ${ingredient.isPremium 
          ? 'bg-gradient-to-br from-white to-[#FFF9E6] border-2 border-[#FFD700]' 
          : 'bg-white border border-gray-200 hover:border-[#FF9900]/50'
        }
      `}>
        <div className="flex items-start gap-3">
          
          {/* Icon */}
          <div className={`
            text-4xl w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0
            ${ingredient.isPremium ? 'bg-[#FFD700]/20' : 'bg-gray-50'}
          `}>
            {ingredient.icon}
          </div>

          <div className="flex-1 min-w-0">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 truncate">{ingredient.name}</h3>
                <p className="text-xs text-gray-500">{ingredient.id}</p>
              </div>
              {ingredient.isPremium && (
                <Badge className="bg-[#FFD700] text-[#CC7A00] px-2 py-0.5 text-xs flex-shrink-0">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Financial Product */}
            <div className="mb-2">
              <p className="text-sm text-[#FF9900]">{ingredient.financialProduct}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 line-clamp-2">
              {ingredient.description}
            </p>

            {/* Add to Basket */}
            <div className="mt-4">
              <Button
                size="sm"
                className={`
                  ${isInBasket ? 'bg-red-500 hover:bg-red-600' : 'bg-[#FF9900] hover:bg-[#FFB300]'}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInBasket) {
                    removeFromBasket(ingredient.id);
                  } else {
                    addToBasket(ingredient.id);
                  }
                }}
              >
                {isInBasket ? 'Retirer' : 'Ajouter'}
              </Button>
            </div>

          </div>
        </div>
      </Card>
    </motion.div>
  );
}