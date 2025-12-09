import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
  Users,
  Eye
} from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  subtitle: string;
  zoomUrl: string;
  embedCode?: string;
  isActive: boolean;
  conversionURL?: string;
  conversionText?: string;
  viewerCount?: number;
  autoPlay?: boolean;
}

interface LiveZoomBlockProps {
  liveSession: LiveSession | null;
  isVisible: boolean;
  isMobile?: boolean;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

export function LiveZoomBlock({ 
  liveSession, 
  isVisible, 
  isMobile = false, 
  breakpoint = 'desktop' 
}: LiveZoomBlockProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Simulation du nombre de viewers en temps réel
  useEffect(() => {
    if (!liveSession?.isActive || !isVisible) return;
    
    const baseViewers = liveSession?.viewerCount || 127;
    setViewerCount(baseViewers);

    const interval = setInterval(() => {
      // Simulation de variation du nombre de viewers
      const variation = Math.floor(Math.random() * 10) - 5; // -5 à +5
      setViewerCount(prev => Math.max(1, prev + variation));
    }, 8000);

    return () => clearInterval(interval);
  }, [liveSession?.isActive, isVisible]);

  // Auto-play au montage du composant
  useEffect(() => {
    if (liveSession?.autoPlay && isVisible) {
      setIsPlaying(true);
    }
  }, [liveSession?.autoPlay, isVisible]);

  // Ne pas afficher si pas de session active
  if (!liveSession || !liveSession.isActive || !isVisible) {
    return null;
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleFullscreen = () => {
    const element = videoRef.current || iframeRef.current;
    if (element?.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  const getZoomEmbedUrl = (zoomUrl: string) => {
    const meetingId = zoomUrl.split('/j/')[1]?.split('?')[0];
    return `https://zoom.us/wc/${meetingId}/join?prefer=1&un=START_User`;
  };

  const getContainerWidth = () => {
    switch (breakpoint) {
      case 'mobile':
        return 'w-full';
      case 'tablet':
        return 'w-full max-w-4xl mx-auto';
      default:
        return 'w-4/5 max-w-6xl mx-auto';
    }
  };

  const getPadding = () => {
    switch (breakpoint) {
      case 'mobile':
        return 'p-4';
      case 'tablet':
        return 'p-5';
      default:
        return 'p-6';
    }
  };

  return (
    <div className={`${isMobile ? 'mb-6' : 'mb-8'} animate-in fade-in-0 slide-in-from-top-4 duration-700`}>
      {/* Container principal avec style personnalisé */}
      <div 
        className={`
          ${getContainerWidth()} relative overflow-hidden
          ${isMobile ? 'rounded-lg' : 'rounded-2xl'}
        `}
        style={{ 
          background: '#0E0E0E',
          border: '2px solid #6E47FF',
          boxShadow: '0 0 30px rgba(110, 71, 255, 0.3)'
        }}
      >
        {/* Header avec badge LIVE animé */}
        <div className={`relative ${getPadding()} border-b border-gray-800/50`}>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'justify-between'}`}>
            <div className={`flex items-center ${isMobile ? 'flex-col text-center space-y-2' : 'space-x-4'}`}>
              {/* Badge LIVE animé */}
              <div className="relative flex items-center">
                <Badge className={`
                  bg-red-500 text-white font-semibold animate-pulse
                  ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'}
                `}>
                  🔴 LIVE
                </Badge>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75"></div>
              </div>
              
              <div className={isMobile ? 'text-center' : ''}>
                <h2 className={`text-white font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  {liveSession.title}
                </h2>
                <p className={`text-gray-300 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  {liveSession.subtitle}
                </p>
              </div>
            </div>
            
            {/* Indicateur de viewers */}
            {!isMobile && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-800/60 rounded-full px-4 py-2">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">{viewerCount.toLocaleString()}</span>
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>
          
          {/* Indicateur mobile de viewers */}
          {isMobile && (
            <div className="mt-3 flex justify-center">
              <div className="flex items-center space-x-2 bg-gray-800/60 rounded-full px-3 py-1.5">
                <Eye className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium text-sm">{viewerCount.toLocaleString()}</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Zone du lecteur vidéo */}
        <div className="relative">
          <div className={`bg-black relative group ${
            isMobile ? 'aspect-video' : 'aspect-video'
          }`}>
            {liveSession.embedCode ? (
              // Code embed personnalisé
              <div 
                dangerouslySetInnerHTML={{ __html: liveSession.embedCode }}
                className="w-full h-full"
              />
            ) : (
              // Iframe Zoom par défaut
              <iframe
                ref={iframeRef}
                src={getZoomEmbedUrl(liveSession.zoomUrl)}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                allowFullScreen
                title="Live Zoom Session"
              />
            )}
            
            {/* Overlay avec contrôles */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  {/* Contrôles de lecture */}
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      onClick={handlePlayPause}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={handleMuteToggle}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    
                    <div className="text-white text-sm bg-black/40 rounded px-2 py-1 backdrop-blur-sm">
                      {isPlaying ? 'En direct' : 'En pause'}
                    </div>
                  </div>
                  
                  {/* Bouton plein écran */}
                  <Button
                    size="sm"
                    onClick={handleFullscreen}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec contrôles et CTA */}
        <div className={`${getPadding()} bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-t border-gray-700/50`}>
          <div className={`
            flex ${isMobile ? 'flex-col space-y-4' : 'flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0'}
          `}>
            {/* Contrôles principaux */}
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center space-x-4'}`}>
              <Button
                onClick={handlePlayPause}
                className={`${
                  isPlaying 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } border-0 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isMobile 
                    ? 'px-4 py-3 h-auto rounded-lg text-base w-full' 
                    : 'px-6 py-3 h-auto rounded-xl'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-2'}`} />
                    {isMobile ? '⏸ Pause' : '⏸ Mettre en pause'}
                  </>
                ) : (
                  <>
                    <Play className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-2'}`} />
                    {isMobile ? '▶️ Reprendre' : '▶️ Reprendre le live'}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size={isMobile ? "default" : "default"}
                onClick={() => window.open(liveSession.zoomUrl, '_blank')}
                className={`
                  border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 font-medium
                  ${isMobile 
                    ? 'px-4 py-3 h-auto rounded-lg text-base w-full' 
                    : 'px-4 py-3 h-auto rounded-xl'
                  }
                `}
              >
                <ExternalLink className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-4 h-4 mr-2'}`} />
                {isMobile ? 'Ouvrir Zoom' : 'Ouvrir dans Zoom'}
              </Button>
            </div>
            
            {/* Bouton CTA de conversion si configuré */}
            {liveSession.conversionURL && liveSession.conversionText && (
              <Button
                onClick={() => window.open(liveSession.conversionURL, '_blank')}
                className={`
                  bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 
                  hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 
                  text-white border-0 font-bold shadow-lg shadow-purple-500/25 
                  transition-all duration-300 transform hover:scale-105
                  ${isMobile 
                    ? 'px-6 py-4 h-auto rounded-lg text-base w-full mt-2' 
                    : 'px-8 py-4 h-auto rounded-xl text-lg'
                  }
                `}
                style={{ 
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)' 
                }}
              >
                👉 {isMobile 
                  ? liveSession.conversionText.replace('Voir l\'offre en direct', 'Voir l\'offre')
                  : liveSession.conversionText
                }
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}