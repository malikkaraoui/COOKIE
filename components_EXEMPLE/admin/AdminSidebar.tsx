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