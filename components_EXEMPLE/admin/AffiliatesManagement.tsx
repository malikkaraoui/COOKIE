import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Plus,
  Search,
  Users,
  DollarSign,
  MousePointer,
  Trophy,
  Copy,
  CreditCard,
  ExternalLink,
  TrendingUp,
  Star
} from 'lucide-react';

export function AffiliatesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data
  const affiliatesKPIs = {
    totalAffiliates: 156,
    activeAffiliates: 89,
    totalClicks: 12847,
    totalCommissions: 18650,
    avgCommissionRate: 15,
    topAffiliate: { name: 'Alex Digital', commissions: 2850 }
  };

  const affiliates = [
    {
      id: '1',
      name: 'Alex Digital',
      email: 'alex@digitalinfluence.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      joinedDate: '2024-10-15',
      modulesPromoted: ['IA Marketing Avancé', 'SEO Technique'],
      totalSales: 47,
      commissions: 2850,
      commissionRate: 20,
      clicks: 1247,
      conversionRate: 3.8,
      affiliateLink: 'https://start.academy/?ref=alex_digital',
      socialFollowers: 25400,
      platform: 'Instagram'
    },
    {
      id: '2',
      name: 'Marie Influence',
      email: 'marie@marieinfluence.fr',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b512?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      joinedDate: '2024-11-20',
      modulesPromoted: ['E-commerce Pro', 'Copywriting'],
      totalSales: 32,
      commissions: 1960,
      commissionRate: 15,
      clicks: 892,
      conversionRate: 3.6,
      affiliateLink: 'https://start.academy/?ref=marie_influence',
      socialFollowers: 18200,
      platform: 'TikTok'
    },
    {
      id: '3',
      name: 'Pierre Business',
      email: 'pierre@businessgrowth.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      joinedDate: '2024-12-05',
      modulesPromoted: ['Branding Personnel'],
      totalSales: 18,
      commissions: 1080,
      commissionRate: 15,
      clicks: 534,
      conversionRate: 3.4,
      affiliateLink: 'https://start.academy/?ref=pierre_business',
      socialFollowers: 12800,
      platform: 'LinkedIn'
    },
    {
      id: '4',
      name: 'Sophie Marketing',
      email: 'sophie@marketingpro.fr',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'inactive',
      joinedDate: '2024-09-12',
      modulesPromoted: ['Analytics Avancées'],
      totalSales: 8,
      commissions: 480,
      commissionRate: 15,
      clicks: 298,
      conversionRate: 2.7,
      affiliateLink: 'https://start.academy/?ref=sophie_marketing',
      socialFollowers: 8900,
      platform: 'YouTube'
    }
  ];

  const modules = ['IA Marketing Avancé', 'SEO Technique', 'E-commerce Pro', 'Copywriting', 'Branding Personnel', 'Analytics Avancées'];

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-500 text-white text-xs">
        Actif
      </Badge>
    ) : (
      <Badge className="bg-gray-500 text-white text-xs">
        Inactif
      </Badge>
    );
  };

  const getPlatformIcon = (platform: string) => {
    return <Star className="w-4 h-4 text-yellow-500" />;
  };

  const copyAffiliateLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // Ici on pourrait ajouter une notification toast
  };

  const filteredAffiliates = affiliates.filter(affiliate => {
    const matchesSearch = 
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || affiliate.modulesPromoted.includes(filterModule);
    const matchesStatus = filterStatus === 'all' || affiliate.status === filterStatus;
    
    return matchesSearch && matchesModule && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Top 5 affiliés pour les KPIs
  const topAffiliates = affiliates
    .sort((a, b) => b.commissions - a.commissions)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Affiliés : {affiliatesKPIs.totalAffiliates}</h1>
          <p className="text-gray-400">Gestion des micro-influenceurs et affiliés START</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Payer commissions
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Créer un affilié
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Créer un nouvel affilié</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Nom de l'affilié</Label>
                    <Input placeholder="Ex: Alex Digital" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <Input placeholder="alex@digitalinfluence.com" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Plateforme principale</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Nombre d'abonnés</Label>
                    <Input type="number" placeholder="25400" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Taux de commission (%)</Label>
                  <Input type="number" placeholder="15" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300">Modules à promouvoir</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Sélectionner des modules" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module} value={module}>{module}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-gray-600 text-gray-300">
                    Annuler
                  </Button>
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0">
                    Créer l'affilié
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Affiliés actifs</p>
                <p className="text-2xl text-white">{affiliatesKPIs.activeAffiliates}</p>
                <p className="text-green-400 text-sm">sur {affiliatesKPIs.totalAffiliates} total</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clics totaux</p>
                <p className="text-2xl text-white">{affiliatesKPIs.totalClicks.toLocaleString()}</p>
                <p className="text-blue-400 text-sm">Ce mois</p>
              </div>
              <MousePointer className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Commissions</p>
                <p className="text-2xl text-white">{affiliatesKPIs.totalCommissions.toLocaleString()}€</p>
                <p className="text-orange-400 text-sm">Générées ce mois</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top affilié</p>
                <p className="text-lg text-white">{affiliatesKPIs.topAffiliate.name}</p>
                <p className="text-cyan-400 text-sm">{affiliatesKPIs.topAffiliate.commissions}€</p>
              </div>
              <Trophy className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 affiliés */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top 5 Affiliés du mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAffiliates.map((affiliate, index) => (
              <div key={affiliate.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={affiliate.avatar} alt={affiliate.name} />
                    <AvatarFallback className="bg-gray-600 text-white text-xs">
                      {affiliate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm">{affiliate.name}</p>
                    <p className="text-gray-400 text-xs">{affiliate.platform} • {affiliate.socialFollowers.toLocaleString()} followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-medium">{affiliate.commissions}€</p>
                  <p className="text-gray-400 text-xs">{affiliate.totalSales} ventes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un affilié..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Module promu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des affiliés */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-left">
                  <th className="p-4 text-gray-400 text-sm">Affilié</th>
                  <th className="p-4 text-gray-400 text-sm">Statut</th>
                  <th className="p-4 text-gray-400 text-sm">Ventes</th>
                  <th className="p-4 text-gray-400 text-sm">Commissions</th>
                  <th className="p-4 text-gray-400 text-sm">Conversion</th>
                  <th className="p-4 text-gray-400 text-sm">Module promu</th>
                  <th className="p-4 text-gray-400 text-sm">Lien affilié</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={affiliate.avatar} alt={affiliate.name} />
                          <AvatarFallback className="bg-gray-600 text-white text-xs">
                            {affiliate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm">{affiliate.name}</p>
                          <p className="text-gray-400 text-xs">{affiliate.email}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            {getPlatformIcon(affiliate.platform)}
                            <span className="text-gray-400 text-xs">{affiliate.socialFollowers.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(affiliate.status)}
                    </td>
                    <td className="p-4">
                      <div className="text-white text-sm">{affiliate.totalSales}</div>
                      <div className="text-gray-400 text-xs">{affiliate.clicks} clics</div>
                    </td>
                    <td className="p-4">
                      <div className="text-orange-400 text-sm font-medium">{affiliate.commissions}€</div>
                      <div className="text-gray-400 text-xs">{affiliate.commissionRate}% taux</div>
                    </td>
                    <td className="p-4">
                      <div className="text-cyan-400 text-sm">{affiliate.conversionRate}%</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {affiliate.modulesPromoted.slice(0, 2).map(module => (
                          <Badge key={module} variant="outline" className="border-gray-600 text-gray-300 text-xs block">
                            {module}
                          </Badge>
                        ))}
                        {affiliate.modulesPromoted.length > 2 && (
                          <span className="text-gray-400 text-xs">+{affiliate.modulesPromoted.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyAffiliateLink(affiliate.affiliateLink)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
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

      {filteredAffiliates.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun affilié trouvé</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}