import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Calendar } from '../ui/calendar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Modal_Project_Details_Expanded } from './Modal_Project_Details_Expanded';
import { 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  LayoutGrid,
  List,
  Search,
  Clock,
  User,
  ExternalLink,
  MessageSquare,
  Paperclip,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Star,
  Flag,
  UserPlus,
  Upload,
  Download
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
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export function ProjectManagement() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedSubtasks, setEditedSubtasks] = useState<Subtask[]>([]);

  // Mock data
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Alex Martin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', role: 'Dev' },
    { id: '2', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b65c?w=40&h=40&fit=crop&crop=face', role: 'Designer' },
    { id: '3', name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', role: 'Marketing' },
    { id: '4', name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', role: 'Content' },
    { id: '5', name: 'Tom Rodriguez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', role: 'SEO' }
  ];

  const projects: Project[] = [
    {
      id: '1',
      title: 'Module IA Avancée',
      description: 'Création du module sur l\'intelligence artificielle avancée avec 15 leçons vidéo couvrant les dernières techniques et outils d\'IA pour les entrepreneurs et marketeurs.',
      type: 'module',
      assignedTo: ['1', '2'],
      deadline: '2025-02-15',
      status: 'in-progress',
      linkedEntity: 'Module IA - 12 leçons',
      comments: 8,
      progress: 65,
      priority: 'high',
      tags: ['IA', 'Video', 'Urgent'],
      subtasks: [
        { id: '1', title: 'Script des leçons 1-5', completed: true, assignedTo: '4' },
        { id: '2', title: 'Tournage vidéos', completed: false, assignedTo: '1' },
        { id: '3', title: 'Montage et post-prod', completed: false, assignedTo: '2' }
      ],
      attachments: 12,
      createdDate: '2025-01-10',
      objectives: [
        'Créer un contenu pédagogique de qualité sur l\'IA',
        'Couvrir les outils pratiques et cas d\'usage concrets',
        'Livrer un module complet avec exercices et templates'
      ]
    },
    {
      id: '2',
      title: 'Landing E-commerce Client',
      description: 'Création d\'une landing page haute conversion pour le client TechStore avec tunnel de vente intégré, optimisée mobile et desktop.',
      type: 'landing',
      assignedTo: ['2', '3'],
      deadline: '2025-01-28',
      status: 'review',
      linkedEntity: 'Client: TechStore',
      comments: 4,
      progress: 85,
      priority: 'medium',
      tags: ['Landing', 'E-commerce', 'Conversion'],
      subtasks: [
        { id: '4', title: 'Maquette design', completed: true, assignedTo: '2' },
        { id: '5', title: 'Intégration HTML/CSS', completed: true, assignedTo: '1' },
        { id: '6', title: 'Tests conversion', completed: false, assignedTo: '3' }
      ],
      attachments: 8,
      createdDate: '2025-01-05',
      client: {
        name: 'Marc Dubois',
        email: 'marc@techstore.fr',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
        company: 'TechStore'
      },
      objectives: [
        'Augmenter le taux de conversion de 25%',
        'Optimiser l\'expérience mobile',
        'Intégrer les paiements Stripe et PayPal'
      ]
    },
    {
      id: '3',
      title: 'Pack Créatifs Instagram',
      description: 'Création de 50 visuels Instagram cohérents avec la charte graphique START, incluant posts, stories et carrousels pour 1 mois de contenu.',
      type: 'creative',
      assignedTo: ['2', '4'],
      deadline: '2025-01-25',
      status: 'completed',
      linkedEntity: 'Service: Pack créatifs',
      comments: 12,
      progress: 100,
      priority: 'low',
      tags: ['Design', 'Social Media', 'Instagram'],
      subtasks: [
        { id: '7', title: 'Brainstorming concepts', completed: true, assignedTo: '4' },
        { id: '8', title: 'Création visuels', completed: true, assignedTo: '2' },
        { id: '9', title: 'Validation client', completed: true, assignedTo: '3' }
      ],
      attachments: 25,
      createdDate: '2025-01-01',
      client: {
        name: 'Sophie Martin',
        email: 'sophie@startmodules.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b512?w=150&h=150&fit=crop&crop=face',
        company: 'START Modules'
      },
      objectives: [
        'Maintenir la cohérence visuelle de la marque',
        'Augmenter l\'engagement sur Instagram',
        'Créer du contenu réutilisable'
      ]
    },
    {
      id: '4',
      title: 'Tunnel Vente Copywriting',
      description: 'Optimisation du tunnel de vente pour le module copywriting',
      type: 'tunnel',
      assignedTo: ['3', '4'],
      deadline: '2025-02-05',
      status: 'todo',
      linkedEntity: 'Module: Copywriting Pro',
      comments: 2,
      progress: 15,
      priority: 'urgent',
      tags: ['Copywriting', 'Tunnel', 'Conversion'],
      subtasks: [
        { id: '10', title: 'Audit tunnel existant', completed: true, assignedTo: '3' },
        { id: '11', title: 'Rédaction nouveaux textes', completed: false, assignedTo: '4' },
        { id: '12', title: 'A/B tests', completed: false, assignedTo: '3' }
      ],
      attachments: 5,
      createdDate: '2025-01-20'
    },
    {
      id: '5',
      title: 'Campagne SEO Q1',
      description: 'Stratégie SEO pour améliorer le positionnement des modules START',
      type: 'campaign',
      assignedTo: ['5', '3'],
      deadline: '2025-03-31',
      status: 'in-progress',
      linkedEntity: 'SEO Global',
      comments: 6,
      progress: 30,
      priority: 'medium',
      tags: ['SEO', 'Marketing', 'Q1'],
      subtasks: [
        { id: '13', title: 'Audit SEO technique', completed: true, assignedTo: '5' },
        { id: '14', title: 'Stratégie mots-clés', completed: false, assignedTo: '5' },
        { id: '15', title: 'Création contenu', completed: false, assignedTo: '4' }
      ],
      attachments: 15,
      createdDate: '2025-01-15'
    }
  ];

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || project.type === filterType;
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesTeam = filterTeam === 'all' || project.assignedTo.includes(filterTeam);
    
    return matchesSearch && matchesType && matchesStatus && matchesTeam;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderTeamAvatars = (assignedTo: string[]) => {
    return (
      <div className="flex -space-x-2">
        {assignedTo.slice(0, 3).map((memberId) => {
          const member = teamMembers.find(m => m.id === memberId);
          if (!member) return null;
          
          return (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 border-gray-800 overflow-hidden"
              title={member.name}
            >
              <ImageWithFallback 
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
        {assignedTo.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
            <span className="text-xs text-gray-300">+{assignedTo.length - 3}</span>
          </div>
        )}
      </div>
    );
  };

  const renderTableView = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-left">
                <th className="p-4 text-gray-400 text-sm">Projet</th>
                <th className="p-4 text-gray-400 text-sm">Type</th>
                <th className="p-4 text-gray-400 text-sm">Assigné à</th>
                <th className="p-4 text-gray-400 text-sm">Échéance</th>
                <th className="p-4 text-gray-400 text-sm">Statut</th>
                <th className="p-4 text-gray-400 text-sm">Lien interne</th>
                <th className="p-4 text-gray-400 text-sm">Commentaires</th>
                <th className="p-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const statusConfig = getStatusConfig(project.status);
                const typeConfig = getTypeConfig(project.type);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={project.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-white text-sm">{project.title}</p>
                        <p className="text-gray-400 text-xs">{project.description.substring(0, 60)}...</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={project.progress} className="w-20 h-1" />
                          <span className="text-xs text-gray-400">{project.progress}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {renderTeamAvatars(project.assignedTo)}
                    </td>
                    <td className="p-4">
                      <p className="text-gray-400 text-sm">{formatDate(project.deadline)}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={`${statusConfig.color} ${statusConfig.textColor} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 cursor-pointer">
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-xs">{project.linkedEntity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-xs">{project.comments}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white p-1"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsExpandedModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderKanbanView = () => {
    const statusColumns = ['todo', 'in-progress', 'review', 'completed'];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((status) => {
          const statusConfig = getStatusConfig(status);
          const StatusIcon = statusConfig.icon;
          const columnProjects = filteredProjects.filter(p => p.status === status);
          
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-4 h-4 text-gray-400" />
                  <h3 className="text-white text-sm">{statusConfig.label}</h3>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                    {columnProjects.length}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                {columnProjects.map((project) => {
                  const typeConfig = getTypeConfig(project.type);
                  const priorityConfig = getPriorityConfig(project.priority);
                  
                  return (
                    <Card 
                      key={project.id} 
                      className="bg-gray-800 border-gray-700 cursor-pointer hover:border-blue-500/50 transition-all duration-200"
                      onClick={() => {
                        setSelectedProject(project);
                        setEditedDescription(project.description);
                        setEditedSubtasks([...project.subtasks]);
                        setIsExpandedModalOpen(true);
                      }}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-white text-sm">{project.title}</h4>
                          <Badge className={priorityConfig.color}>
                            {priorityConfig.label}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-400 text-xs">{project.description.substring(0, 80)}...</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                          <span className="text-xs text-gray-400">{formatDate(project.deadline)}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Progress value={project.progress} className="flex-1 h-1" />
                            <span className="text-xs text-gray-400">{project.progress}%</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {renderTeamAvatars(project.assignedTo)}
                            <div className="flex items-center space-x-2 text-gray-400">
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span className="text-xs">{project.comments}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Paperclip className="w-3 h-3" />
                                <span className="text-xs">{project.attachments}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCalendarView = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="text-center text-gray-400 py-12">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4" />
          <p>Vue calendrier en développement</p>
          <p className="text-sm">Gantt chart et timeline seront disponibles prochainement</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white">Gestion des projets internes</h1>
          <p className="text-gray-400 mt-1">Suivi et coordination de tous les projets START</p>
        </div>
        
        <Button className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Créer un nouveau projet
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center lg:justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 max-w-xs"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="module">Module</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="creative">Créative</SelectItem>
                <SelectItem value="landing">Landing</SelectItem>
                <SelectItem value="tunnel">Tunnel</SelectItem>
                <SelectItem value="campaign">Campagne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="review">Révision</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center bg-gray-800 p-1 rounded-lg">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}
          >
            <List className="w-4 h-4 mr-1" />
            Tableau
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className={viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            Kanban
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}
          >
            <CalendarIcon className="w-4 h-4 mr-1" />
            Calendrier
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'table' && renderTableView()}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'calendar' && renderCalendarView()}

      {/* Expanded Project Detail Modal */}
      <Modal_Project_Details_Expanded
        project={selectedProject}
        isOpen={isExpandedModalOpen}
        onClose={() => setIsExpandedModalOpen(false)}
        teamMembers={teamMembers}
      />
    </div>
  );
}