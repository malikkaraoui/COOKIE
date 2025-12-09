import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { 
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
  TrendingDown,
  FileText,
  Reply,
  UserCheck,
  X
} from 'lucide-react';

export function SupportManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssigned, setFilterAssigned] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Mock data
  const supportKPIs = {
    activeTickets: 23,
    newTickets: 8,
    resolvedToday: 12,
    avgResponseTime: 2.5,
    satisfactionRate: 94,
    totalTickets: 847
  };

  const tickets = [
    {
      id: '1',
      client: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b512?w=150&h=150&fit=crop&crop=face',
      subject: 'Problème d\'accès au module IA Marketing',
      type: 'technique',
      status: 'nouveau',
      priority: 'high',
      createdAt: '2025-01-22 14:30',
      lastResponse: '2025-01-22 14:30',
      assignedTo: null,
      module: 'IA Marketing Avancé',
      description: 'Je n\'arrive pas à accéder au module IA Marketing que j\'ai acheté hier. La page se charge mais reste blanche.',
      messages: [
        {
          from: 'Marie Dupont',
          message: 'Je n\'arrive pas à accéder au module IA Marketing que j\'ai acheté hier. La page se charge mais reste blanche.',
          timestamp: '2025-01-22 14:30',
          isStaff: false
        }
      ]
    },
    {
      id: '2',
      client: 'Pierre Martin',
      email: 'pierre.martin@email.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      subject: 'Remboursement demandé',
      type: 'paiement',
      status: 'en-cours',
      priority: 'medium',
      createdAt: '2025-01-21 16:45',
      lastResponse: '2025-01-22 09:15',
      assignedTo: 'Sophie Support',
      module: 'SEO Technique',
      description: 'Je souhaite être remboursé pour le module SEO Technique car il ne correspond pas à mes attentes.',
      messages: [
        {
          from: 'Pierre Martin',
          message: 'Je souhaite être remboursé pour le module SEO Technique car il ne correspond pas à mes attentes.',
          timestamp: '2025-01-21 16:45',
          isStaff: false
        },
        {
          from: 'Sophie Support',
          message: 'Bonjour Pierre, je comprends votre situation. Pouvez-vous me préciser quels aspects ne correspondent pas à vos attentes ?',
          timestamp: '2025-01-22 09:15',
          isStaff: true
        }
      ]
    },
    {
      id: '3',
      client: 'Alex Dubois',
      email: 'alex.dubois@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      subject: 'Question sur le contenu du module',
      type: 'contenu',
      status: 'resolu',
      priority: 'low',
      createdAt: '2025-01-20 11:20',
      lastResponse: '2025-01-21 14:30',
      assignedTo: 'Thomas Expert',
      module: 'Copywriting Émotionnel',
      description: 'J\'aimerais savoir s\'il y a des templates supplémentaires disponibles pour les emails de vente.',
      messages: [
        {
          from: 'Alex Dubois',
          message: 'J\'aimerais savoir s\'il y a des templates supplémentaires disponibles pour les emails de vente.',
          timestamp: '2025-01-20 11:20',
          isStaff: false
        },
        {
          from: 'Thomas Expert',
          message: 'Bonjour Alex, oui nous avons une bibliothèque de 50+ templates dans le module bonus. Je vous envoie le lien d\'accès.',
          timestamp: '2025-01-21 14:30',
          isStaff: true
        }
      ]
    },
    {
      id: '4',
      client: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      subject: 'Erreur de facturation',
      type: 'paiement',
      status: 'nouveau',
      priority: 'high',
      createdAt: '2025-01-22 10:15',
      lastResponse: '2025-01-22 10:15',
      assignedTo: null,
      module: 'E-commerce Pro',
      description: 'J\'ai été facturée deux fois pour le même module. Pouvez-vous vérifier ?',
      messages: [
        {
          from: 'Sophie Laurent',
          message: 'J\'ai été facturée deux fois pour le même module. Pouvez-vous vérifier ?',
          timestamp: '2025-01-22 10:15',
          isStaff: false
        }
      ]
    }
  ];

  const ticketTypes = [
    { value: 'technique', label: 'Technique', color: 'bg-blue-500' },
    { value: 'acces', label: 'Accès', color: 'bg-yellow-500' },
    { value: 'paiement', label: 'Paiement', color: 'bg-green-500' },
    { value: 'contenu', label: 'Contenu', color: 'bg-purple-500' }
  ];

  const ticketStatuses = [
    { value: 'nouveau', label: 'Nouveau', color: 'bg-red-500', icon: AlertCircle },
    { value: 'en-cours', label: 'En cours', color: 'bg-yellow-500', icon: Clock },
    { value: 'resolu', label: 'Résolu', color: 'bg-green-500', icon: CheckCircle }
  ];

  const priorities = [
    { value: 'low', label: 'Faible', color: 'bg-gray-500' },
    { value: 'medium', label: 'Moyenne', color: 'bg-yellow-500' },
    { value: 'high', label: 'Élevée', color: 'bg-red-500' }
  ];

  const staffMembers = ['Sophie Support', 'Thomas Expert', 'Lucas Tech', 'Emma Admin'];

  const getTypeBadge = (type: string) => {
    const typeConfig = ticketTypes.find(t => t.value === type);
    return (
      <Badge className={`${typeConfig?.color} text-white text-xs`}>
        {typeConfig?.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = ticketStatuses.find(s => s.value === status);
    const Icon = statusConfig?.icon || AlertCircle;
    
    return (
      <Badge className={`${statusConfig?.color} text-white text-xs flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {statusConfig?.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return (
      <Badge className={`${priorityConfig?.color} text-white text-xs`}>
        {priorityConfig?.label}
      </Badge>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || ticket.type === filterType;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesAssigned = filterAssigned === 'all' || 
      (filterAssigned === 'unassigned' ? !ticket.assignedTo : ticket.assignedTo === filterAssigned);
    
    return matchesSearch && matchesType && matchesStatus && matchesAssigned;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Support Client – {supportKPIs.activeTickets} demandes actives</h1>
          <p className="text-gray-400">Gestion des tickets et demandes clients</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tickets actifs</p>
                <p className="text-2xl text-white">{supportKPIs.activeTickets}</p>
                <p className="text-red-400 text-sm">{supportKPIs.newTickets} nouveaux</p>
              </div>
              <MessageCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Résolus aujourd'hui</p>
                <p className="text-2xl text-white">{supportKPIs.resolvedToday}</p>
                <p className="text-green-400 text-sm">Tickets fermés</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Temps de réponse</p>
                <p className="text-2xl text-white">{supportKPIs.avgResponseTime}h</p>
                <p className="text-orange-400 text-sm">Temps moyen</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Satisfaction</p>
                <p className="text-2xl text-white">{supportKPIs.satisfactionRate}%</p>
                <p className="text-cyan-400 text-sm">Taux moyen</p>
              </div>
              <TrendingDown className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {ticketTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {ticketStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAssigned} onValueChange={setFilterAssigned}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Assigné à" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="unassigned">Non assigné</SelectItem>
                {staffMembers.map(staff => (
                  <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tickets */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-left">
                  <th className="p-4 text-gray-400 text-sm">Client</th>
                  <th className="p-4 text-gray-400 text-sm">Sujet</th>
                  <th className="p-4 text-gray-400 text-sm">Type</th>
                  <th className="p-4 text-gray-400 text-sm">Statut</th>
                  <th className="p-4 text-gray-400 text-sm">Priorité</th>
                  <th className="p-4 text-gray-400 text-sm">Dernière réponse</th>
                  <th className="p-4 text-gray-400 text-sm">Affecté à</th>
                  <th className="p-4 text-gray-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={ticket.avatar} alt={ticket.client} />
                          <AvatarFallback className="bg-gray-600 text-white text-xs">
                            {ticket.client.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm">{ticket.client}</p>
                          <p className="text-gray-400 text-xs">{ticket.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">{ticket.subject}</p>
                      <p className="text-gray-400 text-xs">{ticket.module}</p>
                    </td>
                    <td className="p-4">
                      {getTypeBadge(ticket.type)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="p-4">
                      <p className="text-gray-400 text-xs">{getTimeAgo(ticket.lastResponse)}</p>
                    </td>
                    <td className="p-4">
                      {ticket.assignedTo ? (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-white text-xs">{ticket.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">Non assigné</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Reply className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#1E1E1E] border-gray-600 max-w-5xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="pb-6 border-b border-gray-600">
                              <DialogTitle className="text-white text-2xl font-semibold">
                                {selectedTicket?.subject}
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Ticket #{selectedTicket?.id} - Gestion et réponse
                              </DialogDescription>
                            </DialogHeader>
                            {selectedTicket && (
                              <div className="p-8 space-y-8">
                                {/* Info ticket */}
                                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                                  <h3 className="text-white text-lg font-semibold mb-6">Informations du client</h3>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <Avatar className="w-12 h-12">
                                        <AvatarImage src={selectedTicket.avatar} alt={selectedTicket.client} />
                                        <AvatarFallback className="bg-gray-600 text-white">
                                          {selectedTicket.client.split(' ').map((n: string) => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="space-y-1">
                                        <p className="text-white text-base font-medium">{selectedTicket.client}</p>
                                        <p className="text-gray-400 text-sm">{selectedTicket.email}</p>
                                        <p className="text-gray-400 text-sm">Module: {selectedTicket.module}</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-3">
                                      {getTypeBadge(selectedTicket.type)}
                                      {getStatusBadge(selectedTicket.status)}
                                      {getPriorityBadge(selectedTicket.priority)}
                                    </div>
                                  </div>
                                </div>

                                {/* Messages */}
                                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                                  <h3 className="text-white text-lg font-semibold mb-6">Conversation</h3>
                                  <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {selectedTicket.messages.map((message: any, index: number) => (
                                      <div key={index} className={`p-4 rounded-lg ${
                                        message.isStaff ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-700/30'
                                      }`}>
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-white text-base font-medium">{message.from}</span>
                                          <span className="text-gray-400 text-sm">{formatDateTime(message.timestamp)}</span>
                                        </div>
                                        <p className="text-gray-300 text-base leading-relaxed">{message.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Réponse */}
                                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                                  <h3 className="text-white text-lg font-semibold mb-6">Répondre au ticket</h3>
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="text-gray-300 text-sm font-medium">Votre réponse</label>
                                      <Textarea 
                                        placeholder="Tapez votre réponse au client..."
                                        className="bg-gray-700/50 border-gray-600 text-white text-base min-h-[120px]"
                                        rows={4}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                        <label className="text-gray-300 text-sm font-medium">Assigner à</label>
                                        <Select>
                                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white text-base h-12">
                                            <SelectValue placeholder="Sélectionner un membre de l'équipe" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {staffMembers.map(staff => (
                                              <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-gray-300 text-sm font-medium">Nouveau statut</label>
                                        <Select>
                                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white text-base h-12">
                                            <SelectValue placeholder="Modifier le statut" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {ticketStatuses.map(status => (
                                              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-gray-600">
                                  <Button variant="outline" className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500 hover:bg-red-500/10 text-base font-medium h-12">
                                    <X className="w-5 h-5 mr-3" />
                                    Clôturer définitivement
                                  </Button>
                                  <div className="flex space-x-4">
                                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-base font-medium h-12 px-6">
                                      Annuler
                                    </Button>
                                    <Button className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0 text-base font-medium h-12 px-8">
                                      <Reply className="w-5 h-5 mr-3" />
                                      Envoyer la réponse
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredTickets.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun ticket trouvé</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}