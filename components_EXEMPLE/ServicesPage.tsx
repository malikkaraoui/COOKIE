import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Search, 
  ShoppingBag, 
  Clock, 
  Star, 
  Upload, 
  Eye, 
  Download, 
  MessageCircle,
  Zap,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  priceLabel: string;
  deliveryTime: string;
  category: string;
  thumbnail: string;
  gallery: string[];
  isNew?: boolean;
  isPopular?: boolean;
  rating: number;
  reviewsCount: number;
  includes: string[];
  options: { name: string; price: number }[];
}

interface UserService {
  id: string;
  serviceName: string;
  status: 'waiting' | 'in-progress' | 'delivered';
  orderDate: string;
  estimatedDelivery: string;
  price: number;
}

export function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Mock services data
  const services: Service[] = [
    {
      id: '1',
      name: 'Création de logo professionnel',
      shortDescription: 'Logo vectoriel + déclinaisons',
      description: 'Création d\'un logo professionnel unique avec toutes les déclinaisons nécessaires pour votre marque. Inclut les fichiers vectoriels, PNG, et guide d\'utilisation.',
      price: 149,
      priceLabel: 'à partir de 149€',
      deliveryTime: '48h max',
      category: 'branding',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop'
      ],
      isPopular: true,
      rating: 4.8,
      reviewsCount: 127,
      includes: [
        'Logo principal vectoriel (AI, EPS, SVG)',
        '3 déclinaisons couleur',
        'Version noir & blanc',
        'Guide d\'utilisation',
        'Mockups de présentation'
      ],
      options: [
        { name: 'Couleur supplémentaire', price: 30 },
        { name: 'Animation logo (GIF)', price: 80 },
        { name: 'Charte graphique complète', price: 150 }
      ]
    },
    {
      id: '2',
      name: 'Tunnel de vente optimisé',
      shortDescription: 'Landing page + checkout',
      description: 'Création d\'un tunnel de vente complet avec landing page optimisée pour la conversion, formulaire de capture et page de checkout intégrée.',
      price: 399,
      priceLabel: 'à partir de 399€',
      deliveryTime: '5 jours',
      category: 'tunnel',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
      ],
      isNew: true,
      rating: 4.9,
      reviewsCount: 89,
      includes: [
        'Landing page responsive',
        'Formulaire de capture optimisé',
        'Page de checkout Stripe',
        'Tracking analytics',
        'Tests A/B inclus'
      ],
      options: [
        { name: 'Page de remerciement', price: 50 },
        { name: 'Email de suivi automatique', price: 80 },
        { name: 'Chat support intégré', price: 120 }
      ]
    },
    {
      id: '3',
      name: 'Pack créatifs réseaux sociaux',
      shortDescription: '30 posts + stories Instagram',
      description: 'Pack complet de créatifs pour vos réseaux sociaux : 30 posts Instagram, 15 stories, templates réutilisables et calendrier éditorial.',
      price: 199,
      priceLabel: 'à partir de 199€',
      deliveryTime: '72h max',
      category: 'creatives',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop'
      ],
      rating: 4.7,
      reviewsCount: 203,
      includes: [
        '30 posts Instagram (JPG/PNG)',
        '15 stories templates',
        'Templates Canva éditables',
        'Calendrier éditorial 1 mois',
        'Hashtags optimisés'
      ],
      options: [
        { name: 'Posts LinkedIn (15)', price: 60 },
        { name: 'Vidéos courtes TikTok (5)', price: 120 },
        { name: 'Calendrier 3 mois', price: 40 }
      ]
    },
    {
      id: '4',
      name: 'Audit SEO complet',
      shortDescription: 'Analyse technique + recommandations',
      description: 'Audit SEO technique complet de votre site web avec analyse détaillée et plan d\'action personnalisé pour améliorer votre référencement.',
      price: 249,
      priceLabel: 'à partir de 249€',
      deliveryTime: '48h max',
      category: 'audit',
      thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
      ],
      rating: 4.6,
      reviewsCount: 156,
      includes: [
        'Audit technique complet',
        'Analyse des mots-clés',
        'Étude de la concurrence',
        'Plan d\'action détaillé',
        'Appel de restitution 30min'
      ],
      options: [
        { name: 'Audit mensuel (3 mois)', price: 180 },
        { name: 'Optimisation 5 pages', price: 200 },
        { name: 'Netlinking recommandations', price: 100 }
      ]
    },
    {
      id: '5',
      name: 'Stratégie SEO personnalisée',
      shortDescription: 'Plan SEO sur mesure',
      description: 'Développement d\'une stratégie SEO personnalisée avec étude de marché, plan de contenu et roadmap d\'optimisation sur 6 mois.',
      price: 599,
      priceLabel: 'à partir de 599€',
      deliveryTime: '7 jours',
      category: 'seo',
      thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop'
      ],
      rating: 4.8,
      reviewsCount: 94,
      includes: [
        'Étude de marché approfondie',
        'Stratégie mots-clés 6 mois',
        'Plan de contenu détaillé',
        'Roadmap technique',
        'Formation équipe 2h'
      ],
      options: [
        { name: 'Suivi mensuel (6 mois)', price: 300 },
        { name: 'Création 10 articles', price: 400 }
      ]
    },
    {
      id: '6',
      name: 'Identité visuelle complète',
      shortDescription: 'Logo + charte + templates',
      description: 'Création d\'une identité visuelle complète : logo, charte graphique, templates de communication et guide d\'utilisation détaillé.',
      price: 799,
      priceLabel: 'à partir de 799€',
      deliveryTime: '10 jours',
      category: 'branding',
      thumbnail: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop'
      ],
      rating: 4.9,
      reviewsCount: 76,
      includes: [
        'Logo complet + déclinaisons',
        'Charte graphique 20 pages',
        'Palette couleurs + typos',
        'Templates PPT, flyers, cartes',
        'Guide d\'utilisation détaillé'
      ],
      options: [
        { name: 'Site web vitrine', price: 500 },
        { name: 'Pack print (flyers, cartes)', price: 150 }
      ]
    }
  ];

  // Mock user services
  const userServices: UserService[] = [
    {
      id: '1',
      serviceName: 'Création de logo professionnel',
      status: 'in-progress',
      orderDate: '2025-01-20',
      estimatedDelivery: '2025-01-23',
      price: 149
    },
    {
      id: '2',
      serviceName: 'Audit SEO complet',
      status: 'delivered',
      orderDate: '2025-01-15',
      estimatedDelivery: '2025-01-17',
      price: 249
    },
    {
      id: '3',
      serviceName: 'Pack créatifs réseaux sociaux',
      status: 'waiting',
      orderDate: '2025-01-22',
      estimatedDelivery: '2025-01-25',
      price: 199
    }
  ];

  const filters = [
    { id: 'all', name: 'Tous' },
    { id: 'branding', name: 'Branding' },
    { id: 'tunnel', name: 'Tunnel' },
    { id: 'creatives', name: 'Créatives' },
    { id: 'audit', name: 'Audit' },
    { id: 'seo', name: 'SEO' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || service.category === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
      'in-progress': { label: 'En cours', color: 'bg-blue-500', icon: AlertCircle },
      delivered: { label: 'Livré', color: 'bg-green-500', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white text-xs flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateTotalPrice = () => {
    if (!selectedService) return 0;
    
    let total = selectedService.price;
    selectedOptions.forEach(optionName => {
      const option = selectedService.options.find(opt => opt.name === optionName);
      if (option) total += option.price;
    });
    
    return total;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl text-white mb-2">Services à la carte</h1>
          <p className="text-gray-400 text-lg">Ajoute des prestations pour améliorer ton business, livrées par nos experts.</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 max-w-md mx-auto">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex justify-center">
            <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-200 group">
            <div className="relative">
              <ImageWithFallback 
                src={service.thumbnail}
                alt={service.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                {service.isNew && (
                  <Badge className="bg-green-500 text-white text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Nouveau
                  </Badge>
                )}
                {service.isPopular && (
                  <Badge className="bg-orange-500 text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Populaire
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-white text-lg mb-1">{service.name}</h3>
                <p className="text-gray-400 text-sm">{service.shortDescription}</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {renderStars(service.rating)}
                </div>
                <span className="text-yellow-400 text-sm">{service.rating}</span>
                <span className="text-gray-500 text-sm">({service.reviewsCount})</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-lg font-semibold">{service.priceLabel}</p>
                  <div className="flex items-center space-x-1 text-gray-400 text-sm">
                    <Clock className="w-3 h-3" />
                    <span>{service.deliveryTime}</span>
                  </div>
                </div>

                <Dialog open={isServiceModalOpen && selectedService?.id === service.id} onOpenChange={(open) => {
                  setIsServiceModalOpen(open);
                  if (!open) setSelectedService(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
                      onClick={() => {
                        setSelectedService(service);
                        setIsServiceModalOpen(true);
                        setSelectedOptions([]);
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Commander
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white text-xl">{service.name}</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Personnalisez et commandez ce service
                      </DialogDescription>
                    </DialogHeader>

                    {selectedService && (
                      <div className="space-y-6">
                        {/* Service Gallery */}
                        <Carousel className="w-full">
                          <CarouselContent>
                            {service.gallery.map((image, index) => (
                              <CarouselItem key={index}>
                                <div className="relative h-64 rounded-lg overflow-hidden">
                                  <ImageWithFallback 
                                    src={image}
                                    alt={`${service.name} - Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>

                        {/* Service Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-white text-lg mb-2">Description</h4>
                              <p className="text-gray-300 text-sm leading-relaxed">{service.description}</p>
                            </div>

                            <div>
                              <h4 className="text-white text-lg mb-2">Inclus dans ce service</h4>
                              <ul className="space-y-2">
                                {service.includes.map((item, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-1">
                                {renderStars(service.rating)}
                              </div>
                              <span className="text-yellow-400">{service.rating}</span>
                              <span className="text-gray-400">({service.reviewsCount} avis)</span>
                              <div className="flex items-center space-x-1 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>{service.deliveryTime}</span>
                              </div>
                            </div>
                          </div>

                          {/* Order Form */}
                          <div className="space-y-4">
                            <Card className="bg-gray-700 border-gray-600">
                              <CardHeader>
                                <CardTitle className="text-white">Personnalisez votre commande</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <Label className="text-gray-300 text-sm">Brief du projet</Label>
                                  <Textarea 
                                    placeholder="Décrivez votre projet, vos besoins, votre style préféré..."
                                    className="bg-gray-800 border-gray-600 text-white mt-1"
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label className="text-gray-300 text-sm">Fichiers de référence (optionnel)</Label>
                                  <div className="mt-1">
                                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700">
                                      <Upload className="w-4 h-4 mr-2" />
                                      Uploader des fichiers (PDF, images, .zip)
                                    </Button>
                                  </div>
                                </div>

                                {service.options.length > 0 && (
                                  <div>
                                    <Label className="text-gray-300 text-sm">Options supplémentaires</Label>
                                    <div className="space-y-2 mt-1">
                                      {service.options.map((option) => (
                                        <div key={option.name} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={option.name}
                                              checked={selectedOptions.includes(option.name)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setSelectedOptions([...selectedOptions, option.name]);
                                                } else {
                                                  setSelectedOptions(selectedOptions.filter(opt => opt !== option.name));
                                                }
                                              }}
                                              className="rounded border-gray-600 bg-gray-700"
                                            />
                                            <label htmlFor={option.name} className="text-gray-300 text-sm cursor-pointer">
                                              {option.name}
                                            </label>
                                          </div>
                                          <span className="text-green-400 text-sm">+{option.price}€</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="border-t border-gray-600 pt-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <span className="text-white">Prix total :</span>
                                    <span className="text-green-400 text-xl font-semibold">{calculateTotalPrice()}€</span>
                                  </div>
                                  
                                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white border-0">
                                    <Package className="w-4 h-4 mr-2" />
                                    Valider ma commande
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun service trouvé</p>
              <p className="text-sm">Essayez de modifier votre recherche ou vos filtres</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Services Section */}
      <div className="space-y-4">
        <h2 className="text-2xl text-white">Mes services en cours</h2>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-left">
                    <th className="p-4 text-gray-400 text-sm">Service</th>
                    <th className="p-4 text-gray-400 text-sm">Statut</th>
                    <th className="p-4 text-gray-400 text-sm">Date commande</th>
                    <th className="p-4 text-gray-400 text-sm">Livraison estimée</th>
                    <th className="p-4 text-gray-400 text-sm">Prix</th>
                    <th className="p-4 text-gray-400 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userServices.map((userService) => (
                    <tr key={userService.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="p-4">
                        <p className="text-white text-sm">{userService.serviceName}</p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(userService.status)}
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm">{formatDate(userService.orderDate)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm">{formatDate(userService.estimatedDelivery)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-green-400 text-sm">{userService.price}€</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {userService.status === 'delivered' && (
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <MessageCircle className="w-4 h-4" />
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

        {userServices.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <p>Aucun service commandé</p>
                <p className="text-sm">Commandez votre premier service pour voir l'avancement ici</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}