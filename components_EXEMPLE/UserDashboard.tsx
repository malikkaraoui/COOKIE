import React from 'react';
import { ModuleCard } from './ModuleCard';
import { MemberSpace } from './MemberSpace';
import { CATEGORY_TITLES, CategoryKey } from '../constants/categories';

interface UserDashboardProps {
  activeCategory: string;
  modules: any[];
  onModuleClick: (moduleId: string) => void;
  isMobile?: boolean;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

export function UserDashboard({ 
  activeCategory, 
  modules, 
  onModuleClick, 
  isMobile = false,
  breakpoint = 'desktop'
}: UserDashboardProps) {
  const filteredModules = activeCategory === 'dashboard' 
    ? modules 
    : modules.filter(module => module.category === activeCategory);

  const getGridCols = () => {
    switch (breakpoint) {
      case 'mobile':
        return 'grid-cols-1';
      case 'tablet':
        return 'grid-cols-1 sm:grid-cols-2';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const getSpacing = () => {
    switch (breakpoint) {
      case 'mobile':
        return { container: 'space-y-4', grid: 'gap-4', section: 'mt-6' };
      case 'tablet':
        return { container: 'space-y-5', grid: 'gap-5', section: 'mt-7' };
      default:
        return { container: 'space-y-6', grid: 'gap-6', section: 'mt-8' };
    }
  };

  const spacing = getSpacing();

  if (activeCategory === 'dashboard') {
    return (
      <div className={spacing.container}>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#FF9900]/10 to-[#2D9596]/10 border border-[#FF9900]/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Bienvenue dans votre Laboratoire 👨‍🍳
              </h1>
              <p className="text-gray-400">
                Créez, partagez et découvrez des recettes financières uniques
              </p>
            </div>
          </div>
        </div>

        {/* Toutes les recettes */}
        <div>
          <h2 className={`text-white mb-4 font-semibold ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            🔥 Recettes Populaires
          </h2>
          <div className={`grid ${getGridCols()} ${spacing.grid}`}>
            {modules.map((module) => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                onModuleClick={onModuleClick}
                isMobile={isMobile}
                breakpoint={breakpoint}
              />
            ))}
          </div>
        </div>

        {/* Espace membre */}
        <div className={spacing.section}>
          <h2 className={`text-white mb-4 font-semibold ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            Mon Espace Chef
          </h2>
          <MemberSpace 
            isMobile={isMobile}
            breakpoint={breakpoint}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={spacing.container}>
      <div>
        <h2 className={`text-white mb-4 font-semibold ${
          isMobile ? 'text-lg' : 'text-xl'
        }`}>
          {CATEGORY_TITLES[activeCategory as CategoryKey] || 'Modules'}
        </h2>
        <div className={`grid ${getGridCols()} ${spacing.grid}`}>
          {filteredModules.map((module) => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              onModuleClick={onModuleClick}
              isMobile={isMobile}
              breakpoint={breakpoint}
            />
          ))}
        </div>
      </div>
    </div>
  );
}