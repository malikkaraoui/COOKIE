import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Plus,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  Upload,
  Play,
  FileText,
  Download,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export function ModulesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data
  const modules = [
    {
      id: '1',
      title: 'IA Marketing Avancé',
      subtitle: 'Étape 1 – InstaMachine',
      category: 'IA',
      status: 'published',
      price: 250,
      students: 342,
      revenue: 85500,
      lessons: 8,
      duration: '4h 30min',
      createdAt: '2024-12-15',
      updatedAt: '2025-01-20',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'SEO Technique 2025',
      subtitle: 'Dominez Google en 30 jours',
      category: 'SEO',
      status: 'published',
      price: 199,
      students: 456,
      revenue: 90744,
      lessons: 12,
      duration: '6h 15min',
      createdAt: '2024-11-10',
      updatedAt: '2025-01-18',
      thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'E-commerce Automation',
      subtitle: 'Shopify & Dropshipping Pro',
      category: 'E-commerce',
      status: 'draft',
      price: 350,
      students: 0,
      revenue: 0,
      lessons: 15,
      duration: '8h 45min',
      createdAt: '2025-01-15',
      updatedAt: '2025-01-22',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop'
    },
    {
      id: '4',
      title: 'Copywriting Émotionnel',
      subtitle: 'Vendez avec les mots qui touchent',
      category: 'Copywriting',
      status: 'archived',
      price: 149,
      students: 234,
      revenue: 34866,
      lessons: 7,
      duration: '3h 20min',
      createdAt: '2024-08-20',
      updatedAt: '2024-12-01',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop'
    }
  ];

  const categories = ['IA', 'SEO', 'E-commerce', 'Copywriting', 'Branding', 'Analytics'];
  const statuses = [
    { value: 'published', label: 'Publié', color: 'bg-green-500' },
    { value: 'draft', label: 'Brouillon', color: 'bg-yellow-500' },
    { value: 'archived', label: 'Archivé', color: 'bg-gray-500' }
  ];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color} text-white text-xs`}>
        {statusConfig?.label}
      </Badge>
    );
  };

  const totalRevenue = modules.reduce((sum, module) => sum + module.revenue, 0);
  const totalStudents = modules.reduce((sum, module) => sum + module.students, 0);
  const publishedModules = modules.filter(m => m.status === 'published').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Gestion des Modules</h1>
          <p className="text-gray-400">Créez, modifiez et gérez vos modules de formation</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau module
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Créer un nouveau module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Titre du module</Label>
                  <Input placeholder="Ex: IA Marketing Avancé" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300">Catégorie</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Sous-titre</Label>
                <Input placeholder="Ex: Étape 1 – InstaMachine" className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <Textarea placeholder="Description détaillée du module..." className="bg-gray-700 border-gray-600 text-white" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Prix (€)</Label>
                  <Input type="number" placeholder="250" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300">Niveau</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant</SelectItem>
                      <SelectItem value="confirme">Confirmé</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="published" />
                <Label htmlFor="published" className="text-gray-300">Publier immédiatement</Label>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-gray-600 text-gray-300">
                  Annuler
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
                  Créer le module
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenus totaux</p>
                <p className="text-2xl text-white">{totalRevenue.toLocaleString()}€</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total étudiants</p>
                <p className="text-2xl text-white">{totalStudents.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Modules publiés</p>
                <p className="text-2xl text-white">{publishedModules}/{modules.length}</p>
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
                placeholder="Rechercher un module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <Card key={module.id} className="bg-gray-800 border-gray-700 overflow-hidden">
            <div className="relative h-48">
              <img 
                src={module.thumbnail} 
                alt={module.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                {getStatusBadge(module.status)}
                <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                  {module.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <Button size="sm" variant="ghost" className="bg-black/50 text-white hover:bg-black/70">
                  {module.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="bg-black/50 text-white hover:bg-black/70">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="text-white text-lg">{module.title}</h3>
                <p className="text-gray-400 text-sm">{module.subtitle}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-xs">Prix</p>
                  <p className="text-white">{module.price}€</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Étudiants</p>
                  <p className="text-white">{module.students}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Revenus</p>
                  <p className="text-white">{module.revenue.toLocaleString()}€</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{module.lessons} leçons • {module.duration}</span>
                <span className="text-gray-500">Màj: {module.updatedAt}</span>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:text-white">
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun module trouvé</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}