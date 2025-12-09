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