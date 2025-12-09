import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  user: any;
  onAccessAdmin?: () => void;
  onProfileClick?: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  showHeader?: boolean;
}

export function Layout({
  children,
  activeCategory,
  onCategoryChange,
  user,
  onAccessAdmin,
  onProfileClick,
  isMobile = false,
  isTablet = false,
  showHeader = true
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Calculer les dimensions pour chaque bloc
  const sidebarWidth = isMobile ? 0 : (isTablet ? 288 : 256); // w-64 = 256px, w-72 = 288px
  // Hauteur du header (barre principale + barre XP avec padding)
  const headerHeight = isMobile ? 85 : (isTablet ? 90 : 95);

  return (
    <div className="h-screen bg-gradient-to-br from-[#FFF5E6] via-white to-[#E6F7F7] overflow-hidden">
      {/* $COOKIE Gradient Background */}
      <div className="fixed top-0 right-0 w-96 h-96 cookie-gradient-bg pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 cookie-gradient-bg pointer-events-none z-0"></div>
      
      {/* BLOC 1: TOPBAR - Fixed en haut sur toute la largeur */}
      {showHeader && (
        <Header 
          user={user} 
          onAccessAdmin={onAccessAdmin}
          onProfileClick={onProfileClick}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      )}

      {/* Mobile Overlay pour la sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
          style={{ top: showHeader ? `${headerHeight}px` : 0 }}
        />
      )}

      {/* BLOC 2: SIDEBAR - Fixed à gauche, commence sous le header */}
      {!isMobile && (
        <div 
          className="fixed left-0 bottom-0 z-30"
          style={{ 
            top: showHeader ? `${headerHeight}px` : 0,
            width: `${sidebarWidth}px`
          }}
        >
          <Sidebar 
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            isMobile={isMobile}
            isTablet={isTablet}
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
        </div>
      )}

      {/* Mobile Sidebar - Overlay complet */}
      {isMobile && (
        <div 
          className={`
            fixed left-0 bottom-0 z-50
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            transition-transform duration-300 ease-in-out
          `}
          style={{ 
            top: showHeader ? `${headerHeight}px` : 0,
            width: '320px'
          }}
        >
          <Sidebar 
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            isMobile={isMobile}
            isTablet={isTablet}
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
        </div>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <div 
          className="fixed left-4 z-40"
          style={{ top: showHeader ? `${headerHeight + 16}px` : '16px' }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-gray-900 hover:bg-white bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      )}
      
      {/* BLOC 3: CONTENU CENTRAL - Scrollable, commence sous le header et à droite de la sidebar */}
      <main 
        className="absolute overflow-y-auto"
        style={{
          top: showHeader ? `${headerHeight}px` : 0,
          left: isMobile ? 0 : `${sidebarWidth}px`,
          right: 0,
          bottom: 0,
          padding: 0
        }}
      >
        {children}
      </main>
    </div>
  );
}