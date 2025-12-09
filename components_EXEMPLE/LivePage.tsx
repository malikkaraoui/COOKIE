import React, { useState } from 'react';
import { LiveZoomBlock } from './LiveZoomBlock';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Radio, 
  Calendar, 
  Clock, 
  Users, 
  Play,
  Pause,
  Volume2,
  Settings,
  ExternalLink,
  Bell,
  BellRing
} from 'lucide-react';

interface LivePageProps {
  liveSession?: any;
  isLiveActive?: boolean;
  isMobile?: boolean;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

export function LivePage({ 
  liveSession, 
  isLiveActive = false,
  isMobile = false,
  breakpoint = 'desktop'
}: LivePageProps) {
  const [notifications, setNotifications] = useState(true);

  const upcomingLives = [
    {
      id: '2',
      title: 'Masterclass SEO Avancé',
      description: 'Techniques avancées pour dominer les résultats Google',
      date: '2025-01-26',
      time: '20:00',
      duration: '120 min',
      instructor: 'Expert SEO',
      maxParticipants: 300
    },
    {
      id: '3',
      title: 'Workshop E-commerce 2025',
      description: 'Les tendances e-commerce qui vont exploser en 2025',
      date: '2025-01-28',
      time: '19:30',
      duration: '90 min',
      instructor: 'Pro E-commerce',
      maxParticipants: 200
    }
  ];

  const pastLives = [
    {
      id: '4',
      title: 'IA & Marketing Automation',
      description: 'Comment automatiser votre marketing avec l\'IA',
      date: '2025-01-20',
      duration: '105 min',
      viewers: 347,
      recording: 'https://example.com/recording'
    },
    {
      id: '5',
      title: 'Copywriting Persuasif',
      description: 'Les secrets du copywriting qui convertit',
      date: '2025-01-18',
      duration: '95 min',
      viewers: 289,
      recording: 'https://example.com/recording'
    }
  ];

  const getSpacing = () => {
    switch (breakpoint) {
      case 'mobile':
        return { container: 'space-y-4', section: 'space-y-3' };
      case 'tablet':
        return { container: 'space-y-5', section: 'space-y-4' };
      default:
        return { container: 'space-y-6', section: 'space-y-4' };
    }
  };

  const spacing = getSpacing();

  return (
    <div className={spacing.container}>
      {/* Header de la page Live */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-white font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            🔴 Lives & Sessions
          </h1>
          <p className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Participez aux sessions live et accédez aux replays
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => setNotifications(!notifications)}
            className={`border-gray-600 ${
              notifications 
                ? 'text-blue-400 border-blue-500/50 bg-blue-500/10' 
                : 'text-gray-400'
            }`}
          >
            {notifications ? <BellRing className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
            {isMobile ? 'Notifs' : 'Notifications'}
          </Button>
          
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            {!isMobile && 'Paramètres'}
          </Button>
        </div>
      </div>

      {/* Live en cours */}
      {isLiveActive && liveSession && (
        <div className={spacing.section}>
          <LiveZoomBlock 
            liveSession={liveSession}
            isVisible={true}
            isMobile={isMobile}
            breakpoint={breakpoint}
          />
        </div>
      )}

      {/* Message si pas de live actif */}
      {!isLiveActive && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <Radio className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Aucun live en cours</h3>
                <p className="text-gray-400 text-sm">
                  Le prochain live commence bientôt. Consultez le planning ci-dessous.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planning des prochains lives */}
      <div className={spacing.section}>
        <h2 className={`text-white font-semibold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          📅 Prochains Lives
        </h2>
        
        <div className={`grid gap-4 ${
          isMobile ? 'grid-cols-1' : breakpoint === 'tablet' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {upcomingLives.map((live) => (
            <Card key={live.id} className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors">
              <CardHeader className={isMobile ? 'p-4' : 'p-5'}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                      {live.title}
                    </CardTitle>
                    <p className={`text-gray-400 mt-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                      {live.description}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-blue-500/10 text-blue-400 border-blue-500/30 ml-3"
                  >
                    À venir
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className={`${isMobile ? 'p-4 pt-0' : 'p-5 pt-0'} space-y-3`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                    {new Date(live.date).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-green-400" />
                    {live.time}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Play className="w-4 h-4 mr-2 text-purple-400" />
                    {live.duration}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Users className="w-4 h-4 mr-2 text-orange-400" />
                    {live.maxParticipants} places
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400 text-sm">
                    Par {live.instructor}
                  </span>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isMobile ? 'Rappel' : 'Me rappeler'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Replays disponibles */}
      <div className={spacing.section}>
        <h2 className={`text-white font-semibold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          🎬 Replays Disponibles
        </h2>
        
        <div className={`grid gap-4 ${
          isMobile ? 'grid-cols-1' : breakpoint === 'tablet' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {pastLives.map((live) => (
            <Card key={live.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader className={isMobile ? 'p-4' : 'p-5'}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                      {live.title}
                    </CardTitle>
                    <p className={`text-gray-400 mt-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                      {live.description}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-gray-600/20 text-gray-400 border-gray-600/30 ml-3"
                  >
                    Replay
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className={`${isMobile ? 'p-4 pt-0' : 'p-5 pt-0'} space-y-3`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(live.date).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Play className="w-4 h-4 mr-2 text-gray-400" />
                    {live.duration}
                  </div>
                  <div className="flex items-center text-gray-300" colSpan={2}>
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {live.viewers} participants
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500 text-sm">
                    Replay disponible
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(live.recording, '_blank')}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isMobile ? 'Voir' : 'Regarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Informations complémentaires */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">
                💡 Comment participer aux lives ?
              </h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Activez les notifications pour ne pas rater les sessions</li>
                <li>• Rejoignez directement depuis cette page ou via Zoom</li>
                <li>• Posez vos questions en direct dans le chat</li>
                <li>• Tous les replays sont automatiquement sauvegardés</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}