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