import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Clock, 
  Star,
  Users,
  ChefHat,
  Copy,
  TrendingUp,
  Flame,
  Shield
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: 'Débutant' | 'Confirmé' | 'Expert';
  status: 'unlocked' | 'in-progress' | 'locked' | 'completed';
  progress?: number;
  price?: number;
  lessonsCount: number;
  duration: string;
  thumbnail: string;
  isPromoted?: boolean;
  promotedBy?: string;
  stars?: number;
  risk?: string;
  ingredients?: string[];
  returnPotential?: string;
  chefRating?: number;
  copiedBy?: number;
}

interface ModuleCardProps {
  module: Module;
  onModuleClick: (moduleId: string) => void;
  isMobile?: boolean;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

export function ModuleCard({ 
  module, 
  onModuleClick, 
  isMobile = false, 
  breakpoint = 'desktop' 
}: ModuleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-[#2D9596] text-white';
      case 'unlocked':
        return 'bg-[#FF9900] text-black';
      case 'locked':
        return 'bg-gray-600 text-gray-300';
      default:
        return 'bg-gray-600 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Cuisiné';
      case 'in-progress':
        return 'En préparation';
      case 'unlocked':
        return 'Disponible';
      case 'locked':
        return 'Verrouillé';
      default:
        return 'Verrouillé';
    }
  };

  const getRiskColor = (risk: string | undefined) => {
    switch (risk) {
      case 'Faible':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Modéré':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Élevé':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Très Élevé':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskIcon = (risk: string | undefined) => {
    switch (risk) {
      case 'Faible':
        return <Shield className="w-3 h-3" />;
      case 'Modéré':
        return <TrendingUp className="w-3 h-3" />;
      case 'Élevé':
      case 'Très Élevé':
        return <Flame className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'unlocked':
        return <ChefHat className="w-4 h-4" />;
      case 'locked':
        return <Lock className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-gray-600'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card 
      className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#FF9900]/50 transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={() => onModuleClick(module.id)}
    >
      {/* Thumbnail */}
      <div className={`relative overflow-hidden ${
        isMobile ? 'h-40' : breakpoint === 'tablet' ? 'h-44' : 'h-48'
      }`}>
        <ImageWithFallback
          src={module.thumbnail}
          alt={module.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 group-hover:brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9900]/20 to-[#2D9596]/20 group-hover:from-[#FF9900]/30 group-hover:to-[#2D9596]/30 transition-all duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer blur effect */}
            <div className="absolute inset-0 w-20 h-20 bg-[#FF9900]/20 rounded-full blur-sm animate-pulse group-hover:bg-[#FF9900]/30 transition-all duration-300"></div>
            
            {/* Glass button with glassmorphism effect */}
            <div className="relative w-20 h-20 bg-white/10 backdrop-blur-md border border-[#FF9900]/40 rounded-full flex items-center justify-center group-hover:scale-105 group-hover:bg-white/15 group-hover:border-[#FF9900]/60 transition-all duration-300 shadow-2xl">
              {/* Inner glass effect */}
              <div className="absolute inset-1 bg-gradient-to-br from-[#FF9900]/30 via-white/5 to-transparent rounded-full"></div>
              
              {/* Play icon */}
              <ChefHat className="relative w-8 h-8 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
              
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              
              {/* Border highlight */}
              <div className="absolute inset-0 rounded-full ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300"></div>
            </div>
          </div>
        </div>
        
        {/* Badges overlay */}
        <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-3 left-3'} flex flex-wrap gap-2`}>
          <Badge className={`${getStatusColor(module.status)} ${isMobile ? 'text-xs px-2 py-1' : 'text-xs'}`}>
            {getStatusIcon(module.status)}
            <span className="ml-1">{getStatusText(module.status)}</span>
          </Badge>
          {module.risk && (
            <Badge variant="outline" className={`${getRiskColor(module.risk)} ${isMobile ? 'text-xs px-2 py-1' : 'text-xs'} border`}>
              {getRiskIcon(module.risk)}
              <span className="ml-1">{module.risk}</span>
            </Badge>
          )}
        </div>

        {/* Stars rating */}
        {module.stars && (
          <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-3 right-3'}`}>
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              {renderStars(module.stars)}
              <span className="text-white text-xs ml-1">{module.stars}</span>
            </div>
          </div>
        )}
      </div>

      <CardHeader className={`${isMobile ? 'pb-2 p-4' : 'pb-3'}`}>
        <div className={`${isMobile ? 'space-y-1' : 'space-y-2'}`}>
          <h3 className={`text-white group-hover:text-[#FF9900] transition-colors ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            {module.title}
          </h3>
          <p className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {module.subtitle}
          </p>
          
          {module.isPromoted && module.promotedBy && (
            <div className="flex items-center gap-1">
              <ChefHat className="w-3 h-3 text-[#FF9900]" />
              <p className={`text-[#FF9900] ${isMobile ? 'text-xs' : 'text-xs'}`}>
                Par Chef {module.promotedBy}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={`${isMobile ? 'space-y-3 p-4 pt-0' : 'space-y-4'}`}>
        {/* Progress for in-progress modules */}
        {module.status === 'in-progress' && module.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Préparation</span>
              <span className="text-white">{module.progress}%</span>
            </div>
            <Progress value={module.progress} className="h-1 bg-gray-700" />
          </div>
        )}

        {/* Ingredients preview */}
        {module.ingredients && module.ingredients.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Ingrédients:</p>
            <div className="flex flex-wrap gap-1">
              {module.ingredients.slice(0, 3).map((ingredient, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-[#2D9596]/10 text-[#2D9596] border-[#2D9596]/30">
                  {ingredient}
                </Badge>
              ))}
              {module.ingredients.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-800 text-gray-400 border-gray-700">
                  +{module.ingredients.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Return potential */}
        {module.returnPotential && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Rendement potentiel:</span>
            <span className="text-green-400 font-semibold">{module.returnPotential}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {module.duration}
            </span>
            {module.copiedBy && (
              <span className="flex items-center text-[#2D9596]">
                <Copy className="w-4 h-4 mr-1" />
                {module.copiedBy}
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <Button 
          variant="default"
          size={isMobile ? 'sm' : 'default'}
          className={`w-full cookie-btn-primary shadow-lg hover:shadow-[#FF9900]/25 transition-all duration-300 ${isMobile ? 'text-sm h-9' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onModuleClick(module.id);
          }}
        >
          {module.status === 'unlocked' ? '👨‍🍳 Cuisiner cette recette' : 'Débloquer - 250€'}
        </Button>
      </CardContent>
    </Card>
  );
}
