import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Play, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  Gift,
  Video,
  FileText,
  Download
} from 'lucide-react';

interface ModuleDetailsProps {
  moduleId: string;
  onBack: () => void;
  onLessonStart?: (moduleId: string, lessonId: string) => void;
}

export function ModuleDetails({ moduleId, onBack, onLessonStart }: ModuleDetailsProps) {
  // Mock data - en réalité cela viendrait d'une API
  const moduleData = {
    id: moduleId,
    title: "IA Marketing Avancé",
    subtitle: "Étape 1 – InstaMachine",
    price: 250,
    category: "Intelligence Artificielle",
    level: "Confirmé",
    duration: "4h 30min",
    studentsCount: 1247,
    rating: 4.8,
    isPromoted: true,
    promotedBy: "Alex Digital",
    description: "Maîtrisez l'intelligence artificielle pour créer des campagnes marketing ultra-performantes. Automatisez vos contenus Instagram et boostez votre engagement.",
    videoThumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    lessons: [
      { id: '1', title: "Introduction à l'IA Marketing", duration: "15 min", type: "video", completed: false },
      { id: '2', title: "Configuration d'InstaMachine", duration: "25 min", type: "video", completed: false },
      { id: '3', title: "Création de templates automatisés", duration: "35 min", type: "video", completed: false },
      { id: '4', title: "Optimisation des performances", duration: "20 min", type: "video", completed: false },
      { id: '5', title: "Cas pratiques et études", duration: "30 min", type: "video", completed: false },
      { id: '6', title: "Templates prêts à l'emploi", duration: "-", type: "resource", completed: false },
      { id: '7', title: "Guide de configuration PDF", duration: "-", type: "pdf", completed: false }
    ],
    timeline: [
      { step: 1, title: "InstaMachine", status: "current", description: "Automatisation Instagram" },
      { step: 2, title: "TikTok AI", status: "locked", description: "Intelligence TikTok" },
      { step: 3, title: "YouTube Booster", status: "locked", description: "Optimisation YouTube" }
    ]
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'resource':
        return <Download className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const handleLessonClick = (lesson: any) => {
    if (lesson.type === 'video' && onLessonStart) {
      onLessonStart(moduleId, lesson.id);
    } else {
      // Pour les ressources et PDFs, simuler un téléchargement
      console.log(`Téléchargement de: ${lesson.title}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          {moduleData.category}
        </Badge>
      </div>

      {/* Bannière promo */}
      {moduleData.isPromoted && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-white">Module offert si recommandé par un influenceur</h3>
                  <p className="text-gray-300 text-sm">Actuellement promu par {moduleData.promotedBy}</p>
                </div>
              </div>
              <Badge className="bg-purple-500 text-white">
                -100%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vidéo de présentation */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={moduleData.videoThumbnail}
                  alt={moduleData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-400/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30"
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-white text-2xl mb-2">{moduleData.title}</h1>
                  <p className="text-gray-200">{moduleData.subtitle}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-300 mb-4">{moduleData.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {moduleData.duration}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {moduleData.studentsCount} étudiants
                  </span>
                  <span className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {moduleData.rating}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des leçons */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contenu du module</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {moduleData.lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm text-gray-300">
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      {getTypeIcon(lesson.type)}
                    </div>
                    <div>
                      <h4 className="text-white">{lesson.title}</h4>
                      {lesson.duration && (
                        <p className="text-gray-400 text-sm">{lesson.duration}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLessonClick(lesson);
                    }}
                  >
                    {lesson.type === 'video' ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec CTA */}
        <div className="space-y-6">
          {/* CTA d'achat */}
          <Card className="bg-gray-800 border-gray-700 sticky top-6">
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-center">
                <div className="text-3xl text-white mb-2">{moduleData.price}€</div>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {moduleData.level}
                </Badge>
              </div>
              
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
              >
                Débloquer ce module
              </Button>
              
              <p className="text-gray-400 text-sm">
                Accès à vie • Certificat inclus
              </p>
            </CardContent>
          </Card>

          {/* Timeline des étapes */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Parcours IA Marketing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {moduleData.timeline.map((step) => (
                <div key={step.step} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    step.status === 'current' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-400'
                  }`}>
                    {step.status === 'current' ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      step.step
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`${step.status === 'current' ? 'text-white' : 'text-gray-400'}`}>
                      {step.title}
                    </h4>
                    <p className="text-gray-500 text-sm">{step.description}</p>
                  </div>
                  {step.status === 'current' && (
                    <Badge className="bg-blue-500 text-white">Actuel</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}