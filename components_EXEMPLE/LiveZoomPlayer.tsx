import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Radio, 
  Clock, 
  Users, 
  Play,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  zoomUrl: string;
  startDate: string;
  duration: number; // en minutes
  isActive: boolean;
  maxParticipants?: number;
  instructor?: string;
}

interface LiveZoomPlayerProps {
  liveSession?: LiveSession | null;
}

export function LiveZoomPlayer({ liveSession }: LiveZoomPlayerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const [isLive, setIsLive] = useState(false);

  // Mock live session pour démonstration
  const mockLiveSession: LiveSession = {
    id: '1',
    title: 'Masterclass IA & E-commerce',
    description: 'Découvrez comment utiliser l\'IA pour booster vos ventes e-commerce',
    zoomUrl: 'https://zoom.us/j/123456789',
    startDate: '2025-01-25T20:00:00Z',
    duration: 90,
    isActive: true,
    maxParticipants: 500,
    instructor: 'Expert START'
  };

  const currentSession = liveSession || mockLiveSession;

  useEffect(() => {
    if (!currentSession) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startTime = new Date(currentSession.startDate).getTime();
      const difference = startTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsLive(false);
      } else {
        // Le live a commencé
        setIsLive(currentSession.isActive);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getZoomEmbedUrl = (zoomUrl: string) => {
    // Convertir l'URL Zoom normale en URL embed
    const meetingId = zoomUrl.split('/j/')[1]?.split('?')[0];
    return `https://zoom.us/wc/${meetingId}/join`;
  };

  if (!currentSession) {
    return null;
  }

  const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 overflow-hidden">
        <CardContent className="p-0">
          {/* Header du live */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Radio className={`w-6 h-6 ${isLive ? 'text-red-500' : 'text-gray-400'}`} />
                  {isLive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl text-white font-bold">{currentSession.title}</h2>
                  <p className="text-gray-400 text-lg">{currentSession.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isLive ? (
                  <Badge className="bg-red-500 text-white px-3 py-1 text-sm animate-pulse">
                    🔴 LIVE EN COURS
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500 text-white px-3 py-1 text-sm">
                    📅 À VENIR
                  </Badge>
                )}
                
                {currentSession.maxParticipants && (
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Max {currentSession.maxParticipants}</span>
                  </div>
                )}
              </div>
            </div>
            
            {currentSession.instructor && (
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="text-sm">Animé par :</span>
                <span className="text-sm font-medium text-blue-400">{currentSession.instructor}</span>
              </div>
            )}
          </div>

          {/* Zone principale du player */}
          <div className="relative">
            {isLive ? (
              // Player Zoom intégré
              <div className="relative bg-black">
                <div className="aspect-video w-full max-w-4xl mx-auto">
                  <iframe
                    src={getZoomEmbedUrl(currentSession.zoomUrl)}
                    className="w-full h-full"
                    allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                    allowFullScreen
                    title="Live Zoom Session"
                  />
                </div>
                
                {/* Overlay avec bouton de participation */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 text-lg font-semibold px-8 py-4 h-auto"
                    onClick={() => window.open(currentSession.zoomUrl, '_blank')}
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Rejoindre le live maintenant
                    <ExternalLink className="w-5 h-5 ml-3" />
                  </Button>
                </div>
              </div>
            ) : (
              // Écran d'attente avec compte à rebours
              <div className="aspect-video w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                    <Calendar className="w-16 h-16 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl text-white font-bold mb-2">Live à venir</h3>
                    <p className="text-gray-400 text-lg">
                      Démarrage prévu le {formatDate(currentSession.startDate)}
                    </p>
                  </div>

                  {hasTimeLeft && (
                    <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300 text-lg">Temps restant :</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-3xl font-bold text-white">{timeLeft.days}</div>
                          <div className="text-sm text-gray-400">Jours</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-3xl font-bold text-white">{timeLeft.hours}</div>
                          <div className="text-sm text-gray-400">Heures</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-3xl font-bold text-white">{timeLeft.minutes}</div>
                          <div className="text-sm text-gray-400">Minutes</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-3xl font-bold text-white">{timeLeft.seconds}</div>
                          <div className="text-sm text-gray-400">Secondes</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-lg font-medium px-8 py-3 h-auto"
                    onClick={() => {
                      // Ajouter à un calendrier ou notification
                      alert('Notification programmée ! Vous serez alerté avant le début du live.');
                    }}
                  >
                    <Clock className="w-5 h-5 mr-3" />
                    Me notifier avant le début
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Informations complémentaires */}
          <div className="p-6 bg-gray-800/50 border-t border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Durée : {currentSession.duration} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(currentSession.startDate)}</span>
                </div>
              </div>
              
              {!isLive && (
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 font-medium"
                  onClick={() => window.open(currentSession.zoomUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Préparer l'accès Zoom
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}