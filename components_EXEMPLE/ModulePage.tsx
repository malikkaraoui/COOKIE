import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ArrowLeft,
  Play, 
  Clock, 
  Users,
  Video,
  CheckCircle,
  Star,
  BookOpen,
  Award,
  Target
} from 'lucide-react';

interface ModulePageProps {
  moduleId: string;
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
  isMobile?: boolean;
}

// Import des données détaillées
import { detailedModules } from '../data/modulesData';

export function ModulePage({ moduleId, onBack, onStartLesson, isMobile = false }: ModulePageProps) {
  const module = detailedModules.find(m => m.id === moduleId);

  if (!module) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl text-white mb-4">Module non trouvé</h2>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Confirmé':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Expert':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* Header Navigation */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-400 hover:text-white mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux modules
        </Button>
      </div>

      {/* Module Hero Section */}
      <Card className="bg-gray-800 border-gray-700 overflow-hidden">
        <div className={`${isMobile ? 'block' : 'md:flex'}`}>
          {/* Image */}
          <div className={`${isMobile ? 'h-48' : 'md:w-1/2 md:h-80'} relative overflow-hidden`}>
            <ImageWithFallback
              src={module.thumbnail}
              alt={module.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-400/30" />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-20 h-20 p-0 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                onClick={() => onStartLesson(module.lessons[0].id)}
              >
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className={`${isMobile ? 'p-6' : 'md:w-1/2 p-8'}`}>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline" className={`${getLevelColor(module.level)} border text-sm`}>
                {module.level}
              </Badge>
              <Badge className="bg-blue-500 text-white text-sm">
                {module.category.toUpperCase()}
              </Badge>
            </div>

            <h1 className={`text-white mb-3 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
              {module.title}
            </h1>
            <p className={`text-gray-300 mb-6 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {module.subtitle}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-400">
                <Video className="w-5 h-5 mr-2" />
                <span className="text-sm">{module.lessonsCount} leçons</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm">{module.duration}</span>
              </div>
            </div>

            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 shadow-lg hover:shadow-blue-500/25"
            >
              Débloquer - 250€
            </Button>
          </div>
        </div>
      </Card>

      <div className={`${isMobile ? 'block space-y-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
        {/* Main Content */}
        <div className={`${isMobile ? '' : 'lg:col-span-2'} space-y-6`}>
          {/* Description */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-xl text-white flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
                Description du module
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">{module.description}</p>
              
              <h4 className="text-lg text-white mb-4">Ce que vous allez apprendre :</h4>
              <ul className="space-y-3">
                {module.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-xl text-white flex items-center">
                <Video className="w-6 h-6 mr-3 text-blue-400" />
                Contenu du cours ({module.lessonsCount} leçons)
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {module.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => onStartLesson(lesson.id)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-400 text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-white text-sm">{lesson.title}</h4>
                        <p className="text-gray-400 text-xs">{lesson.duration}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-lg text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Votre formateur
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <ImageWithFallback
                  src={module.instructor.avatar}
                  alt={module.instructor.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-white">{module.instructor.name}</h4>
                  <p className="text-gray-400 text-sm">{module.instructor.title}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{module.instructor.experience}</p>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-lg text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-400" />
                Détails du cours
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Niveau</span>
                <Badge variant="outline" className={`${getLevelColor(module.level)} border text-xs`}>
                  {module.level}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Durée totale</span>
                <span className="text-white">{module.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre de leçons</span>
                <span className="text-white">{module.lessonsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accès</span>
                <span className="text-green-400">Illimité</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Certificat</span>
                <span className="text-green-400">Inclus</span>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">Prêt à commencer ?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Débloquez ce module et commencez votre apprentissage dès maintenant
              </p>
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
              >
                Débloquer - 250€
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}