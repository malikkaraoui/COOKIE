import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { 
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  User,
  Calendar,
  Briefcase,
  FileText,
  Eye,
  Edit,
  MessageSquare,
  Download,
  RefreshCw,
  Target,
  Zap,
  TrendingUp,
  CheckSquare
} from 'lucide-react';

export function ServicesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterResponsible, setFilterResponsible] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Mock data enrichie
  const servicesKPIs = {
    totalServices: 12,
    inProgress: 8,
    delivered: 156,
    avgDeliveryTime: 5.2,
    revenue: 45680,
    pendingServices: 4
  };

  const services = [
    {
      id: '1',
      name: 'Design Logo + Identité',
      client: 'Marie Dupont',
      clientEmail: 'marie.dupont@email.com',
      clientAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b512?w=150&h=150&fit=crop&crop=face',
      status: 'in-progress',
      startDate: '2025-01-15',
      deliveryDate: '2025-01-30',
      responsible: 'Alex Design',
      responsibleAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      price: 450,
      description: 'Création complète de l\'identité visuelle avec logo, charte graphique et déclinaisons',
      detailedDescription: 'Projet de création d\'identité visuelle complète pour une startup technologique. Comprend la conception du logo principal, développement de la charte graphique, création de mockups d\'application sur différents supports, et déclinaisons pour tous les canaux de communication.',
      deliverables: ['Logo vectoriel (AI, EPS, SVG)', 'Charte graphique complète', 'Mockups application', 'Déclinaisons couleurs', 'Guide d\'utilisation'],
      progress: 65,
      category: 'Design',
      priority: 'high',
      clientBrief: 'Besoin d\'une identité moderne et tech pour séduire les investisseurs et clients B2B',
      objectives: [
        'Créer une identité mémorable et professionnelle',
        'Assurer la cohérence sur tous les supports',
        'Transmettre les valeurs d\'innovation et de fiabilité'
      ],
      timeline: [
        { date: '2025-01-15', task: 'Briefing client et recherches', completed: true },
        { date: '2025-01-18', task: 'Concepts et moodboards', completed: true },
        { date: '2025-01-22', task: 'Présentation 3 propositions', completed: true },
        { date: '2025-01-25', task: 'Finalisation logo choisi', completed: false },
        { date: '2025-01-28', task: 'Charte graphique', completed: false },
        { date: '2025-01-30', task: 'Livrables finaux', completed: false }
      ],
      communications: [
        { date: '2025-01-22', message: 'Présentation des 3 concepts - Client satisfait de la direction créative', type: 'update' },
        { date: '2025-01-20', message: 'Validation du brief et des références visuelles', type: 'milestone' }
      ],
      files: [
        { name: 'Brief_initial_v1.pdf', type: 'pdf', size: '2.4 MB' },
        { name: 'Moodboard_concepts.png', type: 'image', size: '8.7 MB' },
        { name: 'Logo_propositions_v1.ai', type: 'design', size: '12.3 MB' }
      ]
    },
    {
      id: '2',
      name: 'Audit SEO Complet',
      client: 'Pierre Martin',
      clientEmail: 'pierre.martin@email.com',
      clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'pending',
      startDate: '2025-01-20',
      deliveryDate: '2025-01-25',
      responsible: 'Sophie SEO',
      responsibleAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      price: 299,
      description: 'Analyse technique complète du site avec recommandations d\'optimisation',
      detailedDescription: 'Audit SEO complet d\'un site e-commerce incluant l\'analyse technique, sémantique, structurelle et concurrentielle. Livraison d\'un rapport détaillé avec plan d\'action priorisé.',
      deliverables: ['Rapport SEO technique (50+ pages)', 'Plan d\'action priorisé', 'Liste de mots-clés cibles', 'Benchmark concurrentiel', 'Recommandations techniques'],
      progress: 0,
      category: 'SEO',
      priority: 'medium',
      clientBrief: 'Site e-commerce qui ne décolle pas en référencement naturel malgré 2 ans d\'existence',
      objectives: [
        'Identifier les blocages techniques majeurs',
        'Définir une stratégie de contenu efficace',
        'Surpasser 3 concurrents principaux dans les SERP'
      ],
      timeline: [
        { date: '2025-01-20', task: 'Crawl technique du site', completed: false },
        { date: '2025-01-21', task: 'Analyse sémantique et mots-clés', completed: false },
        { date: '2025-01-22', task: 'Benchmark concurrentiel', completed: false },
        { date: '2025-01-24', task: 'Rédaction du rapport', completed: false },
        { date: '2025-01-25', task: 'Présentation des recommandations', completed: false }
      ],
      communications: [
        { date: '2025-01-19', message: 'Envoi des accès Google Analytics et Search Console', type: 'info' }
      ],
      files: [
        { name: 'Acces_outils_analytics.txt', type: 'text', size: '1.2 KB' }
      ]
    },
    {
      id: '3',
      name: 'Création Tunnel de Vente',
      client: 'Alex Dubois',
      clientEmail: 'alex.dubois@email.com',
      clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'delivered',
      startDate: '2025-01-10',
      deliveryDate: '2025-01-18',
      responsible: 'Lucas Dev',
      responsibleAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      price: 650,
      description: 'Développement d\'un tunnel de vente optimisé avec pages de capture et checkout',
      detailedDescription: 'Création d\'un tunnel de vente complet avec landing page haute conversion, système de checkout optimisé, intégration paiement Stripe, et tableau de bord analytics. Solution clé en main pour lancer une offre digitale.',
      deliverables: ['Landing page responsive', 'Pages de checkout optimisées', 'Intégration Stripe complète', 'Dashboard analytique', 'Documentation technique'],
      progress: 100,
      category: 'Développement',
      priority: 'high',
      clientBrief: 'Lancement d\'un produit digital avec besoin d\'un tunnel de conversion performant',
      objectives: [
        'Maximiser le taux de conversion visiteur → client',
        'Simplifier au maximum le processus d\'achat',
        'Intégrer un suivi analytique précis'
      ],
      timeline: [
        { date: '2025-01-10', task: 'Wireframes et UX du tunnel', completed: true },
        { date: '2025-01-12', task: 'Design des pages', completed: true },
        { date: '2025-01-14', task: 'Développement front-end', completed: true },
        { date: '2025-01-16', task: 'Intégration Stripe', completed: true },
        { date: '2025-01-17', task: 'Tests et optimisations', completed: true },
        { date: '2025-01-18', task: 'Mise en ligne et formation', completed: true }
      ],
      communications: [
        { date: '2025-01-18', message: 'Tunnel livré et mis en ligne - Formation réalisée avec le client', type: 'completion' },
        { date: '2025-01-16', message: 'Tests de paiement validés - Prêt pour mise en ligne', type: 'milestone' },
        { date: '2025-01-12', message: 'Validation des designs par le client', type: 'approval' }
      ],
      files: [
        { name: 'Tunnel_final_live.zip', type: 'archive', size: '45.2 MB' },
        { name: 'Documentation_technique.pdf', type: 'pdf', size: '5.8 MB' },
        { name: 'Guide_utilisation_admin.pdf', type: 'pdf', size: '3.2 MB' }
      ]
    },
    {
      id: '4',
      name: 'Pack Réseaux Sociaux',
      client: 'Sophie Laurent',
      clientEmail: 'sophie.laurent@email.com',
      clientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'in-progress',
      startDate: '2025-01-18',
      deliveryDate: '2025-01-28',
      responsible: 'Emma Social',
      responsibleAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b512?w=150&h=150&fit=crop&crop=face',
      price: 350,
      description: 'Création de contenu pour Instagram, LinkedIn et TikTok pendant 1 mois',
      detailedDescription: 'Pack complet de contenus pour les réseaux sociaux incluant la stratégie éditoriale, création visuelle, rédaction des posts, et programmation. Adapté aux codes de chaque plateforme pour maximiser l\'engagement.',
      deliverables: ['30 posts Instagram + stories', '15 posts LinkedIn + articles', '10 vidéos TikTok', 'Calendrier éditorial', 'Hashtags et stratégie'],
      progress: 40,
      category: 'Social Media',
      priority: 'medium',
      clientBrief: 'Besoin d\'une présence digitale cohérente pour développer sa personal brand de coach',
      objectives: [
        'Développer la notoriété et l\'engagement',
        'Générer des leads qualifiés',
        'Positionner l\'expertise coaching'
      ],
      timeline: [
        { date: '2025-01-18', task: 'Définition de la stratégie éditoriale', completed: true },
        { date: '2025-01-20', task: 'Création du calendrier éditorial', completed: true },
        { date: '2025-01-22', task: 'Semaine 1 - Contenus Instagram', completed: false },
        { date: '2025-01-24', task: 'Semaine 1 - Contenus LinkedIn', completed: false },
        { date: '2025-01-26', task: 'Semaine 1 - Vidéos TikTok', completed: false },
        { date: '2025-01-28', task: 'Livraison pack complet', completed: false }
      ],
      communications: [
        { date: '2025-01-20', message: 'Validation du calendrier éditorial et des thématiques', type: 'approval' },
        { date: '2025-01-18', message: 'Brief créatif validé - Ton et style définis', type: 'milestone' }
      ],
      files: [
        { name: 'Calendrier_editorial_janvier.xlsx', type: 'spreadsheet', size: '2.1 MB' },
        { name: 'Charte_graphique_social.pdf', type: 'pdf', size: '4.7 MB' },
        { name: 'Brief_creativ_valide.docx', type: 'document', size: '890 KB' }
      ]
    }
  ];

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
    'in-progress': { label: 'En cours', color: 'bg-blue-500', icon: AlertTriangle },
    delivered: { label: 'Livré', color: 'bg-green-500', icon: CheckCircle }
  };

  const priorityConfig = {
    low: { label: 'Faible', color: 'bg-gray-500' },
    medium: { label: 'Moyenne', color: 'bg-yellow-500' },
    high: { label: 'Élevée', color: 'bg-red-500' }
  };

  const categoryConfig = {
    'Design': { color: 'bg-purple-500', icon: Target },
    'SEO': { color: 'bg-green-500', icon: TrendingUp },
    'Développement': { color: 'bg-blue-500', icon: Zap },
    'Social Media': { color: 'bg-pink-500', icon: MessageSquare }
  };

  const responsibles = ['Alex Design', 'Sophie SEO', 'Lucas Dev', 'Emma Social', 'Tom Marketing'];

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white text-xs flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const config = categoryConfig[category as keyof typeof categoryConfig];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} text-white border-0 text-xs flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {category}
      </Badge>
    );
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    const matchesResponsible = filterResponsible === 'all' || service.responsible === filterResponsible;
    
    return matchesSearch && matchesStatus && matchesResponsible;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleServiceDetails = (service: any) => {
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-400" />;
      case 'image': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'design': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'archive': return <FileText className="w-4 h-4 text-yellow-400" />;
      case 'spreadsheet': return <FileText className="w-4 h-4 text-green-400" />;
      case 'document': return <FileText className="w-4 h-4 text-blue-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Services en cours : {servicesKPIs.totalServices}</h1>
          <p className="text-gray-400">Gestion des services à la carte</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E1E1E] border-gray-600 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b border-gray-600">
              <DialogTitle className="text-white text-2xl font-semibold">Créer un nouveau service</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configurez les détails du service à la carte
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-8">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                <h3 className="text-white text-lg font-semibold mb-6">Informations générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Nom du service</Label>
                    <Input 
                      placeholder="Ex: Design Logo + Identité" 
                      className="bg-gray-700/50 border-gray-600 text-white text-base h-12" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Client</Label>
                    <Input 
                      placeholder="Nom du client" 
                      className="bg-gray-700/50 border-gray-600 text-white text-base h-12" 
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-6">
                  <Label className="text-gray-300 text-sm font-medium">Description détaillée</Label>
                  <Textarea 
                    placeholder="Description complète du service, objectifs, périmètre d'intervention..." 
                    className="bg-gray-700/50 border-gray-600 text-white text-base min-h-[120px]" 
                    rows={4} 
                  />
                </div>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                <h3 className="text-white text-lg font-semibold mb-6">Planning &amp; Tarification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Prix (€)</Label>
                    <Input 
                      type="number" 
                      placeholder="450" 
                      className="bg-gray-700/50 border-gray-600 text-white text-base h-12" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Date de début</Label>
                    <Input 
                      type="date" 
                      className="bg-gray-700/50 border-gray-600 text-white text-base h-12" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Date de livraison</Label>
                    <Input 
                      type="date" 
                      className="bg-gray-700/50 border-gray-600 text-white text-base h-12" 
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-6">
                  <Label className="text-gray-300 text-sm font-medium">Responsable du projet</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white text-base h-12">
                      <SelectValue placeholder="Sélectionner un responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsibles.map(resp => (
                        <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                <h3 className="text-white text-lg font-semibold mb-6">Livrables attendus</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Liste des livrables</Label>
                    <Textarea 
                      placeholder="• Logo vectoriel (AI, EPS)&#10;• Charte graphique complète&#10;• Mockups d'application&#10;• Déclinaisons couleurs"
                      className="bg-gray-700/50 border-gray-600 text-white text-base min-h-[100px]" 
                      rows={4} 
                    />
                  </div>
                  <p className="text-gray-400 text-sm">Listez chaque livrable attendu, un par ligne</p>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-600">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)} 
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-base font-medium h-12 px-6"
                >
                  Annuler
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white border-0 text-base font-medium h-12 px-8">
                  <Plus className="w-5 h-5 mr-3" />
                  Créer le service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Services actifs</p>
                <p className="text-2xl text-white">{servicesKPIs.inProgress}</p>
                <p className="text-blue-400 text-sm">{servicesKPIs.pendingServices} en attente</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Services livrés</p>
                <p className="text-2xl text-white">{servicesKPIs.delivered}</p>
                <p className="text-green-400 text-sm">Total historique</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Temps moyen</p>
                <p className="text-2xl text-white">{servicesKPIs.avgDeliveryTime}j</p>
                <p className="text-orange-400 text-sm">Délai de livraison</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CA Services</p>
                <p className="text-2xl text-white">{servicesKPIs.revenue.toLocaleString()}€</p>
                <p className="text-cyan-400 text-sm">Ce mois</p>
              </div>
              <Calendar className="w-8 h-8 text-cyan-400" />
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
                placeholder="Rechercher un service..."
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
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResponsible} onValueChange={setFilterResponsible}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous responsables</SelectItem>
                {responsibles.map(resp => (
                  <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{service.name}</CardTitle>
                  <p className="text-gray-400 text-sm">{service.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {getStatusBadge(service.status)}
                  {getCategoryBadge(service.category)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Client */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={service.clientAvatar} alt={service.client} />
                  <AvatarFallback className="bg-gray-600 text-white text-xs">
                    {service.client.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white text-sm">{service.client}</p>
                  <p className="text-gray-400 text-xs">{service.clientEmail}</p>
                </div>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Prix</p>
                  <p className="text-green-400 font-medium">{service.price}€</p>
                </div>
                <div>
                  <p className="text-gray-400">Responsable</p>
                  <p className="text-white">{service.responsible}</p>
                </div>
                <div>
                  <p className="text-gray-400">Début</p>
                  <p className="text-white">{formatDate(service.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Livraison</p>
                  <p className="text-white">{formatDate(service.deliveryDate)}</p>
                </div>
              </div>

              {/* Progression */}
              {service.status !== 'pending' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white">{service.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${service.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Livrables */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Livrables :</p>
                <div className="space-y-1">
                  {service.deliverables.slice(0, 3).map((deliverable, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300 text-xs">{deliverable}</span>
                    </div>
                  ))}
                  {service.deliverables.length > 3 && (
                    <p className="text-gray-500 text-xs ml-5">+{service.deliverables.length - 3} autres...</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                  onClick={() => handleServiceDetails(service)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Détails
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                  <Upload className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modale de détails du service */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-600 w-[90%] max-w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b border-gray-600">
            <DialogTitle className="text-white text-2xl font-semibold">
              {selectedService?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Service #{selectedService?.id} - Détails complets et suivi
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="p-8 space-y-8">
              {/* Informations principales */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                    <h3 className="text-white text-lg font-semibold mb-6">Informations du projet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm font-medium">Client</p>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={selectedService.clientAvatar} alt={selectedService.client} />
                              <AvatarFallback className="bg-gray-600 text-white">
                                {selectedService.client.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-base font-medium">{selectedService.client}</p>
                              <p className="text-gray-400 text-sm">{selectedService.clientEmail}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm font-medium">Responsable</p>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={selectedService.responsibleAvatar} alt={selectedService.responsible} />
                              <AvatarFallback className="bg-gray-600 text-white">
                                {selectedService.responsible.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-base font-medium">{selectedService.responsible}</p>
                              <p className="text-gray-400 text-sm">Chef de projet</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm font-medium">Statut &amp; Catégorie</p>
                          <div className="flex flex-wrap gap-2">
                            {getStatusBadge(selectedService.status)}
                            {getCategoryBadge(selectedService.category)}
                            {getPriorityBadge(selectedService.priority)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm font-medium">Tarification &amp; Planning</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs">Prix</p>
                              <p className="text-green-400 text-lg font-semibold">{selectedService.price}€</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Livraison</p>
                              <p className="text-white text-sm">{formatDate(selectedService.deliveryDate)}</p>
                            </div>
                          </div>
                        </div>
                        
                        {selectedService.status !== 'pending' && (
                          <div className="space-y-2">
                            <p className="text-gray-300 text-sm font-medium">Progression</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">{selectedService.progress}%</span>
                                <span className="text-gray-400">Terminé</span>
                              </div>
                              <Progress value={selectedService.progress} className="h-3" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                    <h3 className="text-white text-lg font-semibold mb-6">Description &amp; Objectifs</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm font-medium">Brief client</p>
                        <p className="text-gray-300 text-base leading-relaxed">{selectedService.clientBrief}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm font-medium">Description détaillée</p>
                        <p className="text-gray-300 text-base leading-relaxed">{selectedService.detailedDescription}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm font-medium">Objectifs du projet</p>
                        <ul className="space-y-2">
                          {selectedService.objectives.map((objective: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Target className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                    <h3 className="text-white text-lg font-semibold mb-6">Timeline &amp; Jalons</h3>
                    <div className="space-y-4">
                      {selectedService.timeline.map((step: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            step.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-400 bg-transparent'
                          }`}>
                            {step.completed && <CheckSquare className="w-2 h-2 text-white m-0.5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className={`text-sm ${
                                step.completed ? 'text-gray-300' : 'text-white font-medium'
                              }`}>
                                {step.task}
                              </p>
                              <p className="text-gray-400 text-xs">{formatDate(step.date)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                    <h3 className="text-white text-lg font-semibold mb-6">Livrables</h3>
                    <div className="space-y-3">
                      {selectedService.deliverables.map((deliverable: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700/30 rounded">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span className="text-white text-sm">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                    <h3 className="text-white text-lg font-semibold mb-6">Fichiers &amp; Documents</h3>
                    <div className="space-y-3">
                      {selectedService.files.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-600/20">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="text-white text-sm font-medium">{file.name}</p>
                              <p className="text-gray-400 text-xs">{file.size}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/30">
                    <h3 className="text-white text-lg font-semibold mb-6">Communications</h3>
                    <div className="space-y-4">
                      {selectedService.communications.map((comm: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-700/30 rounded border border-gray-600/20">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className={`text-xs ${
                              comm.type === 'completion' ? 'border-green-500 text-green-400' :
                              comm.type === 'milestone' ? 'border-blue-500 text-blue-400' :
                              comm.type === 'approval' ? 'border-purple-500 text-purple-400' :
                              'border-gray-500 text-gray-400'
                            }`}>
                              {comm.type === 'completion' ? 'Terminé' :
                               comm.type === 'milestone' ? 'Étape' :
                               comm.type === 'approval' ? 'Validation' : 'Info'}
                            </Badge>
                            <span className="text-gray-400 text-xs">{formatDate(comm.date)}</span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{comm.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white border-0 text-base font-medium h-12">
                      <MessageSquare className="w-5 h-5 mr-3" />
                      Contacter le client
                    </Button>
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-base font-medium h-12">
                      <Edit className="w-5 h-5 mr-3" />
                      Modifier le projet
                    </Button>
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-base font-medium h-12">
                      <RefreshCw className="w-5 h-5 mr-3" />
                      Mettre à jour statut
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredServices.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun service trouvé</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}