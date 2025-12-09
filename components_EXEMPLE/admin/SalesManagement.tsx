import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  Trophy,
  Search,
  Download,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('month');

  // Mock data
  const salesKPIs = {
    totalRevenue: 145680,
    monthlyRevenue: 28450,
    totalSales: 847,
    bestDay: { date: '2025-01-20', amount: 2850 },
    topModule: { name: 'IA Marketing Avancé', sales: 234 },
    conversionRate: 8.2,
    avgOrderValue: 172
  };

  const revenueChart = [
    { date: '01/01', amount: 1200 },
    { date: '02/01', amount: 1850 },
    { date: '03/01', amount: 2100 },
    { date: '04/01', amount: 1650 },
    { date: '05/01', amount: 2850 },
    { date: '06/01', amount: 2200 },
    { date: '07/01', amount: 1950 },
  ];

  const sales = [
    {
      id: '1',
      client: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b512?w=150&h=150&fit=crop&crop=face',
      module: 'IA Marketing Avancé',
      price: 250,
      date: '2025-01-22',
      time: '14:32',
      paymentMethod: 'Stripe',
      status: 'completed',
      source: 'organic',
      transactionId: 'txn_1234567890'
    },
    {
      id: '2',
      client: 'Pierre Martin',
      email: 'pierre.martin@email.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      module: 'SEO Technique 2025',
      price: 199,
      date: '2025-01-22',
      time: '11:15',
      paymentMethod: 'PayPal',
      status: 'completed',
      source: 'affiliate',
      transactionId: 'txn_0987654321'
    },
    {
      id: '3',
      client: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      module: 'Pack E-commerce Pro',
      price: 450,
      date: '2025-01-21',
      time: '16:45',
      paymentMethod: 'Stripe',
      status: 'pending',
      source: 'ads',
      transactionId: 'txn_1122334455'
    },
    {
      id: '4',
      client: 'Alex Dubois',
      email: 'alex.dubois@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      module: 'Copywriting Émotionnel',
      price: 149,
      date: '2025-01-21',
      time: '09:22',
      paymentMethod: 'Stripe',
      status: 'failed',
      source: 'organic',
      transactionId: 'txn_5544332211'
    }
  ];

  const modules = ['IA Marketing Avancé', 'SEO Technique 2025', 'Pack E-commerce Pro', 'Copywriting Émotionnel', 'Branding Personnel'];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Complété', color: 'bg-green-500', icon: CheckCircle },
      pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
      failed: { label: 'Échoué', color: 'bg-red-500', icon: AlertCircle }
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

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="w-4 h-4 text-gray-400" />;
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || sale.module === filterModule;
    const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
    
    return matchesSearch && matchesModule && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Gestion des Ventes</h1>
          <p className="text-gray-400">Suivi des revenus et transactions</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0">
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CA Total</p>
                <p className="text-2xl text-white">{salesKPIs.totalRevenue.toLocaleString()}€</p>
                <p className="text-green-400 text-sm">+{salesKPIs.monthlyRevenue.toLocaleString()}€ ce mois</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ventes totales</p>
                <p className="text-2xl text-white">{salesKPIs.totalSales}</p>
                <p className="text-blue-400 text-sm">Panier moyen: {salesKPIs.avgOrderValue}€</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Meilleure journée</p>
                <p className="text-2xl text-white">{salesKPIs.bestDay.amount}€</p>
                <p className="text-orange-400 text-sm">{salesKPIs.bestDay.date}</p>
              </div>
              <Trophy className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top Module</p>
                <p className="text-lg text-white">{salesKPIs.topModule.name}</p>
                <p className="text-cyan-400 text-sm">{salesKPIs.topModule.sales} ventes</p>
              </div>
              <Calendar className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des revenus */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Évolution des revenus (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
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
                dataKey="amount" 
                stroke="#F97316" 
                strokeWidth={3}
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher une vente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Module" />
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
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des ventes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-left">
                  <th className="p-4 text-gray-400 text-sm">Client</th>
                  <th className="p-4 text-gray-400 text-sm">Module</th>
                  <th className="p-4 text-gray-400 text-sm">Prix</th>
                  <th className="p-4 text-gray-400 text-sm">Date</th>
                  <th className="p-4 text-gray-400 text-sm">Paiement</th>
                  <th className="p-4 text-gray-400 text-sm">Statut</th>
                  <th className="p-4 text-gray-400 text-sm">Source</th>
                  <th className="p-4 text-gray-400 text-sm">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={sale.avatar} alt={sale.client} />
                          <AvatarFallback className="bg-gray-600 text-white text-xs">
                            {sale.client.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm">{sale.client}</p>
                          <p className="text-gray-400 text-xs">{sale.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">{sale.module}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-green-400 text-sm font-medium">{sale.price}€</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">{sale.date}</p>
                      <p className="text-gray-400 text-xs">{sale.time}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(sale.paymentMethod)}
                        <span className="text-white text-sm">{sale.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {sale.source}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-400 text-xs font-mono">{sale.transactionId}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredSales.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Aucune vente trouvée</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}