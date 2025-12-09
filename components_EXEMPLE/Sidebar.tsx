import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Soup, 
  ShoppingBasket, 
  Trophy,
  ChefHat,
  Settings,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const categories = [
  { id: 'marmite', name: 'La Marmite', icon: Soup, description: 'Épargne communautaire' },
  { id: 'epicerie', name: 'Épicerie Fine', icon: ShoppingBasket, description: '30 ingrédients' },
  { id: 'populaires', name: 'Recettes Populaires', icon: Trophy, description: 'Best-of communauté' },
  { id: 'mesrecettes', name: 'Mes Recettes', icon: ChefHat, description: 'Mes créations' },
];

export function Sidebar({ 
  activeCategory, 
  onCategoryChange, 
  isMobile = false, 
  isTablet = false,
  isOpen = false,
  onClose 
}: SidebarProps) {
  
  const handleCategoryChange = (category: string) => {
    onCategoryChange(category);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={`
      w-full h-full
      bg-white border-r border-gray-200 flex flex-col
      ${isMobile ? 'shadow-2xl' : ''}
    `}>
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
          <h2 className="text-gray-900 font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 ${isMobile ? 'p-3' : 'p-4'} space-y-2 overflow-y-auto ${isMobile ? 'pt-4' : 'pt-6'}`}>
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`
                w-full flex flex-col items-start rounded-xl transition-all duration-200
                ${isMobile ? 'p-4' : 'p-4'}
                ${isActive 
                  ? 'bg-gradient-to-r from-[#FF9900] to-[#FFB340] text-white shadow-lg' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-[#FFF5E6]'
                }
                ${isMobile ? 'active:scale-95' : ''}
              `}
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} ${isActive ? 'text-white' : 'text-[#FF9900]'}`} />
                <span className="font-medium">{category.name}</span>
              </div>
              <span className={`text-xs mt-1 ml-9 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                {category.description}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-gray-200 space-y-1`}>
        <Button 
          variant="ghost" 
          className={`
            w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100
            ${isMobile ? 'p-3 text-sm h-auto' : 'text-sm'}
          `}
        >
          <Settings className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-3`} />
          Paramètres
        </Button>
        
        <Button 
          variant="ghost" 
          className={`
            w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100
            ${isMobile ? 'p-3 text-sm h-auto' : 'text-sm'}
          `}
        >
          <LogOut className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-3`} />
          Déconnexion
        </Button>

        {/* Mobile-only footer info */}
        {isMobile && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-gray-500 text-xs text-center">
              $COOKIE Platform v1.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
}