import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Search,
  Filter,
  UserPlus,
  Eye,
  Gift,
  Ban,
  RefreshCw,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';

export function ClientsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Mock data
  const clients = [
    {
      id: '1',
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b512?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      registeredAt: '2024-12-15',
      lastAccess: '2025-01-22',
      totalSpent: 750,
      modulesUnlocked: 3,
      totalModules: 32,
      progress: 68,
      source: 'organic',
      tags: ['Premium', 'IA Expert'],
      purchases: [
        { module: 'IA Marketing Avancé', date: '2024-12-15', amount: 250 },
        { module: 'SEO Technique', date: '2025-01-05', amount: 199 },
        { module: 'E-commerce Pro', date: '2025-01-20', amount: 299 }
      ]
    },
    {
      id: '2',
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@email.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      registeredAt: '2024-11-20',
      lastAccess: '2025-01-21',
      totalSpent: 449,
      modulesUnlocked: 2,
      totalModules: 32,
      progress: 45,
      source: 'affiliate',
      tags: ['SEO Specialist'],
      purchases: [
        { module: 'SEO Technique', date: '2024-11-20', amount: 199 },
        { module: 'Copywriting Émotionnel', date: '2024-12-10', amount: 149 }
      ]
    },
    {
      id: '3',
      firstName: 'Sophie',
      lastName: 'Laurent',
      email: 'sophie.laurent@email.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'inactive',
      registeredAt: '2024-10-05',
      lastAccess: '2024-12-15',
      totalSpent: 250,
      modulesUnlocked: 1,
      totalModules: 32,
      progress: 25,
      source: 'ads',
      tags: ['Débutant'],
      purchases: [
        { module: 'IA Marketing Avancé', date: '2024-10-05', amount: 250 }
      ]
    },
    {
      id: '4',
      firstName: 'Alex',
      lastName: 'Dubois',
      email: 'alex.dubois@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'suspended',
      registeredAt: '2024-09-12',
      lastAccess: '2024-11-30',
      totalSpent: 149,
      modulesUnlocked: 1,
      totalModules: 32,
      progress: 10,
      source: 'organic',
      tags: ['Problématique'],
      purchases: [
        { module: 'Copywriting Émotionnel', date: '2024-09-12', amount: 149 }
      ]
    }
  ];

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalRevenue: clients.reduce((sum, client) => sum + client.totalSpent, 0),
    avgSpentPerClient: clients.reduce((sum, client) => sum + client.totalSpent, 0) / clients.length
  };

  const sources = [
    { value: 'organic', label: 'Organique' },
    { value: 'ads', label: 'Publicité' },
    { value: 'affiliate', label: 'Affiliation' },
    { value: 'referral', label: 'Parrainage' }
  ];

  const statusConfig = {
    active: { label: 'Actif', color: 'bg-green-500' },
    inactive: { label: 'Inactif', color: 'bg-yellow-500' },
    suspended: { label: 'Suspendu', color: 'bg-red-500' }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    const matchesSource = filterSource === 'all' || client.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Gestion des Clients</h1>
          <p className="text-gray-400">Gérez vos utilisateurs et leur progression</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total clients</p>
                <p className="text-2xl text-white">{stats.totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clients actifs</p>
                <p className="text-2xl text-white">{stats.activeClients}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CA total</p>
                <p className="text-2xl text-white">{stats.totalRevenue.toLocaleString()}€</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Panier moyen</p>
                <p className="text-2xl text-white">{Math.round(stats.avgSpentPerClient)}€</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400" />
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
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des clients */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-left">
                  <th className="p-4 text-gray-400 text-sm">Client</th>
                  <th className="p-4 text-gray-400 text-sm">Statut</th>
                  <th className="p-4 text-gray-400 text-sm">Modules</th>
                  <th className="p-4 text-gray-400 text-sm">Progression</th>
                  <th className="p-4 text-gray-400 text-sm">CA Total</th>
                  <th className="p-4 text-gray-400 text-sm">Dernier accès</th>
                  <th className="p-4 text-gray-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={client.avatar} alt={`${client.firstName} ${client.lastName}`} />
                          <AvatarFallback className="bg-gray-600 text-white">
                            {client.firstName[0]}{client.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white">{client.firstName} {client.lastName}</p>
                          <p className="text-gray-400 text-sm">{client.email}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="p-4">
                      <div className="text-white">{client.modulesUnlocked}/{client.totalModules}</div>
                      <div className="text-gray-400 text-sm">modules</div>
                    </td>
                    <td className="p-4">
                      <div className="w-24">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{client.progress}%</span>
                        </div>
                        <Progress value={client.progress} className="h-2 bg-gray-700" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{client.totalSpent}€</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-400 text-sm">{formatDate(client.lastAccess)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => setSelectedClient(client)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#1E1E1E] border-gray-600 max-w-5xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="pb-6 border-b border-gray-600">
                              <DialogTitle className="text-white text-2xl font-semibold">
                                Fiche Client - {selectedClient?.firstName} {selectedClient?.lastName}
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Informations détaillées et gestion du client
                              </DialogDescription>
                            </DialogHeader>
                            {selectedClient && (
                              <div className="p-8 space-y-8">
                                {/* Informations principales */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                  <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                                      <h3 className="text-white text-lg font-semibold mb-6">Informations personnelles</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Nom complet</p>
                                          <p className="text-white text-base">{selectedClient.firstName} {selectedClient.lastName}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Email</p>
                                          <p className="text-white text-base">{selectedClient.email}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Date d'inscription</p>
                                          <p className="text-white text-base">{formatDate(selectedClient.registeredAt)}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Dernier accès</p>
                                          <p className="text-white text-base">{formatDate(selectedClient.lastAccess)}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Source d'acquisition</p>
                                          <p className="text-white text-base">{sources.find(s => s.value === selectedClient.source)?.label}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Tags</p>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedClient.tags.map(tag => (
                                              <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800">
                                                {tag}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                                      <h3 className="text-white text-lg font-semibold mb-6">Historique des achats</h3>
                                      <div className="space-y-4">
                                        {selectedClient.purchases.map((purchase: any, index: number) => (
                                          <div key={index} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                                            <div className="space-y-1">
                                              <p className="text-white text-base font-medium">{purchase.module}</p>
                                              <p className="text-gray-400 text-sm">{formatDate(purchase.date)}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-green-400 text-lg font-semibold">{purchase.amount}€</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-6">
                                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                                      <h3 className="text-white text-lg font-semibold mb-6">Statut &amp; Métriques</h3>
                                      <div className="space-y-6">
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Statut du compte</p>
                                          {getStatusBadge(selectedClient.status)}
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Progression globale</p>
                                          <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                              <span className="text-gray-400">{selectedClient.progress}%</span>
                                              <span className="text-gray-400">{selectedClient.modulesUnlocked}/{selectedClient.totalModules} modules</span>
                                            </div>
                                            <Progress value={selectedClient.progress} className="h-3" />
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <p className="text-gray-300 text-sm font-medium">Chiffre d'affaires total</p>
                                          <p className="text-white text-2xl font-bold">{selectedClient.totalSpent}€</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 text-base font-medium h-12">
                                        <Mail className="w-5 h-5 mr-3" />
                                        Contacter le client
                                      </Button>
                                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-base font-medium h-12">
                                        <Gift className="w-5 h-5 mr-3" />
                                        Offrir un module
                                      </Button>
                                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-base font-medium h-12">
                                        <RefreshCw className="w-5 h-5 mr-3" />
                                        Reset progression
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Gift className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                          <Ban className="w-4 h-4" />
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

      {filteredClients.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun client trouvé</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}