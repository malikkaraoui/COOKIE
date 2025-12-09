import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  ChefHat, 
  Plus,
  Minus,
  Flame,
  Shield,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  X
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  type: 'crypto' | 'stock' | 'etf' | 'bond' | 'commodity';
  allocation: number;
}

interface RecipeBuilderProps {
  onSave?: (recipe: any) => void;
  onCancel?: () => void;
}

export function RecipeBuilder({ onSave, onCancel }: RecipeBuilderProps) {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('90');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'very-high'>('medium');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientType, setSelectedIngredientType] = useState<string>('crypto');

  const availableIngredients = {
    crypto: ['BTC', 'ETH', 'SOL', 'MATIC', 'AVAX', 'DOT', 'ATOM', 'UNI', 'AAVE', 'LINK'],
    stock: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'META', 'AMZN', 'JPM', 'JNJ', 'PG'],
    etf: ['SPY', 'QQQ', 'VTI', 'VOO', 'GLD', 'SLV', 'TLT', 'IWM', 'EEM', 'VNQ'],
    bond: ['US Treasury 10Y', 'Corporate Bonds', 'Municipal Bonds', 'High Yield'],
    commodity: ['Gold', 'Silver', 'Oil', 'Natural Gas', 'Copper']
  };

  const riskLevels = [
    { 
      id: 'low', 
      label: 'Faible', 
      icon: Shield, 
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      description: '+5% à +20%'
    },
    { 
      id: 'medium', 
      label: 'Modéré', 
      icon: Target, 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      description: '+15% à +50%'
    },
    { 
      id: 'high', 
      label: 'Élevé', 
      icon: TrendingUp, 
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      description: '+50% à +150%'
    },
    { 
      id: 'very-high', 
      label: 'Très Élevé', 
      icon: Flame, 
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      description: '+100% à +600%'
    }
  ];

  const addIngredient = (name: string, type: string) => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name,
      type: type as any,
      allocation: 10
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateAllocation = (id: string, value: number) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, allocation: Math.max(0, Math.min(100, value)) } : ing
    ));
  };

  const totalAllocation = ingredients.reduce((sum, ing) => sum + ing.allocation, 0);

  const getIngredientColor = (type: string) => {
    switch (type) {
      case 'crypto': return 'bg-[#FF9900]/20 text-[#FF9900] border-[#FF9900]/30';
      case 'stock': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'etf': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'bond': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'commodity': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF9900] to-[#FFB340] rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Nouvelle Recette</h1>
            <p className="text-gray-400 text-sm">Créez votre stratégie financière</p>
          </div>
        </div>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} className="text-gray-400">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Recipe Info */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <h2 className="text-xl text-white font-semibold">Informations de base</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Nom de la recette</label>
            <Input
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Ex: Le Soufflé Crypto Turbo"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre stratégie..."
              className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Durée (jours)
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <h2 className="text-xl text-white font-semibold">Niveau de risque</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {riskLevels.map((level) => {
              const Icon = level.icon;
              const isSelected = riskLevel === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setRiskLevel(level.id as any)}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${isSelected 
                      ? level.color + ' cookie-glow-orange' 
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? '' : 'text-gray-500'}`} />
                  <p className="font-semibold text-sm mb-1">{level.label}</p>
                  <p className="text-xs opacity-75">{level.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <h2 className="text-xl text-white font-semibold">Ingrédients (Produits financiers)</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ingredient Type Selector */}
          <div className="flex gap-2 flex-wrap">
            {Object.keys(availableIngredients).map((type) => (
              <Button
                key={type}
                variant={selectedIngredientType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIngredientType(type)}
                className={selectedIngredientType === type ? 'cookie-btn-primary' : ''}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {/* Available Ingredients */}
          <div className="flex gap-2 flex-wrap">
            {availableIngredients[selectedIngredientType as keyof typeof availableIngredients]?.map((item) => (
              <Button
                key={item}
                variant="outline"
                size="sm"
                onClick={() => addIngredient(item, selectedIngredientType)}
                className="border-gray-700 text-gray-300 hover:border-[#FF9900]/50"
              >
                <Plus className="w-3 h-3 mr-1" />
                {item}
              </Button>
            ))}
          </div>

          {/* Selected Ingredients */}
          {ingredients.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Vos Ingrédients</h3>
                <Badge className={totalAllocation === 100 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}>
                  Total: {totalAllocation}%
                </Badge>
              </div>
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getIngredientColor(ingredient.type)}>
                        {ingredient.name}
                      </Badge>
                      <span className="text-xs text-gray-500">{ingredient.type}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="text-red-400 hover:text-red-300 h-6 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAllocation(ingredient.id, ingredient.allocation - 5)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#FF9900] to-[#2D9596] h-full transition-all"
                        style={{ width: `${ingredient.allocation}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold min-w-[50px] text-center">
                      {ingredient.allocation}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAllocation(ingredient.id, ingredient.allocation + 5)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="border-gray-700">
            Annuler
          </Button>
        )}
        <Button 
          className="cookie-btn-primary"
          disabled={!recipeName || ingredients.length === 0 || totalAllocation !== 100}
          onClick={() => {
            if (onSave) {
              onSave({
                name: recipeName,
                description,
                duration,
                riskLevel,
                ingredients
              });
            }
          }}
        >
          <ChefHat className="w-4 h-4 mr-2" />
          Publier la Recette
        </Button>
      </div>
    </div>
  );
}
