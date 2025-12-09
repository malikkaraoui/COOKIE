import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Award, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download, 
  Play,
  Trophy,
  TrendingUp,
  Target
} from 'lucide-react';

interface MemberSpaceProps {
  isMobile?: boolean;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

export function MemberSpace({ 
  isMobile = false, 
  breakpoint = 'desktop' 
}: MemberSpaceProps) {
  const userProgress = {
    totalModules: 32,
    completedModules: 8,
    inProgressModules: 3,
    totalHours: 156,
    completedHours: 45,
    certificates: 3,
    nextCertificate: "Chef Crypto Master"
  };

  const recentModules = [
    {
      id: 1,
      title: "Le Soufflé à Haut Rendement",
      category: "Recettes Risquées",
      completedAt: "2025-01-20",
      progress: 100,
      duration: "30 jours",
      status: "completed"
    },
    {
      id: 2,
      title: "La Ratatouille Équilibrée",
      category: "Recettes Équilibrées",
      completedAt: null,
      progress: 65,
      duration: "90 jours",
      status: "in-progress"
    },
    {
      id: 3,
      title: "Le Carpaccio d'Altcoins",
      category: "Tendances",
      completedAt: "2025-01-18",
      progress: 100,
      duration: "4h 15min",
      status: "completed"
    }
  ];

  const certificates = [
    {
      id: 1,
      title: "Expert E-commerce",
      earnedAt: "2025-01-15",
      modules: 6,
      badge: "🏆"
    },
    {
      id: 2,
      title: "Maître SEO",
      earnedAt: "2025-01-10",
      modules: 4,
      badge: "🎯"
    },
    {
      id: 3,
      title: "Copywriter Certifié",
      earnedAt: "2025-01-05",
      modules: 5,
      badge: "✍️"
    }
  ];

  const upcomingCertificates = [
    {
      id: 4,
      title: "IA Marketing Expert",
      requiredModules: 8,
      completedModules: 3,
      badge: "🤖"
    },
    {
      id: 5,
      title: "Branding Specialist",
      requiredModules: 6,
      completedModules: 2,
      badge: "🎨"
    }
  ];

  const getGridCols = () => {
    switch (breakpoint) {
      case 'mobile':
        return 'grid-cols-1 sm:grid-cols-2';
      case 'tablet':
        return 'grid-cols-2 md:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-4';
    }
  };

  const getSpacing = () => {
    switch (breakpoint) {
      case 'mobile':
        return { container: 'space-y-4', grid: 'gap-4' };
      case 'tablet':
        return { container: 'space-y-5', grid: 'gap-5' };
      default:
        return { container: 'space-y-6', grid: 'gap-6' };
    }
  };

  const spacing = getSpacing();

  return (
    <div className={spacing.container}>
      {/* En-tête avec statistiques */}
      <div className={`grid ${getGridCols()} ${spacing.grid}`}>
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl text-white mb-1">
              {Math.round((userProgress.completedModules / userProgress.totalModules) * 100)}%
            </div>
            <p className="text-gray-300 text-sm">Progression globale</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-400/20 to-cyan-500/20 border-cyan-400/30">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl text-white mb-1">
              {userProgress.completedModules}/{userProgress.totalModules}
            </div>
            <p className="text-gray-300 text-sm">Modules terminés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl text-white mb-1">
              {userProgress.completedHours}h
            </div>
            <p className="text-gray-300 text-sm">Temps d'apprentissage</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl text-white mb-1">
              {userProgress.certificates}
            </div>
            <p className="text-gray-300 text-sm">Certificats obtenus</p>
          </CardContent>
        </Card>
      </div>

      <div className={`grid ${
        isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
      } ${spacing.grid}`}>
        {/* Modules récents */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Mes modules récents</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Voir tout
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentModules.map((module) => (
              <div key={module.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white">{module.title}</h4>
                    <p className="text-gray-400 text-sm">{module.category}</p>
                  </div>
                  <Badge 
                    className={
                      module.status === 'completed' 
                        ? 'bg-green-500 text-white'
                        : 'bg-cyan-400 text-white'
                    }
                  >
                    {module.status === 'completed' ? 'Terminé' : 'En cours'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2 bg-gray-600" />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-400 text-sm">{module.duration}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-600"
                  >
                    {module.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Revoir
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Continuer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certificats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Mes certificats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Certificats obtenus */}
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-4 bg-gradient-to-r from-yellow-500/10 to-cyan-400/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{cert.badge}</div>
                      <div>
                        <h4 className="text-white">{cert.title}</h4>
                        <p className="text-gray-400 text-sm">
                          {cert.modules} modules • {cert.earnedAt}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Certificats à débloquer */}
            <div className="pt-4 border-t border-gray-700">
              <h5 className="text-gray-300 mb-3">À débloquer</h5>
              <div className="space-y-3">
                {upcomingCertificates.map((cert) => (
                  <div key={cert.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl opacity-50">{cert.badge}</div>
                      <div>
                        <h4 className="text-gray-300">{cert.title}</h4>
                        <p className="text-gray-500 text-sm">
                          {cert.completedModules}/{cert.requiredModules} modules complétés
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={(cert.completedModules / cert.requiredModules) * 100} 
                      className="h-2 bg-gray-600" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectif suivant */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-white">Prochain objectif</h3>
                <p className="text-gray-300">
                  Plus que 5 modules pour débloquer le certificat "{userProgress.nextCertificate}"
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
              Voir les modules
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}