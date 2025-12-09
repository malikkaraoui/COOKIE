import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBasket, 
  Plus, 
  X, 
  ChefHat, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ingredients } from '../data/ingredients';

interface RecipeBasketProps {
  selectedIngredients: string[];
  onRemoveIngredient: (id: string) => void;
  onClear: () => void;
  onCreateRecipe: (recipeName: string) => void;
}

export function RecipeBasket({ 
  selectedIngredients, 
  onRemoveIngredient, 
  onClear,
  onCreateRecipe
}: RecipeBasketProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipeName, setRecipeName] = useState('');

  const ingredientsList = selectedIngredients
    .map(id => ingredients.find(ing => ing.id === id))
    .filter(Boolean);

  const handleCreateRecipe = () => {
    if (recipeName.trim() && selectedIngredients.length > 0) {
      onCreateRecipe(recipeName);
      setRecipeName('');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Basket Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-br from-[#FF9900] to-[#FFB340] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all p-5"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingBasket className="w-7 h-7" />
          
          {/* Badge Count */}
          {selectedIngredients.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg"
            >
              {selectedIngredients.length}
            </motion.div>
          )}

          {/* Pulsing ring when items in basket */}
          {selectedIngredients.length > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#FF9900]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Basket Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#FFF5E6] to-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9900] to-[#FFB340] flex items-center justify-center">
                      <ShoppingBasket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl text-gray-900">Panier de Recette</h2>
                      <p className="text-xs text-gray-500">
                        {selectedIngredients.length} ingrédient{selectedIngredients.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {selectedIngredients.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-xs text-gray-500 hover:text-gray-900 mt-2"
                  >
                    Vider le panier
                  </Button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedIngredients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                      <ShoppingBasket className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1">Panier vide</p>
                      <p className="text-sm text-gray-500">
                        Ajoutez des ingrédients depuis l'épicerie
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ingredientsList.map((ingredient, index) => (
                      <motion.div
                        key={ingredient.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-3 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 flex-shrink-0">
                              {ingredient.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">{ingredient.name}</p>
                              <p className="text-xs text-gray-500">{ingredient.id}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveIngredient(ingredient.id)}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Create Recipe */}
              {selectedIngredients.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-[#FFF5E6] to-white space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Nom de votre recette</label>
                    <Input
                      placeholder="Ex: Portefeuille Équilibré..."
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      className="border-gray-300 focus:border-[#FF9900]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateRecipe();
                      }}
                    />
                  </div>

                  <Button
                    onClick={handleCreateRecipe}
                    disabled={!recipeName.trim()}
                    className="w-full bg-gradient-to-r from-[#FF9900] to-[#FFB340] hover:from-[#FF8800] hover:to-[#FFA030] text-white"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Créer ma recette
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="flex items-start gap-2 bg-[#E6F7F7] rounded-lg p-3">
                    <Sparkles className="w-4 h-4 text-[#2D9596] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700">
                      Vous pourrez ajuster les proportions de chaque ingrédient après la création
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
