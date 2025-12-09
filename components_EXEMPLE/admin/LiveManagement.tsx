import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Radio,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Copy,
  Settings
} from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  zoomUrl: string;
  embedCode?: string;
  startDate: string;
  duration: number;
  isActive: boolean;
  maxParticipants?: number;
  instructor?: string;
  status: 'scheduled' | 'live' | 'ended';
  participants: number;
  createdAt: string;
  conversionURL?: string;
  conversionText?: string;
  autoPlay?: boolean;
}

export function LiveManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLive, setSelectedLive] = useState<LiveSession | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mock data
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([
    {
      id: '1',
      title: 'Masterclass IA & E-commerce',
      subtitle: 'Session en cours avec l\'équipe START',
      description: 'Découvrez comment utiliser l\'IA pour booster vos ventes e-commerce',
      zoomUrl: 'https://zoom.us/j/123456789',
      startDate: '2025-01-25T20:00:00Z',
      duration: 90,
      isActive: true,
      maxParticipants: 500,
      instructor: 'Expert START',
      status: 'live',
      participants: 287,
      createdAt: '2025-01-20T10:00:00Z',
      conversionURL: 'https://start-modules.com/offre-speciale',
      conversionText: 'Voir l\'offre en direct',
      autoPlay: true
    },
    {
      id: '2',
      title: 'Workshop SEO Avancé',
      description: 'Techniques SEO avancées pour dominer Google',
      zoomUrl: 'https://zoom.us/j/987654321',
      startDate: '2025-01-28T19:00:00Z',
      duration: 120,
      isActive: false,
      maxParticipants: 300,
      instructor: 'Marie Dubois',
      status: 'scheduled',
      participants: 0,
      createdAt: '2025-01-22T14:30:00Z'
    },
    {
      id: '3',
      title: 'Q&A Copywriting',
      description: 'Session questions-réponses sur le copywriting',
      zoomUrl: 'https://zoom.us/j/456789123',
      startDate: '2025-01-20T18:00:00Z',
      duration: 60,
      isActive: false,
      maxParticipants: 200,
      instructor: 'Thomas Martin',
      status: 'ended',
      participants: 156,
      createdAt: '2025-01-18T09:15:00Z'
    }
  ]);

  const [newLive, setNewLive] = useState({
    title: '',
    subtitle: '',
    description: '',
    zoomUrl: '',
    embedCode: '',
    startDate: '',
    duration: 60,
    maxParticipants: 100,
    instructor: '',
    isActive: false,
    conversionURL: '',
    conversionText: '',
    autoPlay: true
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      'scheduled': { label: 'Programmé', color: 'bg-blue-100 text-blue-800', icon: Calendar },
      'live': { label: 'En direct', color: 'bg-red-100 text-red-800', icon: Radio },
      'ended': { label: 'Terminé', color: 'bg-gray-100 text-gray-800', icon: Clock }
    };
    
    return configs[status as keyof typeof configs] || configs.scheduled;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateLive = () => {
    const newSession: LiveSession = {
      id: Date.now().toString(),
      ...newLive,
      status: 'scheduled',
      participants: 0,
      createdAt: new Date().toISOString()
    };
    
    setLiveSessions([...liveSessions, newSession]);
    setIsCreateModalOpen(false);
    setNewLive({
      title: '',
      subtitle: '',
      description: '',
      zoomUrl: '',
      embedCode: '',
      startDate: '',
      duration: 60,
      maxParticipants: 100,
      instructor: '',
      isActive: false,
      conversionURL: '',
      conversionText: '',
      autoPlay: true
    });
  };

  const handleToggleLive = (id: string) => {
    setLiveSessions(liveSessions.map(live => 
      live.id === id 
        ? { ...live, isActive: !live.isActive, status: live.isActive ? 'scheduled' : 'live' }
        : live
    ));
  };

  const handleDeleteLive = (id: string) => {
    setLiveSessions(liveSessions.filter(live => live.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-white">Gestion des Lives</h1>
          <p className="text-gray-400 mt-1">Planifiez et gérez vos sessions Zoom en direct</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-pink-400 hover:from-red-600 hover:to-pink-500 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Créer un Live
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      
      {/* Aperçu du live actif */}
      {liveSessions.find(live => live.isActive) && (
        <Card className="bg-gradient-to-r from-red-500/10 to-pink-400/10 border-red-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Radio className="w-5 h-5 mr-2 text-red-500 animate-pulse" />
              🔴 Aperçu Live Actif
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const activeLive = liveSessions.find(live => live.isActive);
              return activeLive ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-800/60 p-3 rounded-lg">
                      <p className="text-gray-400">Titre affiché :</p>
                      <p className="text-white font-medium">{activeLive.title}</p>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-lg">
                      <p className="text-gray-400">Sous-titre :</p>
                      <p className="text-white font-medium">{activeLive.subtitle || 'Non défini'}</p>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-lg">
                      <p className="text-gray-400">Participants :</p>
                      <p className="text-white font-medium">{activeLive.participants}/{activeLive.maxParticipants}</p>
                    </div>
                  </div>
                  
                  {activeLive.conversionURL && (
                    <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                      <p className="text-purple-400 font-medium mb-2">🎯 Call-to-Action configuré :</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white">"{activeLive.conversionText}"</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-purple-500/50 text-purple-400"
                          onClick={() => window.open(activeLive.conversionURL, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Tester le lien
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      ✨ Ce live est actuellement visible sur la page d'accueil utilisateur
                    </p>
                  </div>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Radio className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl text-white font-bold">
                  {liveSessions.filter(l => l.status === 'live').length}
                </p>
                <p className="text-gray-400 text-sm">Lives actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl text-white font-bold">
                  {liveSessions.filter(l => l.status === 'scheduled').length}
                </p>
                <p className="text-gray-400 text-sm">Programmés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl text-white font-bold">
                  {liveSessions.reduce((sum, live) => sum + live.participants, 0)}
                </p>
                <p className="text-gray-400 text-sm">Total participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl text-white font-bold">
                  {liveSessions.reduce((sum, live) => sum + live.duration, 0)}
                </p>
                <p className="text-gray-400 text-sm">Minutes totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des lives */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Sessions Live</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveSessions.map((live) => {
              const statusConfig = getStatusConfig(live.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={live.id} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-white text-lg font-semibold">{live.title}</h3>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            {live.isActive && (
                              <Badge className="bg-red-500 text-white animate-pulse">
                                🔴 ACTIF
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400">{live.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>📅 {formatDate(live.startDate)}</span>
                            <span>⏱️ {live.duration} min</span>
                            <span>👥 {live.participants}/{live.maxParticipants}</span>
                            <span>🎓 {live.instructor}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`toggle-${live.id}`} className="text-gray-300 text-sm">
                              Activer
                            </Label>
                            <Switch
                              id={`toggle-${live.id}`}
                              checked={live.isActive}
                              onCheckedChange={() => handleToggleLive(live.id)}
                            />
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 hover:text-white"
                            onClick={() => window.open(live.zoomUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 hover:text-white"
                            onClick={() => {
                              setSelectedLive(live);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 hover:text-red-400"
                            onClick={() => handleDeleteLive(live.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {live.status === 'live' && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-red-400 font-medium">Live en cours</span>
                              <span className="text-gray-400">• {live.participants} participants connectés</span>
                            </div>
                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                              <Eye className="w-4 h-4 mr-2" />
                              Surveiller
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-600 w-[900px] max-w-[90%]" style={{ padding: '32px' }}>
          <DialogHeader className="pb-6 border-b border-gray-600">
            <DialogTitle className="text-white text-2xl">Créer une nouvelle session Live</DialogTitle>
            <DialogDescription className="text-gray-400 text-lg">
              Configurez les paramètres de votre session Zoom
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8 py-8">
            {/* Section 1: Informations de base */}
            <div className="space-y-6">
              <h3 className="text-white text-xl font-semibold border-b border-gray-600 pb-2">📺 Informations du Live</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-base">Titre principal</Label>
                  <Input
                    value={newLive.title}
                    onChange={(e) => setNewLive({ ...newLive, title: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                    placeholder="Ex: 🔴 Live en direct"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300 text-base">Sous-titre</Label>
                  <Input
                    value={newLive.subtitle}
                    onChange={(e) => setNewLive({ ...newLive, subtitle: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                    placeholder="Ex: Session en cours avec l'équipe START"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300 text-base">Description</Label>
                <Textarea
                  value={newLive.description}
                  onChange={(e) => setNewLive({ ...newLive, description: e.target.value })}
                  className="bg-gray-700/50 border-gray-600 text-white text-base min-h-[100px]"
                  placeholder="Description détaillée de la session..."
                />
              </div>
            </div>
            
            {/* Section 2: Configuration technique */}
            <div className="space-y-6">
              <h3 className="text-white text-xl font-semibold border-b border-gray-600 pb-2">🔧 Configuration technique</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-base">📹 Lien Zoom / Embed</Label>
                  <Input
                    value={newLive.zoomUrl}
                    onChange={(e) => setNewLive({ ...newLive, zoomUrl: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300 text-base">👨‍🏫 Instructeur</Label>
                  <Input
                    value={newLive.instructor}
                    onChange={(e) => setNewLive({ ...newLive, instructor: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                    placeholder="Nom de l'instructeur"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300 text-base">📝 Code Embed personnalisé (optionnel)</Label>
                <Textarea
                  value={newLive.embedCode}
                  onChange={(e) => setNewLive({ ...newLive, embedCode: e.target.value })}
                  className="bg-gray-700/50 border-gray-600 text-white text-base min-h-[80px]"
                  placeholder="<iframe src='...' width='100%' height='100%'></iframe>"
                />
              </div>
            </div>
            
            {/* Section 3: Paramètres et CTA */}
            <div className="space-y-6">
              <h3 className="text-white text-xl font-semibold border-b border-gray-600 pb-2">⚙️ Paramètres et Actions</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-base">🕓 Date et heure de lancement</Label>
                  <Input
                    type="datetime-local"
                    value={newLive.startDate}
                    onChange={(e) => setNewLive({ ...newLive, startDate: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300 text-base">⏱️ Durée (minutes)</Label>
                  <Input
                    type="number"
                    value={newLive.duration}
                    onChange={(e) => setNewLive({ ...newLive, duration: parseInt(e.target.value) || 60 })}
                    className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300 text-base">🔗 Lien call-to-action (conversionURL)</Label>
                <Input
                  value={newLive.conversionURL}
                  onChange={(e) => setNewLive({ ...newLive, conversionURL: e.target.value })}
                  className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                  placeholder="https://exemple.com/offre-speciale"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300 text-base">📢 Texte du bouton CTA</Label>
                <Input
                  value={newLive.conversionText}
                  onChange={(e) => setNewLive({ ...newLive, conversionText: e.target.value })}
                  className="bg-gray-700/50 border-gray-600 text-white text-base h-12"
                  placeholder="Ex: Voir l'offre en direct"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <Switch
                    checked={newLive.isActive}
                    onCheckedChange={(checked) => setNewLive({ ...newLive, isActive: checked })}
                  />
                  <div>
                    <Label className="text-green-400 text-base font-semibold">✅ Activer le live</Label>
                    <p className="text-gray-400 text-sm">Afficher sur la page d'accueil</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Switch
                    checked={newLive.autoPlay}
                    onCheckedChange={(checked) => setNewLive({ ...newLive, autoPlay: checked })}
                  />
                  <div>
                    <Label className="text-blue-400 text-base font-semibold">▶️ Lecture automatique</Label>
                    <p className="text-gray-400 text-sm">Démarre automatiquement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-12 px-8 text-base"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateLive}
              className="bg-gradient-to-r from-red-500 to-pink-400 hover:from-red-600 hover:to-pink-500 text-white border-0 h-12 px-8 text-base"
            >
              <Radio className="w-5 h-5 mr-2" />
              Créer le Live
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}