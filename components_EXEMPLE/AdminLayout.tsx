import React from 'react';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminDashboard } from './admin/AdminDashboard';
import { ModulesManagement } from './admin/ModulesManagement';
import { ClientsManagement } from './admin/ClientsManagement';
import { SalesManagement } from './admin/SalesManagement';
import { ServicesManagement } from './admin/ServicesManagement';
import { ProjectManagement } from './admin/ProjectManagement';
import { AffiliatesManagement } from './admin/AffiliatesManagement';
import { SupportManagement } from './admin/SupportManagement';
import { SettingsManagement } from './admin/SettingsManagement';
import { LiveManagement } from './admin/LiveManagement';

interface AdminLayoutProps {
  adminSection: string;
  onSectionChange: (section: string) => void;
  onBackToUser: () => void;
}

export function AdminLayout({ adminSection, onSectionChange, onBackToUser }: AdminLayoutProps) {
  const renderAdminContent = () => {
    switch (adminSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'modules':
        return <ModulesManagement />;
      case 'clients':
        return <ClientsManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'affiliates':
        return <AffiliatesManagement />;
      case 'support':
        return <SupportManagement />;
      case 'settings':
        return <SettingsManagement />;
      case 'lives':
        return <LiveManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark flex">
      <AdminSidebar 
        activeSection={adminSection}
        onSectionChange={onSectionChange}
        onBackToUser={onBackToUser}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
          {renderAdminContent()}
        </main>
      </div>
    </div>
  );
}