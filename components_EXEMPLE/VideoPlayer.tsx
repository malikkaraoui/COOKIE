import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { 
  Play, 
  Pause,
  ArrowLeft, 
  ArrowRight,
  Volume2,
  Settings,
  Maximize,
  CheckCircle,
  Clock,
  FileText,
  Download,
  BookOpen,
  Star
} from 'lucide-react';

interface VideoPlayerProps {
  moduleId: string;
  lessonId: string;
  onBack: () => void;
  onLessonChange: (lessonId: string) => void;
}

export function VideoPlayer({ moduleId, lessonId, onBack, onLessonChange }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(245); // 4:05
  const [notes, setNotes] = useState('');
  const [isNotesVisible, setIsNotesVisible] = useState(false);

  // Mock data - en réalité cela viendrait d'une API
  const moduleData = {
    id: moduleId,
    title: "IA Marketing Avancé",
    subtitle: "Étape 1 – InstaMachine",
    lessons: [
      { 
        id: '1', 
        title: "Introduction à l'IA Marketing", 
        duration: 900, // 15 min en secondes
        type: "video",
        completed: true,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      },
      { 
        id: '2', 
        title: "Configuration d'InstaMachine", 
        duration: 1500, // 25 min
        type: "video",
        completed: true,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      },
      { 
        id: '3', 
        title: "Création de templates automatisés", 
        duration: 2100, // 35 min
        type: "video",
        completed: false,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      },
      { 
        id: '4', 
        title: "Optimisation des performances", 
        duration: 1200, // 20 min
        type: "video",
        completed: false,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      { 
        id: '5', 
        title: "Cas pratiques et études", 
        duration: 1800, // 30 min
        type: "video",
        completed: false,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      },
      { 
        id: '6', 
        title: "Templates prêts à l'emploi", 
        duration: 0,
        type: "resource",
        completed: false
      },
      { 
        id: '7', 
        title: "Guide de configuration PDF", 
        duration: 0,
        type: "pdf",
        completed: false
      }
    ]
  };

  const currentLesson = moduleData.lessons.find(lesson => lesson.id === lessonId);
  const currentLessonIndex = moduleData.lessons.findIndex(lesson => lesson.id === lessonId);
  const nextLesson = moduleData.lessons[currentLessonIndex + 1];
  const previousLesson = moduleData.lessons[currentLessonIndex - 1];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4 text-gray-400" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'resource':
        return <Download className="w-4 h-4 text-gray-400" />;
      default:
        return <Play className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedLessons = moduleData.lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / moduleData.lessons.length) * 100;

  return (
    <div className="h-full flex">
      {/* Zone vidéo principale */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au module
            </Button>
            <div>
              <h1 className="text-white text-lg">{currentLesson?.title}</h1>
              <p className="text-gray-400 text-sm">{moduleData.title}</p>
            </div>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Leçon {currentLessonIndex + 1} sur {moduleData.lessons.length}
          </Badge>
        </div>

        {/* Lecteur vidéo */}
        <div className="flex-1 bg-black relative">
          {currentLesson?.type === 'video' ? (
            <>
              {/* Placeholder pour la vidéo */}
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </div>
                  <p className="text-white mb-2">{currentLesson.title}</p>
                  <p className="text-gray-400">Durée: {formatTime(currentLesson.duration)}</p>
                </div>
              </div>
              
              {/* Contrôles vidéo */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <Progress 
                      value={(currentTime / currentLesson.duration) * 100} 
                      className="h-1 bg-gray-600"
                    />
                  </div>
                  
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(currentLesson.duration)}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center">
              <div className="text-center">
                {currentLesson?.type === 'pdf' ? (
                  <FileText className="w-20 h-20 text-blue-400 mx-auto mb-4" />
                ) : (
                  <Download className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
                )}
                <h3 className="text-white text-xl mb-2">{currentLesson?.title}</h3>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger la ressource
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation et notes */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline"
              disabled={!previousLesson}
              onClick={() => previousLesson && onLessonChange(previousLesson.id)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsNotesVisible(!isNotesVisible)}
              className="text-gray-400 hover:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {isNotesVisible ? 'Masquer les notes' : 'Prendre des notes'}
            </Button>

            <Button 
              variant="default"
              disabled={!nextLesson}
              onClick={() => nextLesson && onLessonChange(nextLesson.id)}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 disabled:opacity-50"
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {isNotesVisible && (
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Mes notes pour cette leçon :</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tapez vos notes ici..."
                className="bg-gray-800 border-gray-700 text-white"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar des leçons */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white mb-2">Contenu du module</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progression</span>
              <span className="text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-gray-700" />
            <p className="text-gray-400 text-xs">
              {completedLessons} sur {moduleData.lessons.length} leçons terminées
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {moduleData.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => onLessonChange(lesson.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                lesson.id === lessonId
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-blue-500/30'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-300 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getLessonIcon(lesson.type, lesson.completed)}
                    <h4 className={`text-sm ${lesson.id === lessonId ? 'text-white' : 'text-gray-300'}`}>
                      {lesson.title}
                    </h4>
                  </div>
                  {lesson.duration > 0 && (
                    <p className="text-gray-500 text-xs">
                      {formatTime(lesson.duration)}
                    </p>
                  )}
                  {lesson.completed && (
                    <div className="flex items-center space-x-1 mt-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-500 text-xs">Terminé</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
          >
            <Star className="w-4 h-4 mr-2" />
            Marquer comme terminé
          </Button>
        </div>
      </div>
    </div>
  );
}