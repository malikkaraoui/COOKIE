ICI TU TOUVERA LES OUTILS ET EXEMPLE TE PERMETTRANT DE METTRE A JOUR LE DESIGN DU SITE WEB. C'EST FIGMA QUI FOURNI

DONC INSPIRE TOUT S'EN, MAIS REFLECHIT TOUJOURS AVANT D'IMPLEMENTER. 

LE BUT EST DE NE RIEN CASSER FONCTIONNELLEMENT.

JUSTE COSMETIQUE 


EXEMPLE : APP.tsx 

import React, { useMemo } from 'react';
import { Layout } from './components/Layout';
import { MarmitePage } from './components/MarmitePage';
import { EpiceriePage } from './components/EpiceriePage';
import { RecettesPopulairesPage } from './components/RecettesPopulairesPage';
import { MesRecettesPage } from './components/MesRecettesPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminLayout } from './components/AdminLayout';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useResponsive } from './hooks/useResponsive';
import { mockUser } from './data/mockData';

export default function App() {
  const {
    activeCategory,
    currentView,
    isAdminMode,
    adminSection,
    handleCategoryChange,
    handleAccessAdmin,
    handleBackToUser,
    handleAdminSectionChange,
    handleProfileClick
  } = useAppNavigation();

  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();

  // Memoize the main content to avoid unnecessary re-renders
  const renderMainContent = useMemo(() => {
    if (currentView === 'marmite') {
      return <MarmitePage isMobile={isMobile} />;
    }

    if (currentView === 'epicerie') {
      return <EpiceriePage isMobile={isMobile} />;
    }

    if (currentView === 'populaires') {
      return <RecettesPopulairesPage isMobile={isMobile} />;
    }

    if (currentView === 'mesrecettes') {
      return <MesRecettesPage isMobile={isMobile} />;
    }

    if (currentView === 'profil') {
      return <ProfilePage user={mockUser} isMobile={isMobile} />;
    }

    return <MarmitePage isMobile={isMobile} />;
  }, [currentView, isMobile]);

  if (isAdminMode) {
    return (
      <AdminLayout
        adminSection={adminSection}
        onSectionChange={handleAdminSectionChange}
        onBackToUser={handleBackToUser}
        isMobile={isMobile}
        breakpoint={breakpoint}
      />
    );
  }

  return (
    <Layout
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
      user={mockUser}
      onAccessAdmin={handleAccessAdmin}
      onProfileClick={handleProfileClick}
      isMobile={isMobile}
      isTablet={isTablet}
      showHeader={true}
    >
      {renderMainContent}
    </Layout>
  );
}



__________________


Admin dashboard : 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  UserCheck,
  ShoppingCart,
  Eye,
  Clock,
  Star,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboard() {
  // Mock data
  const kpis = {
    totalRevenue: 145680,
    monthlyRevenue: 28450,
    totalUsers: 1847,
    activeUsers: 1234,
    totalModules: 32,
    publishedModules: 28,
    conversionRate: 8.2,
    avgOrderValue: 287
  };

  const revenueData = [
    { month: 'Jan', revenue: 12000, users: 150 },
    { month: 'Fév', revenue: 15000, users: 180 },
    { month: 'Mar', revenue: 18000, users: 220 },
    { month: 'Avr', revenue: 22000, users: 280 },
    { month: 'Mai', revenue: 28000, users: 350 },
    { month: 'Jun', revenue: 32000, users: 420 },
  ];

  const moduleStats = [
    { category: 'IA', count: 8, revenue: 45000 },
    { category: 'E-commerce', count: 6, revenue: 38000 },
    { category: 'SEO', count: 5, revenue: 32000 },
    { category: 'Copywriting', count: 4, revenue: 18000 },
    { category: 'Branding', count: 3, revenue: 12000 },
  ];

  const pieData = [
    { name: 'IA', value: 35, color: '#3B82F6' },
    { name: 'E-commerce', value: 25, color: '#06B6D4' },
    { name: 'SEO', value: 20, color: '#8B5CF6' },
    { name: 'Copywriting', value: 12, color: '#EC4899' },
    { name: 'Branding', value: 8, color: '#10B981' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'purchase',
      user: 'Marie Dupont',
      action: 'a acheté "IA Marketing Avancé"',
      amount: 250,
      time: '5 min'
    },
    {
      id: 2,
      type: 'completion',
      user: 'Pierre Martin',
      action: 'a terminé "SEO Technique"',
      time: '12 min'
    },
    {
      id: 3,
      type: 'affiliate',
      user: 'Alex Digital',
      action: 'a généré une vente',
      amount: 75,
      time: '23 min'
    },
    {
      id: 4,
      type: 'support',
      user: 'Sophie Laurent',
      action: 'a ouvert un ticket support',
      time: '1h'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: '3 tickets support en attente',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'Nouveau module prêt à publier',
      priority: 'low'
    },
    {
      id: 3,
      type: 'success',
      message: 'Objectif mensuel dépassé !',
      priority: 'high'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Dashboard Admin</h1>
          <p className="text-gray-400">Vue d'ensemble de la plateforme START Modules</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700">
            Exporter données
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
            Nouveau module
          </Button>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-3 rounded-lg border flex items-center justify-between ${
              alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
              alert.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-4 h-4 ${
                  alert.type === 'warning' ? 'text-yellow-500' :
                  alert.type === 'success' ? 'text-green-500' :
                  'text-blue-500'
                }`} />
                <span className="text-white text-sm">{alert.message}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenus totaux</p>
                <p className="text-2xl text-white">{kpis.totalRevenue.toLocaleString()}€</p>
                <p className="text-green-400 text-sm">+{kpis.monthlyRevenue.toLocaleString()}€ ce mois</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Utilisateurs</p>
                <p className="text-2xl text-white">{kpis.totalUsers.toLocaleString()}</p>
                <p className="text-blue-400 text-sm">{kpis.activeUsers} actifs</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Modules</p>
                <p className="text-2xl text-white">{kpis.totalModules}</p>
                <p className="text-cyan-400 text-sm">{kpis.publishedModules} publiés</p>
              </div>
              <BookOpen className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversion</p>
                <p className="text-2xl text-white">{kpis.conversionRate}%</p>
                <p className="text-purple-400 text-sm">{kpis.avgOrderValue}€ panier moyen</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique revenus */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par catégorie */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Ventes par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistiques modules */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Performance des modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {moduleStats.map((module) => (
              <div key={module.category} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="text-white">{module.category}</h4>
                    <p className="text-gray-400 text-sm">{module.count} modules</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">{module.revenue.toLocaleString()}€</p>
                  <p className="text-gray-400 text-sm">CA total</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'purchase' ? 'bg-green-500' :
                  activity.type === 'completion' ? 'bg-blue-500' :
                  activity.type === 'affiliate' ? 'bg-purple-500' :
                  'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  {activity.amount && (
                    <p className="text-green-400 text-sm">+{activity.amount}€</p>
                  )}
                </div>
                <span className="text-gray-400 text-xs">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



_______________________

Adminsidebar :

import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Briefcase,
  UserCheck,
  MessageCircle,
  Settings,
  ArrowLeft,
  TrendingUp,
  Package,
  Bell,
  Trello,
  Radio
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onBackToUser: () => void;
}

const adminSections = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'modules', name: 'Modules', icon: BookOpen, count: 32 },
  { id: 'clients', name: 'Clients', icon: Users, count: 1847 },
  { id: 'sales', name: 'Ventes', icon: CreditCard },
  { id: 'services', name: 'Services', icon: Briefcase, count: 12 },
  { id: 'projects', name: 'Gestion de projet', icon: Trello, count: 18 },
  { id: 'lives', name: 'Lives', icon: Radio, count: 2 },
  { id: 'affiliates', name: 'Affiliés', icon: UserCheck, count: 156 },
  { id: 'support', name: 'Support', icon: MessageCircle, count: 23 },
  { id: 'settings', name: 'Paramètres', icon: Settings },
];

export function AdminSidebar({ activeSection, onSectionChange, onBackToUser }: AdminSidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header Admin */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-lg font-bold">START</h1>
            <p className="text-gray-400 text-sm">Admin Panel</p>
          </div>
        </div>
        
        <Button 
          variant="ghost"
          onClick={onBackToUser}
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour utilisateur
        </Button>
      </div>

      {/* Navigation Admin */}
      <nav className="flex-1 p-4 space-y-2">
        {adminSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-blue-500/30 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{section.name}</span>
              </div>
              {section.count && (
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                  {section.count}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <Bell className="w-4 h-4" />
          <span>Notifications actives</span>
          <Badge className="bg-blue-500 text-white text-xs">3</Badge>
        </div>
        <div className="text-gray-500 text-xs">
          Connecté en tant qu'admin
        </div>
      </div>
    </div>
  );
}


-----------------------------

settingsmanagement.tsx :

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Settings,
  Save,
  Upload,
  Mail,
  CreditCard,
  Users,
  Webhook,
  TestTube,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Palette
} from 'lucide-react';

export function SettingsManagement() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Mock settings data
  const generalSettings = {
    platformName: 'START Modules',
    adminEmail: 'admin@startmodules.com',
    supportEmail: 'support@startmodules.com',
    website: 'https://startmodules.com',
    timezone: 'Europe/Paris',
    language: 'fr',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=100&fit=crop'
  };

  const paymentSettings = {
    stripePublicKey: 'pk_live_51...',
    stripeSecretKey: 'sk_live_51...',
    webhookSecret: 'whsec_...',
    currency: 'EUR',
    taxRate: 20,
    paypalEnabled: true,
    bankTransferEnabled: false
  };

  const emailSettings = {
    smtpHost: 'smtp.mailgun.org',
    smtpPort: 587,
    smtpUser: 'postmaster@mg.startmodules.com',
    smtpPassword: '••••••••••••',
    fromName: 'START Modules',
    fromEmail: 'noreply@startmodules.com',
    replyToEmail: 'support@startmodules.com'
  };

  const roles = [
    {
      id: '1',
      name: 'Sophie Martin',
      email: 'sophie@startmodules.com',
      role: 'admin',
      permissions: ['modules', 'clients', 'sales', 'support', 'settings'],
      lastLogin: '2025-01-22 14:30',
      status: 'active'
    },
    {
      id: '2',
      name: 'Thomas Expert',
      email: 'thomas@startmodules.com',
      role: 'staff',
      permissions: ['modules', 'clients', 'support'],
      lastLogin: '2025-01-21 16:45',
      status: 'active'
    },
    {
      id: '3',
      name: 'Lucas Viewer',
      email: 'lucas@startmodules.com',
      role: 'viewer',
      permissions: ['clients', 'sales'],
      lastLogin: '2025-01-20 09:15',
      status: 'active'
    }
  ];

  const webhooks = [
    {
      id: '1',
      name: 'Zapier - Nouvelle vente',
      url: 'https://hooks.zapier.com/hooks/catch/...',
      events: ['sale.completed', 'user.registered'],
      status: 'active',
      lastTriggered: '2025-01-22 14:30'
    },
    {
      id: '2',
      name: 'Make.com - Support',
      url: 'https://hook.make.com/...',
      events: ['ticket.created', 'ticket.resolved'],
      status: 'active',
      lastTriggered: '2025-01-22 12:15'
    },
    {
      id: '3',
      name: 'Notion - Analytics',
      url: 'https://api.notion.com/v1/...',
      events: ['module.completed'],
      status: 'inactive',
      lastTriggered: '2025-01-19 18:22'
    }
  ];

  const emailTemplates = [
    { id: 'welcome', name: 'Email de bienvenue', status: 'active' },
    { id: 'purchase', name: 'Confirmation d\'achat', status: 'active' },
    { id: 'completion', name: 'Module terminé', status: 'active' },
    { id: 'reminder', name: 'Rappel d\'inactivité', status: 'inactive' },
    { id: 'affiliate', name: 'Invitation affilié', status: 'active' }
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', color: 'bg-red-500' },
      staff: { label: 'Staff', color: 'bg-blue-500' },
      viewer: { label: 'Viewer', color: 'bg-gray-500' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-500 text-white text-xs">Actif</Badge>
    ) : (
      <Badge className="bg-gray-500 text-white text-xs">Inactif</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Paramètres</h1>
          <p className="text-gray-400">Configuration de la plateforme START</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white border-0">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            Général
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            Paiements
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            Emails
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            Rôles & Accès
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            Intégrations
          </TabsTrigger>
        </TabsList>

        {/* Paramètres généraux */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Nom de la plateforme</Label>
                  <Input 
                    defaultValue={generalSettings.platformName}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Site web</Label>
                  <Input 
                    defaultValue={generalSettings.website}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Email admin</Label>
                  <Input 
                    defaultValue={generalSettings.adminEmail}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email support</Label>
                  <Input 
                    defaultValue={generalSettings.supportEmail}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Fuseau horaire</Label>
                  <Select defaultValue={generalSettings.timezone}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Langue</Label>
                  <Select defaultValue={generalSettings.language}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Logo de la plateforme</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <img 
                    src={generalSettings.logo} 
                    alt="Logo" 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Changer le logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de paiement */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Configuration Stripe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Clé publique Stripe</Label>
                  <Input 
                    defaultValue={paymentSettings.stripePublicKey}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Clé secrète Stripe</Label>
                  <div className="relative">
                    <Input 
                      type={showApiKey ? 'text' : 'password'}
                      defaultValue={paymentSettings.stripeSecretKey}
                      className="bg-gray-700 border-gray-600 text-white pr-10" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Webhook secret</Label>
                <Input 
                  type="password"
                  defaultValue={paymentSettings.webhookSecret}
                  className="bg-gray-700 border-gray-600 text-white" 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Devise</Label>
                  <Select defaultValue={paymentSettings.currency}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Taux de TVA (%)</Label>
                  <Input 
                    type="number"
                    defaultValue={paymentSettings.taxRate}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0">
                    <TestTube className="w-4 h-4 mr-2" />
                    Tester Stripe
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white">Méthodes de paiement</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center space-x-2">
                      <Switch checked={true} />
                      <span className="text-white">Cartes bancaires (Stripe)</span>
                    </div>
                    <Badge className="bg-green-500 text-white">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center space-x-2">
                      <Switch checked={paymentSettings.paypalEnabled} />
                      <span className="text-white">PayPal</span>
                    </div>
                    <Badge className="bg-green-500 text-white">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center space-x-2">
                      <Switch checked={paymentSettings.bankTransferEnabled} />
                      <span className="text-white">Virement bancaire</span>
                    </div>
                    <Badge className="bg-gray-500 text-white">Inactif</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres email */}
        <TabsContent value="email" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Configuration SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Serveur SMTP</Label>
                  <Input 
                    defaultValue={emailSettings.smtpHost}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Port</Label>
                  <Input 
                    type="number"
                    defaultValue={emailSettings.smtpPort}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Utilisateur SMTP</Label>
                  <Input 
                    defaultValue={emailSettings.smtpUser}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Mot de passe SMTP</Label>
                  <Input 
                    type="password"
                    defaultValue={emailSettings.smtpPassword}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Nom expéditeur</Label>
                  <Input 
                    defaultValue={emailSettings.fromName}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email expéditeur</Label>
                  <Input 
                    defaultValue={emailSettings.fromEmail}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email réponse</Label>
                  <Input 
                    defaultValue={emailSettings.replyToEmail}
                    className="bg-gray-700 border-gray-600 text-white" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Templates d'emails automatiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center space-x-3">
                      <Switch checked={template.status === 'active'} />
                      <span className="text-white">{template.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(template.status)}
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <Palette className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rôles et accès */}
        <TabsContent value="roles" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Gestion des rôles
                </CardTitle>
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un rôle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-700">
                    <tr className="text-left">
                      <th className="p-4 text-gray-400 text-sm">Utilisateur</th>
                      <th className="p-4 text-gray-400 text-sm">Rôle</th>
                      <th className="p-4 text-gray-400 text-sm">Permissions</th>
                      <th className="p-4 text-gray-400 text-sm">Dernière connexion</th>
                      <th className="p-4 text-gray-400 text-sm">Statut</th>
                      <th className="p-4 text-gray-400 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b border-gray-700/50">
                        <td className="p-4">
                          <div>
                            <p className="text-white text-sm">{role.name}</p>
                            <p className="text-gray-400 text-xs">{role.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {getRoleBadge(role.role)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map(permission => (
                              <Badge key={permission} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="text-gray-400 text-xs">+{role.permissions.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-400 text-xs">{role.lastLogin}</p>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(role.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
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
        </TabsContent>

        {/* Intégrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Webhook className="w-5 h-5 mr-2" />
                  Webhooks & Intégrations
                </CardTitle>
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 bg-gray-700/50 rounded border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white text-sm font-medium">{webhook.name}</h4>
                        <p className="text-gray-400 text-xs">{webhook.url}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(webhook.status)}
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <TestTube className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex space-x-2">
                        {webhook.events.map(event => (
                          <Badge key={event} variant="outline" className="border-gray-600 text-gray-300">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-gray-400">Dernier: {webhook.lastTriggered}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Intégrations disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Zapier', status: 'connected', icon: '⚡' },
                  { name: 'Make.com', status: 'connected', icon: '🔧' },
                  { name: 'Notion', status: 'available', icon: '📝' },
                  { name: 'Airtable', status: 'available', icon: '📊' }
                ].map((integration) => (
                  <div key={integration.name} className="p-4 bg-gray-700/50 rounded border border-gray-600 text-center">
                    <div className="text-2xl mb-2">{integration.icon}</div>
                    <h4 className="text-white text-sm font-medium mb-2">{integration.name}</h4>
                    {integration.status === 'connected' ? (
                      <Badge className="bg-green-500 text-white text-xs">Connecté</Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        Connecter
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


_________

Accordin.tsx 

"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion@1.2.3";
import { ChevronDownIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };



---------------------


badge.tsx :


import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };




--------------------------

button.tsx :


import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };



-------------


card.tsx :


import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};




--------------



carrousel.tsx :



"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react@8.6.0";
import { ArrowLeft, ArrowRight } from "lucide-react@0.487.0";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};




-------------------




contextmenu.tsx :



"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu@2.2.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};




--------------------


hover-card.tsx :


"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card@1.1.6";

import { cn } from "./utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };



--------------------



menubar.tsx :


"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar@1.1.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};



--------------------


navigation-menu.tsx :



import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu@1.2.5";
import { cva } from "class-variance-authority@0.7.1";
import { ChevronDownIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};




--------------------


rezisable.tsx :



"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react@0.487.0";
import * as ResizablePrimitive from "react-resizable-panels@2.1.7";

import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };


-------------------


seperator.tsx :


"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator@1.1.2";

import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };



-------------------


sidebar.tsx :


"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { VariantProps, cva } from "class-variance-authority@0.7.1";
import { PanelLeftIcon } from "lucide-react@0.487.0";

import { useIsMobile } from "./use-mobile";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};


------------

globals.css



@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 14px;
  --background: #fafafa;
  --foreground: #1a1a1a;
  --card: #ffffff;
  --card-foreground: #1a1a1a;
  --popover: #ffffff;
  --popover-foreground: #1a1a1a;
  --primary: #FF9900;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #1a1a1a;
  --muted: #f0f0f0;
  --muted-foreground: #666666;
  --accent: #2D9596;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e5e5e5;
  --input: transparent;
  --input-background: #ffffff;
  --switch-background: #e5e5e5;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: #FF9900;
  --chart-1: #FF9900;
  --chart-2: #2D9596;
  --chart-3: #f97316;
  --chart-4: #22d3ee;
  --chart-5: #a855f7;
  --radius: 0.75rem;
  
  /* $COOKIE Brand Colors */
  --cookie-orange: #FF9900;
  --cookie-orange-light: #FFB340;
  --cookie-orange-dark: #CC7A00;
  --cookie-teal: #2D9596;
  --cookie-teal-light: #4DB8B9;
  --cookie-teal-dark: #1A6B6C;
  --cookie-gold: #FFD700;
  --cookie-cream: #FFF5E6;
  --cookie-white: #ffffff;
  --cookie-gray-50: #fafafa;
  --cookie-gray-100: #f5f5f5;
  --cookie-gray-200: #e5e5e5;
  --cookie-gray-300: #d4d4d4;
  --cookie-gray-400: #a3a3a3;
  --cookie-gray-500: #737373;
  
  --sidebar: #ffffff;
  --sidebar-foreground: #1a1a1a;
  --sidebar-primary: #FF9900;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #FFF5E6;
  --sidebar-accent-foreground: #1a1a1a;
  --sidebar-border: #e5e5e5;
  --sidebar-ring: #FF9900;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --card: #151515;
  --card-foreground: #ffffff;
  --popover: #151515;
  --popover-foreground: #ffffff;
  --primary: #FF9900;
  --primary-foreground: #000000;
  --secondary: #1a1a1a;
  --secondary-foreground: #ffffff;
  --muted: #2a2a2a;
  --muted-foreground: #9ca3af;
  --accent: #FF9900;
  --accent-foreground: #000000;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2a2a2a;
  --input: #1a1a1a;
  --ring: #FF9900;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: #FF9900;
  --chart-2: #2D9596;
  --chart-3: #f97316;
  --chart-4: #22d3ee;
  --chart-5: #a855f7;
  --sidebar: #0a0a0a;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #FF9900;
  --sidebar-primary-foreground: #000000;
  --sidebar-accent: #1a1a1a;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #2a2a2a;
  --sidebar-ring: #FF9900;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  
  /* $COOKIE Brand Color Utilities */
  --color-cookie-orange: var(--cookie-orange);
  --color-cookie-orange-light: var(--cookie-orange-light);
  --color-cookie-orange-dark: var(--cookie-orange-dark);
  --color-cookie-teal: var(--cookie-teal);
  --color-cookie-teal-light: var(--cookie-teal-light);
  --color-cookie-teal-dark: var(--cookie-teal-dark);
  --color-cookie-gold: var(--cookie-gold);
  --color-cookie-cream: var(--cookie-cream);
  --color-cookie-black: var(--cookie-black);
  --color-cookie-gray-900: var(--cookie-gray-900);
  --color-cookie-gray-800: var(--cookie-gray-800);
  --color-cookie-gray-700: var(--cookie-gray-700);
  --color-cookie-gray-600: var(--cookie-gray-600);
  --color-cookie-gray-500: var(--cookie-gray-500);
  --color-cookie-white: var(--cookie-white);
  --color-cookie-gray-50: var(--cookie-gray-50);
  --color-cookie-gray-100: var(--cookie-gray-100);
  --color-cookie-gray-200: var(--cookie-gray-200);
  --color-cookie-gray-300: var(--cookie-gray-300);
  --color-cookie-gray-400: var(--cookie-gray-400);
  
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-[#fafafa] text-[#1a1a1a];
  }
}

/**
 * Base typography. This is not applied to elements which have an ancestor with a Tailwind text class.
 */
@layer base {
  :where(:not(:has([class*=" text-"]), :not(:has([class^="text-"])))) {
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
      color: #1a1a1a;
    }

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
      color: #1a1a1a;
    }

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
      color: #1a1a1a;
    }

    h4 {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
      color: #1a1a1a;
    }

    p {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
      color: #1a1a1a;
    }

    label {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
      color: #1a1a1a;
    }

    button {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    input {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
      color: #1a1a1a;
    }
  }
}

html {
  font-size: var(--font-size);
}

/* $COOKIE Gradient Background */
.cookie-gradient-bg {
  background: radial-gradient(ellipse at 85% 80%, #FF9900 0%, #2D9596 100%);
  filter: blur(200px);
  opacity: 0.25;
}

/* $COOKIE Button Styles */
.cookie-btn-primary {
  background: linear-gradient(135deg, #FF9900 0%, #FFB340 100%);
  color: #000000;
  border: none;
  transition: all 0.3s ease;
}

.cookie-btn-primary:hover {
  background: linear-gradient(135deg, #FFB340 0%, #FF9900 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 153, 0, 0.4);
}

.cookie-btn-secondary {
  background: linear-gradient(135deg, #2D9596 0%, #4DB8B9 100%);
  color: #ffffff;
  border: none;
  transition: all 0.3s ease;
}

.cookie-btn-secondary:hover {
  background: linear-gradient(135deg, #4DB8B9 0%, #2D9596 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(45, 149, 150, 0.4);
}

/* $COOKIE Glow Effects */
.cookie-glow-orange {
  box-shadow: 0 0 25px rgba(255, 153, 0, 0.4);
}

.cookie-glow-teal {
  box-shadow: 0 0 25px rgba(45, 149, 150, 0.4);
}

.cookie-glow-gold {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

/* Stars Rating */
.star-rating {
  color: #FFD700;
  filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5));
}




-------------------


ingredients très important. cela va te permettre de cacher les token et les remplacer par des ingrédients : 
ingredients très important. cela va te permettre de cacher les token et les remplacer par des ingrédients : 
ingredients très important. cela va te permettre de cacher les token et les remplacer par des ingrédients : 
ingredients très important. cela va te permettre de cacher les token et les remplacer par des ingrédients : 



ce qui suit (les trois blocs) sont importants !!!!







export type IngredientFrequency = 'omniprésent' | 'très fréquent' | 'fréquent' | 'occasionnel' | 'rare' | 'très rare';

export interface Ingredient {
  id: string;
  name: string;
  financialProduct: string;
  description: string;
  frequency: IngredientFrequency;
  isPremium: boolean;
  icon: string;
}

export const ingredients: Ingredient[] = [
  // Omniprésents
  {
    id: 'I04',
    name: 'Pain',
    financialProduct: 'ETF actions Monde',
    description: 'Toujours sur la table = cœur actions globales moderne',
    frequency: 'omniprésent',
    isPremium: false,
    icon: '🥖'
  },
  {
    id: 'I06',
    name: 'Beurre',
    financialProduct: 'ETF / actions à dividende',
    description: 'Donne du "gras" et du confort = flux réguliers de dividendes',
    frequency: 'omniprésent',
    isPremium: false,
    icon: '🧈'
  },
  {
    id: 'I22',
    name: 'Sel',
    financialProduct: 'Poche cash tactique (2-5%)',
    description: 'Présent partout en petite dose pour ajuster l\'assaisonnement général',
    frequency: 'omniprésent',
    isPremium: false,
    icon: '🧂'
  },
  {
    id: 'I23',
    name: 'Poivre',
    financialProduct: 'Poche "risque modéré+" (high yield, small caps)',
    description: 'Donne du nerf = petite poche de risque supplémentaire',
    frequency: 'omniprésent',
    isPremium: false,
    icon: '🌶️'
  },

  // Très fréquents
  {
    id: 'I01',
    name: 'Pommes de terre',
    financialProduct: 'Cash / dépôts / livrets',
    description: 'Base rassasiante très fréquente = socle de trésorerie',
    frequency: 'très fréquent',
    isPremium: false,
    icon: '🥔'
  },
  {
    id: 'I02',
    name: 'Pâtes',
    financialProduct: 'Fonds euros assurance-vie',
    description: 'Plat du quotidien simple et populaire = produit star de l\'épargne FR',
    frequency: 'très fréquent',
    isPremium: false,
    icon: '🍝'
  },
  {
    id: 'I05',
    name: 'Œufs',
    financialProduct: 'Fonds multi-actifs / gestion pilotée',
    description: 'Liant multi-usage = produit qui mélange les classes d\'actifs',
    frequency: 'très fréquent',
    isPremium: false,
    icon: '🥚'
  },
  {
    id: 'I09',
    name: 'Ail',
    financialProduct: 'ETF sectoriel "classique"',
    description: 'Donne du caractère mais reste dans du connu (santé, conso…)',
    frequency: 'très fréquent',
    isPremium: false,
    icon: '🧄'
  },
  {
    id: 'I10',
    name: 'Oignons',
    financialProduct: 'Actions domestiques (PEA France)',
    description: 'Base aromatique locale = exposition au pays',
    frequency: 'très fréquent',
    isPremium: false,
    icon: '🧅'
  },

  // Fréquents
  {
    id: 'I03',
    name: 'Riz',
    financialProduct: 'Fonds / ETF obligations IG',
    description: 'Base neutre, défensive = poche obligataire classique',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🍚'
  },
  {
    id: 'I07',
    name: 'Crème fraîche',
    financialProduct: 'SCPI / immobilier papier non coté',
    description: 'Rend le plat plus riche et lourd = immo long terme',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🥛'
  },
  {
    id: 'I08',
    name: 'Huile d\'olive',
    financialProduct: 'Or / ETF or',
    description: 'Filet qu\'on ajoute pour l\'équilibre et la protection',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🫒'
  },
  {
    id: 'I11',
    name: 'Carottes',
    financialProduct: 'Fonds obligataires défensifs long terme',
    description: 'Composante lente, mijotée, rassurante',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🥕'
  },
  {
    id: 'I12',
    name: 'Poireaux',
    financialProduct: 'Immobilier coté (REIT)',
    description: 'Ingrédient très "terroir" = immo coté plus vif',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🥬'
  },
  {
    id: 'I13',
    name: 'Tomates',
    financialProduct: 'ETF actions émergentes',
    description: 'Apporte du soleil et un peu plus de volatilité',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🍅'
  },
  {
    id: 'I14',
    name: 'Fromage râpé',
    financialProduct: 'ETF smart beta / factoriel',
    description: 'Topping qui optimise un peu le plat actions',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🧀'
  },
  {
    id: 'I15',
    name: 'Vin rouge',
    financialProduct: 'Bitcoin spot',
    description: 'Ingrédient à forte personnalité = poche BTC 1-2%',
    frequency: 'fréquent',
    isPremium: true,
    icon: '🍷'
  },
  {
    id: 'I16',
    name: 'Bouillon',
    financialProduct: 'Fonds "all weather" / risk-parity',
    description: 'Liquide qui relie les éléments = moteur d\'orchestration',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🍲'
  },
  {
    id: 'I17',
    name: 'Poulet',
    financialProduct: 'ETF minimum volatility / low-vol',
    description: 'Protéine "safe" = actions plus douces',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🍗'
  },
  {
    id: 'I18',
    name: 'Bœuf',
    financialProduct: 'ETF S&P 500',
    description: 'Morceau costaud = gros bloc actions US',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🥩'
  },
  {
    id: 'I20',
    name: 'Lardons',
    financialProduct: 'Petites lignes d\'actions qualité',
    description: 'Petites touches grasses = petites positions de conviction',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🥓'
  },
  {
    id: 'I21',
    name: 'Herbes de Provence',
    financialProduct: 'Poche thématique croissance (IA, green, etc.)',
    description: 'Assaisonnement aromatique = petites thématiques de croissance',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🌿'
  },
  {
    id: 'I25',
    name: 'Moutarde',
    financialProduct: 'Couvertures simples (hedge taux/devise)',
    description: 'Donne du piquant mais reste un outil "classique" d\'équilibrage',
    frequency: 'fréquent',
    isPremium: false,
    icon: '🟡'
  },
  {
    id: 'I29',
    name: 'Vin blanc',
    financialProduct: 'Produits structurés / autocall',
    description: 'Très utilisé dans certains "styles" de cuisine',
    frequency: 'fréquent',
    isPremium: true,
    icon: '🍾'
  },

  // Occasionnels
  {
    id: 'I19',
    name: 'Poisson blanc',
    financialProduct: 'ETF thématique défensif (santé, infra)',
    description: 'Plus fin, plus ciblé, plutôt défensif',
    frequency: 'occasionnel',
    isPremium: false,
    icon: '🐟'
  },
  {
    id: 'I24',
    name: 'Champignons',
    financialProduct: 'Or + ETF matières premières diversifiées',
    description: 'Goût de terroir, de terre, de forêt = matières premières',
    frequency: 'occasionnel',
    isPremium: false,
    icon: '🍄'
  },
  {
    id: 'I30',
    name: 'Citron',
    financialProduct: 'Stratégies de couverture/options',
    description: 'Touche d\'acidité pour rééquilibrer quand le plat est trop lourd',
    frequency: 'occasionnel',
    isPremium: true,
    icon: '🍋'
  },

  // Rares
  {
    id: 'I26',
    name: 'Piment d\'Espelette',
    financialProduct: 'Panier altcoins L1/L2 (ETH, SOL, AVAX…)',
    description: 'Épice plus rare et marquée = poche crypto hors BTC',
    frequency: 'rare',
    isPremium: true,
    icon: '🌶️'
  },
  {
    id: 'I27',
    name: 'Curcuma',
    financialProduct: 'Stratégies DeFi lending / yield',
    description: 'Épice plutôt exotique en cuisine FR = DeFi',
    frequency: 'rare',
    isPremium: true,
    icon: '🟡'
  },

  // Très rares
  {
    id: 'I28',
    name: 'Safran',
    financialProduct: 'Panier memecoins / micro-caps ultra spéculatives',
    description: 'Très rare, très puissant, très cher au gramme = spéculation pure',
    frequency: 'très rare',
    isPremium: true,
    icon: '🟠'
  }
];

export const getIngredientsByFrequency = (frequency: IngredientFrequency) => {
  return ingredients.filter(ing => ing.frequency === frequency);
};

export const getFreeIngredients = () => {
  return ingredients.filter(ing => !ing.isPremium);
};

export const getPremiumIngredients = () => {
  return ingredients.filter(ing => ing.isPremium);
};


-----

mockdata.ts


export const mockUser = {
  firstName: "Chef",
  lastName: "Financier",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  completionPercentage: 35,
  unlockedModules: 8,
  totalModules: 32,
  role: 'admin' as const,
  stars: 4.5,
  recipesCreated: 12,
  followers: 234,
  xp: 2350,
  level: 'Chef Apprenti',
  nextLevel: 'Chef Confirmé',
  xpForNextLevel: 3000,
  xpCurrentLevel: 2000,
  pendingRewards: 1,
  nextUnlock: 'Accès au Laboratoire Premium'
};

import ecommerceImage from 'figma:asset/ef1de2d394b8cd8dc9cb9cf5276c1f07a6bf014c.png';
import adsImage from 'figma:asset/933eaa9cda2c28e15aeb5e2d30a0f55930b237e8.png';
import seoImage from 'figma:asset/25601bea57de09978e36384f75be3733c9a3a805.png';
import iaImage from 'figma:asset/57e98f4ab891889527270818600f25c01460be01.png';
import brandingImage from 'figma:asset/1da7e84aa520c154edbe511fb00866cd1c7d508a.png';

export const mockModules = [
  {
    id: '1',
    title: 'Le Soufflé à Haut Rendement',
    subtitle: 'Crypto + Actions Tech + Leverage',
    category: 'aggressive',
    level: 'Confirmé' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 5,
    duration: '30-90 jours',
    thumbnail: iaImage,
    isPromoted: true,
    promotedBy: 'Chef Marcus',
    stars: 4.8,
    risk: 'Élevé' as const,
    ingredients: ['Bitcoin', 'ETH', 'TSLA', 'NVDA', 'Leverage x5'],
    returnPotential: '+120% à +300%',
    chefRating: 4.5,
    copiedBy: 234
  },
  {
    id: '2',
    title: 'La Ratatouille Équilibrée',
    subtitle: 'Diversification ETF + Crypto Stable',
    category: 'balanced',
    level: 'Débutant' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 6,
    duration: '90-180 jours',
    thumbnail: seoImage,
    stars: 4.6,
    risk: 'Modéré' as const,
    ingredients: ['SPY', 'QQQ', 'BTC', 'Gold ETF', 'Bonds'],
    returnPotential: '+15% à +40%',
    chefRating: 4.2,
    copiedBy: 567
  },
  {
    id: '3',
    title: 'Le Pot-au-Feu Conservateur',
    subtitle: 'Obligations + Dividendes Stables',
    category: 'conservative',
    level: 'Débutant' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 4,
    duration: '180-365 jours',
    thumbnail: ecommerceImage,
    stars: 4.3,
    risk: 'Faible' as const,
    ingredients: ['Bonds US', 'Blue Chips', 'REITs', 'Dividend Stocks'],
    returnPotential: '+5% à +15%',
    chefRating: 4.7,
    copiedBy: 892
  },
  {
    id: '4',
    title: 'Le Tartare de DeFi',
    subtitle: 'Yield Farming + Staking Agressif',
    category: 'aggressive',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 7,
    duration: '15-60 jours',
    thumbnail: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&h=450&fit=crop',
    stars: 4.9,
    risk: 'Très Élevé' as const,
    ingredients: ['AAVE', 'UNI', 'CAKE', 'Liquidity Pools', 'Staking'],
    returnPotential: '+200% à +500%',
    chefRating: 4.8,
    copiedBy: 123
  },
  {
    id: '5',
    title: 'Le Gratin de Blue Chips',
    subtitle: 'FAANG + Dividend Aristocrats',
    category: 'balanced',
    level: 'Confirmé' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 6,
    duration: '120-240 jours',
    thumbnail: brandingImage,
    stars: 4.4,
    risk: 'Modéré' as const,
    ingredients: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'],
    returnPotential: '+20% à +50%',
    chefRating: 4.3,
    copiedBy: 445
  },
  {
    id: '6',
    title: 'La Fondue NFT & Metaverse',
    subtitle: 'Investissement Digital Assets',
    category: 'aggressive',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 8,
    duration: '30-120 jours',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
    stars: 4.1,
    risk: 'Très Élevé' as const,
    ingredients: ['NFT Blue Chips', 'SAND', 'MANA', 'APE', 'Gaming Tokens'],
    returnPotential: '+100% à +400%',
    chefRating: 3.9,
    copiedBy: 89
  },
  {
    id: '7',
    title: 'Le Consommé d\'Or',
    subtitle: 'Métaux Précieux + Safe Haven',
    category: 'conservative',
    level: 'Débutant' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 5,
    duration: '365+ jours',
    thumbnail: adsImage,
    stars: 4.5,
    risk: 'Faible' as const,
    ingredients: ['Gold', 'Silver', 'Platinum', 'Treasury Bonds'],
    returnPotential: '+8% à +20%',
    chefRating: 4.6,
    copiedBy: 678
  },
  {
    id: '8',
    title: 'Le Carpaccio d\'Altcoins',
    subtitle: 'Small Caps Crypto Sélectionnées',
    category: 'trending',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 9,
    duration: '7-30 jours',
    thumbnail: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&h=450&fit=crop',
    stars: 4.7,
    risk: 'Très Élevé' as const,
    ingredients: ['MATIC', 'SOL', 'AVAX', 'DOT', 'ATOM'],
    returnPotential: '+150% à +600%',
    chefRating: 4.4,
    copiedBy: 156
  }
];

-----

modulesdata.ts 


import ecommerceImage from 'figma:asset/ef1de2d394b8cd8dc9cb9cf5276c1f07a6bf014c.png';
import adsImage from 'figma:asset/933eaa9cda2c28e15aeb5e2d30a0f55930b237e8.png';
import seoImage from 'figma:asset/25601bea57de09978e36384f75be3733c9a3a805.png';
import iaImage from 'figma:asset/57e98f4ab891889527270818600f25c01460be01.png';
import brandingImage from 'figma:asset/1da7e84aa520c154edbe511fb00866cd1c7d508a.png';

export const detailedModules = [
  {
    id: 'ecommerce',
    title: 'E-commerce Mastery',
    subtitle: 'Créez et optimisez votre boutique en ligne',
    category: 'ecom',
    level: 'Confirmé' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 15,
    duration: '8h 30min',
    thumbnail: ecommerceImage,
    description: 'Apprenez à créer, gérer et optimiser une boutique e-commerce performante. De la conception à la vente, maîtrisez tous les aspects du commerce électronique.',
    keyPoints: [
      'Configuration complète Shopify/WooCommerce',
      'Stratégies de conversion avancées',
      'Automatisation des ventes',
      'Analyse des performances',
      'Scaling et croissance'
    ],
    lessons: [
      { id: '1', title: 'Introduction au E-commerce', duration: '25min', isCompleted: false },
      { id: '2', title: 'Choisir sa plateforme', duration: '35min', isCompleted: false },
      { id: '3', title: 'Design et UX de boutique', duration: '45min', isCompleted: false },
      { id: '4', title: 'Catalogue produits optimisé', duration: '40min', isCompleted: false },
      { id: '5', title: 'Stratégies de prix', duration: '30min', isCompleted: false },
      { id: '6', title: 'Tunnel de conversion', duration: '50min', isCompleted: false },
      { id: '7', title: 'Paiement et sécurité', duration: '35min', isCompleted: false },
      { id: '8', title: 'Logistique et expédition', duration: '40min', isCompleted: false },
      { id: '9', title: 'Marketing digital e-commerce', duration: '55min', isCompleted: false },
      { id: '10', title: 'Retention clients', duration: '45min', isCompleted: false },
      { id: '11', title: 'Analytics et KPIs', duration: '40min', isCompleted: false },
      { id: '12', title: 'Automatisation avancée', duration: '50min', isCompleted: false },
      { id: '13', title: 'Scaling international', duration: '45min', isCompleted: false },
      { id: '14', title: 'Marketplace et multicanal', duration: '40min', isCompleted: false },
      { id: '15', title: 'Projet final et certification', duration: '60min', isCompleted: false }
    ],
    instructor: {
      name: 'Marie Dubois',
      title: 'E-commerce Strategist',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      experience: '8 ans d\'expérience'
    }
  },
  {
    id: 'ads',
    title: 'Publicité Digitale Avancée',
    subtitle: 'Facebook, Google & TikTok Ads Mastery',
    category: 'ads',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 12,
    duration: '7h 15min',
    thumbnail: adsImage,
    description: 'Maîtrisez les publicités sur toutes les plateformes principales. Apprenez à créer des campagnes performantes qui génèrent un ROI exceptionnel.',
    keyPoints: [
      'Facebook & Instagram Ads avancées',
      'Google Ads et Search Marketing',
      'TikTok Ads et tendances',
      'Optimisation des conversions',
      'Attribution et tracking'
    ],
    lessons: [
      { id: '1', title: 'Écosystème publicitaire digital', duration: '35min', isCompleted: false },
      { id: '2', title: 'Facebook Ads : Setup avancé', duration: '45min', isCompleted: false },
      { id: '3', title: 'Targeting et audiences', duration: '50min', isCompleted: false },
      { id: '4', title: 'Créatifs qui convertissent', duration: '40min', isCompleted: false },
      { id: '5', title: 'Google Ads : Search & Display', duration: '55min', isCompleted: false },
      { id: '6', title: 'Shopping Ads et Performance Max', duration: '45min', isCompleted: false },
      { id: '7', title: 'TikTok Ads et Social Commerce', duration: '40min', isCompleted: false },
      { id: '8', title: 'Attribution et tracking pixels', duration: '35min', isCompleted: false },
      { id: '9', title: 'Optimisation des campagnes', duration: '45min', isCompleted: false },
      { id: '10', title: 'Scaling et budget management', duration: '40min', isCompleted: false },
      { id: '11', title: 'Analytics et reporting', duration: '35min', isCompleted: false },
      { id: '12', title: 'Certification et projets', duration: '50min', isCompleted: false }
    ],
    instructor: {
      name: 'Thomas Bernard',
      title: 'Performance Marketing Expert',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      experience: '10 ans d\'expérience'
    }
  },
  {
    id: 'seo',
    title: 'SEO Technique 2025',
    subtitle: 'Dominez Google avec les dernières techniques',
    category: 'seo',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 14,
    duration: '9h 45min',
    thumbnail: seoImage,
    description: 'Formation SEO complète et technique pour dominer les résultats de recherche. Techniques white-hat avancées et stratégies de contenu.',
    keyPoints: [
      'SEO technique et Core Web Vitals',
      'Recherche de mots-clés avancée',
      'Link building stratégique',
      'SEO local et international',
      'IA et SEO du futur'
    ],
    lessons: [
      { id: '1', title: 'Fondamentaux SEO 2025', duration: '40min', isCompleted: false },
      { id: '2', title: 'Recherche de mots-clés avancée', duration: '50min', isCompleted: false },
      { id: '3', title: 'SEO technique et crawling', duration: '55min', isCompleted: false },
      { id: '4', title: 'Core Web Vitals et UX', duration: '45min', isCompleted: false },
      { id: '5', title: 'Structure et architecture', duration: '40min', isCompleted: false },
      { id: '6', title: 'Contenu et sémantique', duration: '50min', isCompleted: false },
      { id: '7', title: 'Link building white-hat', duration: '55min', isCompleted: false },
      { id: '8', title: 'SEO local et Google My Business', duration: '40min', isCompleted: false },
      { id: '9', title: 'SEO international', duration: '45min', isCompleted: false },
      { id: '10', title: 'E-commerce SEO spécialisé', duration: '50min', isCompleted: false },
      { id: '11', title: 'Analytics et monitoring', duration: '40min', isCompleted: false },
      { id: '12', title: 'IA et SEO du futur', duration: '45min', isCompleted: false },
      { id: '13', title: 'Audit SEO complet', duration: '50min', isCompleted: false },
      { id: '14', title: 'Certification et projets', duration: '60min', isCompleted: false }
    ],
    instructor: {
      name: 'Sophie Laurent',
      title: 'SEO Technical Expert',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      experience: '12 ans d\'expérience'
    }
  },
  {
    id: 'ia',
    title: 'IA Marketing Avancé',
    subtitle: 'Maîtrisez l\'Intelligence Artificielle pour le Marketing',
    category: 'ia',
    level: 'Confirmé' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 16,
    duration: '10h 20min',
    thumbnail: iaImage,
    description: 'Découvrez comment révolutionner votre marketing avec l\'IA. De ChatGPT aux outils de génération d\'images, maîtrisez toutes les technologies qui transforment le marketing digital.',
    keyPoints: [
      'Automatisation marketing avec l\'IA',
      'ChatGPT et prompting avancé',
      'Génération de contenu automatique',
      'Analyse prédictive et personnalisation',
      'Outils IA pour le visual et vidéo'
    ],
    lessons: [
      { id: '1', title: 'Introduction à l\'IA Marketing', duration: '30min', isCompleted: false },
      { id: '2', title: 'ChatGPT pour le marketing', duration: '45min', isCompleted: false },
      { id: '3', title: 'Prompting et ingénierie de prompts', duration: '50min', isCompleted: false },
      { id: '4', title: 'Génération de contenu automatique', duration: '40min', isCompleted: false },
      { id: '5', title: 'IA pour le copywriting', duration: '45min', isCompleted: false },
      { id: '6', title: 'Génération d\'images avec MidJourney', duration: '55min', isCompleted: false },
      { id: '7', title: 'Création vidéo avec l\'IA', duration: '50min', isCompleted: false },
      { id: '8', title: 'Automatisation des réseaux sociaux', duration: '40min', isCompleted: false },
      { id: '9', title: 'Email marketing automatisé', duration: '45min', isCompleted: false },
      { id: '10', title: 'Chatbots et service client IA', duration: '40min', isCompleted: false },
      { id: '11', title: 'Analyse prédictive des données', duration: '50min', isCompleted: false },
      { id: '12', title: 'Personnalisation à grande échelle', duration: '45min', isCompleted: false },
      { id: '13', title: 'SEO et IA : optimisation future', duration: '40min', isCompleted: false },
      { id: '14', title: 'Éthique et limites de l\'IA', duration: '35min', isCompleted: false },
      { id: '15', title: 'Outils IA avancés du marché', duration: '50min', isCompleted: false },
      { id: '16', title: 'Projet final : Stratégie IA complète', duration: '60min', isCompleted: false }
    ],
    instructor: {
      name: 'Alexandre Martin',
      title: 'AI Marketing Strategist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      experience: '6 ans d\'expérience en IA'
    }
  },
  {
    id: 'branding',
    title: 'Branding Personnel Mastery',
    subtitle: 'Construisez une marque personnelle irrésistible',
    category: 'branding',
    level: 'Débutant' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 13,
    duration: '8h 45min',
    thumbnail: brandingImage,
    description: 'Apprenez à créer et développer une marque personnelle forte qui vous démarque dans votre secteur. De la stratégie aux visuels, maîtrisez tous les aspects du personal branding.',
    keyPoints: [
      'Stratégie de marque personnelle',
      'Identité visuelle et design',
      'Storytelling et narrative',
      'Présence digitale optimisée',
      'Monétisation de votre expertise'
    ],
    lessons: [
      { id: '1', title: 'Fondements du branding personnel', duration: '40min', isCompleted: false },
      { id: '2', title: 'Audit de votre marque actuelle', duration: '35min', isCompleted: false },
      { id: '3', title: 'Définir votre proposition de valeur', duration: '45min', isCompleted: false },
      { id: '4', title: 'Création de votre persona et audience', duration: '50min', isCompleted: false },
      { id: '5', title: 'Storytelling et narrative personnelle', duration: '55min', isCompleted: false },
      { id: '6', title: 'Identité visuelle : logo et couleurs', duration: '45min', isCompleted: false },
      { id: '7', title: 'Photography et image de marque', duration: '40min', isCompleted: false },
      { id: '8', title: 'Optimisation LinkedIn pour le branding', duration: '45min', isCompleted: false },
      { id: '9', title: 'Stratégie content sur les réseaux', duration: '50min', isCompleted: false },
      { id: '10', title: 'Personal website et portfolio', duration: '45min', isCompleted: false },
      { id: '11', title: 'Networking et relations publiques', duration: '40min', isCompleted: false },
      { id: '12', title: 'Monétisation et business model', duration: '50min', isCompleted: false },
      { id: '13', title: 'Projet final : Lancement de marque', duration: '65min', isCompleted: false }
    ],
    instructor: {
      name: 'Emma Rodriguez',
      title: 'Personal Branding Expert',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      experience: '9 ans en marketing personnel'
    }
  },
  {
    id: 'copywriting',
    title: 'Copywriting Émotionnel Mastery',
    subtitle: 'Vendez avec les mots qui touchent',
    category: 'copywriting',
    level: 'Confirmé' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 11,
    duration: '7h 30min',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop',
    description: 'Maîtrisez l\'art du copywriting persuasif qui génère des ventes. Apprenez les techniques psychologiques et émotionnelles qui transforment les mots en résultats.',
    keyPoints: [
      'Psychologie de la persuasion',
      'Copywriting pour les ventes',
      'Email marketing avancé',
      'Landing pages qui convertissent',
      'Storytelling commercial'
    ],
    lessons: [
      { id: '1', title: 'Principes de persuasion appliqués', duration: '45min', isCompleted: false },
      { id: '2', title: 'Psychologie du consommateur', duration: '50min', isCompleted: false },
      { id: '3', title: 'Headlines qui accrochent', duration: '40min', isCompleted: false },
      { id: '4', title: 'Storytelling pour vendre', duration: '55min', isCompleted: false },
      { id: '5', title: 'Pages de vente haute conversion', duration: '60min', isCompleted: false },
      { id: '6', title: 'Email sequences automatisées', duration: '45min', isCompleted: false },
      { id: '7', title: 'Copywriting pour les réseaux sociaux', duration: '40min', isCompleted: false },
      { id: '8', title: 'Scripts de vente en face à face', duration: '35min', isCompleted: false },
      { id: '9', title: 'Objections et réponses types', duration: '40min', isCompleted: false },
      { id: '10', title: 'Tests A/B de copy', duration: '35min', isCompleted: false },
      { id: '11', title: 'Portfolio et tarification copy', duration: '45min', isCompleted: false }
    ],
    instructor: {
      name: 'Julien Moreau',
      title: 'Copywriter Expert',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      experience: '7 ans en copywriting'
    }
  },
  {
    id: 'analytics',
    title: 'Analytics Avancées Mastery',
    subtitle: 'Google Analytics 4 & Data-Driven Marketing',
    category: 'analytics',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 12,
    duration: '8h 15min',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    description: 'Maîtrisez Google Analytics 4 et les outils d\'analyse avancés pour prendre des décisions marketing basées sur les données et optimiser vos performances.',
    keyPoints: [
      'Google Analytics 4 complet',
      'Google Tag Manager avancé',
      'Tableaux de bord et reporting',
      'Attribution et conversion tracking',
      'Data Studio et visualisation'
    ],
    lessons: [
      { id: '1', title: 'Migration vers GA4', duration: '45min', isCompleted: false },
      { id: '2', title: 'Configuration avancée GA4', duration: '55min', isCompleted: false },
      { id: '3', title: 'Events et conversions personnalisés', duration: '50min', isCompleted: false },
      { id: '4', title: 'Google Tag Manager mastery', duration: '60min', isCompleted: false },
      { id: '5', title: 'Audiences et segments avancés', duration: '45min', isCompleted: false },
      { id: '6', title: 'Attribution modeling', duration: '40min', isCompleted: false },
      { id: '7', title: 'E-commerce tracking complet', duration: '50min', isCompleted: false },
      { id: '8', title: 'Rapports personnalisés et explorations', duration: '45min', isCompleted: false },
      { id: '9', title: 'Google Data Studio avancé', duration: '55min', isCompleted: false },
      { id: '10', title: 'Intégrations et APIs', duration: '40min', isCompleted: false },
      { id: '11', title: 'GDPR et privacy compliance', duration: '35min', isCompleted: false },
      { id: '12', title: 'Certification et audit analytics', duration: '50min', isCompleted: false }
    ],
    instructor: {
      name: 'Laura Chen',
      title: 'Data Analytics Expert',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      experience: '11 ans en analytics'
    }
  }
];

// Mise à jour des modules existants avec les nouvelles images
export const updatedMockModules = [
  {
    id: '1',
    title: 'IA Marketing Avancé',
    subtitle: 'Étape 1 – InstaMachine',
    category: 'ia',
    level: 'Confirmé' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 8,
    duration: '4h 30min',
    thumbnail: iaImage,
    isPromoted: true,
    promotedBy: 'Alex Digital'
  },
  {
    id: '2',
    title: 'SEO Technique 2025',
    subtitle: 'Dominez Google en 30 jours',
    category: 'seo',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 12,
    duration: '6h 15min',
    thumbnail: seoImage
  },
  {
    id: '3',
    title: 'E-commerce Automation',
    subtitle: 'Shopify & Dropshipping Pro',
    category: 'ecom',
    level: 'Débutant' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 10,
    duration: '5h 45min',
    thumbnail: ecommerceImage
  },
  {
    id: '4',
    title: 'Copywriting Émotionnel',
    subtitle: 'Vendez avec les mots qui touchent',
    category: 'copywriting',
    level: 'Confirmé' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 7,
    duration: '3h 20min',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop'
  },
  {
    id: '5',
    title: 'Branding Personnel',
    subtitle: 'Créez votre marque personnelle',
    category: 'branding',
    level: 'Débutant' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 6,
    duration: '4h 10min',
    thumbnail: brandingImage
  },
  {
    id: '6',
    title: 'Analytics Avancées',
    subtitle: 'Google Analytics 4 Mastery',
    category: 'analytics',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 9,
    duration: '5h 30min',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop'
  },
  {
    id: '7',
    title: 'Publicité Digitale Avancée',
    subtitle: 'Facebook, Google & TikTok Ads',
    category: 'ads',
    level: 'Expert' as const,
    status: 'unlocked' as const,
    price: 250,
    lessonsCount: 12,
    duration: '7h 15min',
    thumbnail: adsImage
  }
];