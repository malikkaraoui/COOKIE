import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Trophy,
  Download,
  Share2,
  Calendar,
  Award,
  Target,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';

export function CertificatesPage() {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  // Mock data
  const earnedCertificates = [
    {
      id: '1',
      title: 'Expert E-commerce',
      category: 'E-commerce',
      earnedAt: '2025-01-15',
      validUntil: '2027-01-15',
      credentialId: 'EC-2025-001847',
      modules: [
        'Shopify Mastery',
        'Dropshipping Pro',
        'E-commerce Analytics',
        'Payment Systems',
        'Customer Retention',
        'Growth Hacking E-com'
      ],
      skills: ['Shopify', 'Dropshipping', 'Analytics', 'CRO', 'Marketing'],
      issuer: 'START Modules Academy',
      badge: '🏆',
      color: 'from-yellow-500 to-orange-500',
      verification: 'https://certificates.startmodules.com/verify/EC-2025-001847'
    },
    {
      id: '2',
      title: 'Maître SEO',
      category: 'SEO',
      earnedAt: '2025-01-10',
      validUntil: '2027-01-10',
      credentialId: 'SEO-2025-001623',
      modules: [
        'SEO Technique',
        'Content Strategy',
        'Link Building',
        'Local SEO'
      ],
      skills: ['Technical SEO', 'Content', 'Backlinks', 'Analytics'],
      issuer: 'START Modules Academy',
      badge: '🎯',
      color: 'from-blue-500 to-cyan-400',
      verification: 'https://certificates.startmodules.com/verify/SEO-2025-001623'
    },
    {
      id: '3',
      title: 'Copywriter Certifié',
      category: 'Copywriting',
      earnedAt: '2025-01-05',
      validUntil: '2027-01-05',
      credentialId: 'CW-2025-001234',
      modules: [
        'Copywriting Émotionnel',
        'Sales Pages',
        'Email Marketing',
        'Social Media Copy',
        'Psychology of Persuasion'
      ],
      skills: ['Persuasion', 'Email', 'Sales Copy', 'Psychology'],
      issuer: 'START Modules Academy',
      badge: '✍️',
      color: 'from-purple-500 to-pink-500',
      verification: 'https://certificates.startmodules.com/verify/CW-2025-001234'
    }
  ];

  const upcomingCertificates = [
    {
      id: '4',
      title: 'IA Marketing Expert',
      category: 'Intelligence Artificielle',
      requiredModules: 8,
      completedModules: 3,
      nextModule: 'ChatGPT pour le Marketing',
      estimatedCompletion: '2025-02-15',
      badge: '🤖',
      color: 'from-blue-500 to-cyan-400',
      modules: [
        { name: 'Introduction IA Marketing', completed: true },
        { name: 'ChatGPT Marketing', completed: true },
        { name: 'Automation AI', completed: true },
        { name: 'Content AI Generation', completed: false },
        { name: 'AI Analytics', completed: false },
        { name: 'Predictive Marketing', completed: false },
        { name: 'AI Customer Service', completed: false },
        { name: 'Advanced AI Strategies', completed: false }
      ]
    },
    {
      id: '5',
      title: 'Branding Specialist',
      category: 'Branding',
      requiredModules: 6,
      completedModules: 2,
      nextModule: 'Logo Design Principles',
      estimatedCompletion: '2025-03-01',
      badge: '🎨',
      color: 'from-pink-500 to-purple-500',
      modules: [
        { name: 'Brand Strategy', completed: true },
        { name: 'Visual Identity', completed: true },
        { name: 'Logo Design', completed: false },
        { name: 'Brand Guidelines', completed: false },
        { name: 'Brand Communication', completed: false },
        { name: 'Brand Evolution', completed: false }
      ]
    }
  ];

  const stats = {
    totalEarned: earnedCertificates.length,
    totalInProgress: upcomingCertificates.length,
    totalSkills: [...new Set(earnedCertificates.flatMap(cert => cert.skills))].length,
    avgCompletionTime: '45 jours',
    nextMilestone: 'IA Marketing Expert'
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl text-white">Mes Certificats</h1>
            <p className="text-gray-400">Gérez et partagez vos certifications professionnelles</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl text-white mb-1">{stats.totalEarned}</div>
              <p className="text-gray-300 text-sm">Certificats obtenus</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl text-white mb-1">{stats.totalInProgress}</div>
              <p className="text-gray-300 text-sm">En cours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl text-white mb-1">{stats.totalSkills}</div>
              <p className="text-gray-300 text-sm">Compétences validées</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-500/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xl text-white mb-1">{stats.avgCompletionTime}</div>
              <p className="text-gray-300 text-sm">Temps moyen</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="earned" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
          <TabsTrigger value="earned" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Certificats obtenus
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-white">
            En cours
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {earnedCertificates.map((cert) => (
              <Card key={cert.id} className="bg-gray-800 border-gray-700 overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${cert.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{cert.badge}</div>
                      <div>
                        <CardTitle className="text-white text-lg">{cert.title}</CardTitle>
                        <p className="text-white/80 text-sm">{cert.category}</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      Certifié
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Obtenu le</p>
                      <p className="text-white">{cert.earnedAt}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Valide jusqu'au</p>
                      <p className="text-white">{cert.validUntil}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">ID de certification</p>
                    <p className="text-white text-sm font-mono bg-gray-700 p-2 rounded">
                      {cert.credentialId}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Compétences validées</p>
                    <div className="flex flex-wrap gap-1">
                      {cert.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="space-y-6">
            {upcomingCertificates.map((cert) => (
              <Card key={cert.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl opacity-70">{cert.badge}</div>
                      <div>
                        <CardTitle className="text-white">{cert.title}</CardTitle>
                        <p className="text-gray-400">{cert.category}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      En cours
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Progression</p>
                      <p className="text-white">
                        {cert.completedModules}/{cert.requiredModules} modules
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Prochaine étape</p>
                      <p className="text-white">{cert.nextModule}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Fin estimée</p>
                      <p className="text-white">{cert.estimatedCompletion}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progression globale</span>
                      <span className="text-white">
                        {Math.round((cert.completedModules / cert.requiredModules) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(cert.completedModules / cert.requiredModules) * 100} 
                      className="h-2 bg-gray-700" 
                    />
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-3">Modules requis</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cert.modules.map((module, index) => (
                        <div 
                          key={index}
                          className="flex items-center space-x-2 p-2 rounded bg-gray-700/50"
                        >
                          {module.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-sm ${module.completed ? 'text-white' : 'text-gray-400'}`}>
                            {module.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Continuer vers la certification
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Prochaine étape */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-white">Prochaine certification</h3>
                <p className="text-gray-300">
                  Plus que 5 modules pour obtenir "{stats.nextMilestone}"
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
              Continuer la formation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}