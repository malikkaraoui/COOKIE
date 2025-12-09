import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Upload,
  MessageSquare,
  Edit,
  Target,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Eye,
  Users
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'service' | 'creative' | 'landing' | 'tunnel' | 'campaign';
  assignedTo: string[];
  deadline: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  linkedEntity?: string;
  comments: number;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  subtasks: Subtask[];
  attachments: number;
  createdDate: string;
  client?: {
    name: string;
    email: string;
    avatar: string;
    company?: string;
  };
  objectives?: string[];
  timeline?: TimelineEvent[];
  files?: ProjectFile[];
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  completed: boolean;
  description?: string;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface ModalProjectDetailsExpandedProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
}

export function Modal_Project_Details_Expanded({ 
  project, 
  isOpen, 
  onClose, 
  teamMembers 
}: ModalProjectDetailsExpandedProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!project) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      'todo': { label: 'À faire', color: 'bg-gray-500', textColor: 'text-white', icon: Clock },
      'in-progress': { label: 'En cours', color: 'bg-blue-500', textColor: 'text-white', icon: AlertCircle },
      'review': { label: 'Révision', color: 'bg-yellow-500', textColor: 'text-white', icon: Clock },
      'completed': { label: 'Terminé', color: 'bg-green-500', textColor: 'text-white', icon: CheckCircle }
    };
    
    return configs[status as keyof typeof configs] || configs.todo;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      'low': { color: 'bg-green-100 text-green-800', label: 'Basse' },
      'medium': { color: 'bg-yellow-100 text-yellow-800', label: 'Moyenne' },
      'high': { color: 'bg-orange-100 text-orange-800', label: 'Haute' },
      'urgent': { color: 'bg-red-100 text-red-800', label: 'Urgente' }
    };
    
    return configs[priority as keyof typeof configs] || configs.low;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      'module': { label: 'Module', color: 'bg-purple-100 text-purple-800' },
      'service': { label: 'Service client', color: 'bg-blue-100 text-blue-800' },
      'creative': { label: 'Créa visuelle', color: 'bg-pink-100 text-pink-800' },
      'landing': { label: 'Landing', color: 'bg-green-100 text-green-800' },
      'tunnel': { label: 'Tunnel', color: 'bg-indigo-100 text-indigo-800' },
      'campaign': { label: 'Campagne', color: 'bg-orange-100 text-orange-800' }
    };
    
    return configs[type as keyof typeof configs] || configs.module;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'doc':
      case 'docx': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'jpg':
      case 'png':
      case 'gif': return <FileText className="w-5 h-5 text-green-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const statusConfig = getStatusConfig(project.status);
  const priorityConfig = getPriorityConfig(project.priority);
  const typeConfig = getTypeConfig(project.type);
  const StatusIcon = statusConfig.icon;

  // Mock data for demonstration
  const mockFiles: ProjectFile[] = [
    {
      id: '1',
      name: 'Brief_projet_v2.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'Alex Martin',
      uploadedAt: '2025-01-20'
    },
    {
      id: '2',
      name: 'Wireframes_mockups.fig',
      type: 'figma',
      size: '8.7 MB',
      uploadedBy: 'Sarah Chen',
      uploadedAt: '2025-01-18'
    },
    {
      id: '3',
      name: 'Specs_techniques.docx',
      type: 'doc',
      size: '1.2 MB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2025-01-15'
    }
  ];

  const mockTimeline: TimelineEvent[] = [
    {
      id: '1',
      date: '2025-01-15',
      title: 'Kick-off projet',
      completed: true,
      description: 'Briefing initial et définition des objectifs'
    },
    {
      id: '2',
      date: '2025-01-22',
      title: 'Phase de recherche',
      completed: true,
      description: 'Analyse concurrentielle et recherche utilisateur'
    },
    {
      id: '3',
      date: '2025-01-28',
      title: 'Wireframes et prototypes',
      completed: false,
      description: 'Création des maquettes et prototypes interactifs'
    },
    {
      id: '4',
      date: '2025-02-05',
      title: 'Développement',
      completed: false,
      description: 'Intégration et développement des fonctionnalités'
    },
    {
      id: '5',
      date: '2025-02-15',
      title: 'Tests et livraison',
      completed: false,
      description: 'Tests finaux et mise en production'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-[#1E1E1E] border-gray-600 min-w-[1000px] w-[90%] max-w-[90%] max-h-[90vh] overflow-y-auto rounded-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ padding: '40px' }}
      >
        <DialogHeader className="pb-6 border-b border-gray-600">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-white text-2xl font-bold leading-tight">
                {project.title}
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-lg">
                Détails complets du projet #{project.id}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`${statusConfig.color} ${statusConfig.textColor} flex items-center gap-2 px-3 py-1`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </Badge>
              <Badge className={typeConfig.color}>
                {typeConfig.label}
              </Badge>
              <Badge className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu principal en 3 colonnes */}
        <div className="grid grid-cols-12 gap-6 mt-8">
          {/* Colonne 1: Informations client + responsable + statut + progression (40%) */}
          <div className="col-span-5 space-y-6">
            {/* Informations client */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
              <h3 className="text-white text-xl font-bold mb-6">Informations client</h3>
              {project.client ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                    <ImageWithFallback 
                      src={project.client.avatar}
                      alt={project.client.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-lg font-medium">{project.client.name}</p>
                    <p className="text-gray-400 text-base">{project.client.email}</p>
                    {project.client.company && (
                      <p className="text-gray-500 text-sm">{project.client.company}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-gray-400">
                  <User className="w-8 h-8" />
                  <p className="text-base">Projet interne START</p>
                </div>
              )}
            </div>

            {/* Équipe assignée */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
              <h3 className="text-white text-xl font-bold mb-6">Équipe assignée</h3>
              <div className="space-y-4">
                {project.assignedTo.map((memberId) => {
                  const member = teamMembers.find(m => m.id === memberId);
                  if (!member) return null;
                  
                  return (
                    <div key={member.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600">
                        <ImageWithFallback 
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-white text-base font-medium">{member.name}</p>
                        <p className="text-gray-400 text-sm">{member.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progression et échéance */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
              <h3 className="text-white text-xl font-bold mb-6">Progression</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-base">Avancement global</span>
                    <span className="text-white text-lg font-bold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3 bg-gray-700" />
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-400">Échéance</p>
                    <p className="text-base font-medium text-white">{formatDate(project.deadline)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-400">Créé le</p>
                    <p className="text-base font-medium text-white">{formatDate(project.createdDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 h-12 text-base font-medium rounded-xl">
                <Edit className="w-5 h-5 mr-3" />
                Modifier le projet
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-12 text-base font-medium rounded-xl">
                <MessageSquare className="w-5 h-5 mr-3" />
                Ajouter un commentaire
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-12 text-base font-medium rounded-xl">
                <Users className="w-5 h-5 mr-3" />
                Gérer l'équipe
              </Button>
            </div>
          </div>

          {/* Colonne 2: Livrables (30%) */}
          <div className="col-span-3 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
              <h3 className="text-white text-xl font-bold mb-6">Livrables</h3>
              <div className="space-y-3">
                {project.subtasks.map((subtask) => {
                  const assignedMember = teamMembers.find(m => m.id === subtask.assignedTo);
                  
                  return (
                    <div key={subtask.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        readOnly
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-base ${subtask.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {subtask.title}
                        </p>
                        {assignedMember && (
                          <p className="text-sm text-gray-400 mt-1">{assignedMember.name}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-10 text-sm font-medium rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Ajouter un livrable
              </Button>
            </div>

            {/* Mini-timeline */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
              <h3 className="text-white text-xl font-bold mb-6">Timeline</h3>
              <div className="space-y-4">
                {mockTimeline.slice(0, 4).map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      event.completed ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        event.completed ? 'text-gray-400' : 'text-white'
                      }`}>
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-10 text-sm font-medium rounded-lg">
                <Calendar className="w-4 h-4 mr-2" />
                Voir timeline complète
              </Button>
            </div>
          </div>

          {/* Colonne 3: Fichiers & Documents (30%) */}
          <div className="col-span-4 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
              <h3 className="text-white text-xl font-bold mb-6">Fichiers & Documents</h3>
              <div className="space-y-3">
                {mockFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/20">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                        <p className="text-gray-400 text-xs">{file.size} • {file.uploadedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-10 text-sm font-medium rounded-lg">
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un fichier
              </Button>
            </div>

            {/* Statistiques du projet */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
              <h3 className="text-white text-xl font-bold mb-6">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-base">Commentaires</span>
                  <span className="text-white text-base font-medium">{project.comments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-base">Pièces jointes</span>
                  <span className="text-white text-base font-medium">{project.attachments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-base">Sous-tâches</span>
                  <span className="text-white text-base font-medium">
                    {project.subtasks.filter(s => s.completed).length}/{project.subtasks.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-base">Équipe</span>
                  <span className="text-white text-base font-medium">{project.assignedTo.length} membres</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Description & Objectifs (accordéon) */}
        <div className="mt-8 border-t border-gray-600 pt-8">
          <Collapsible open={isDescriptionExpanded} onOpenChange={setIsDescriptionExpanded}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-white hover:bg-gray-800/50 h-12 text-lg font-medium"
              >
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5" />
                  <span>Description & Objectifs</span>
                </div>
                {isDescriptionExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
                  <h4 className="text-white text-lg font-semibold mb-4">Description détaillée</h4>
                  <p className="text-gray-300 text-base leading-relaxed">{project.description}</p>
                  {project.linkedEntity && (
                    <div className="mt-4 pt-4 border-t border-gray-600/30">
                      <p className="text-gray-400 text-sm">Lié à :</p>
                      <p className="text-blue-400 text-base font-medium">{project.linkedEntity}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30">
                  <h4 className="text-white text-lg font-semibold mb-4">Objectifs du projet</h4>
                  {project.objectives ? (
                    <ul className="space-y-3">
                      {project.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                          <span className="text-gray-300 text-base leading-relaxed">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-base">Aucun objectif spécifique défini pour ce projet.</p>
                  )}
                  
                  {project.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2">Tags :</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}