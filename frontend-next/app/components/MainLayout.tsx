'use client';

import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from './ProfileModal';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  currentStage?: string;
  onSetStage?: (stage: 'script' | 'assets' | 'director' | 'export' | 'prompts') => void;
  onExit?: () => void;
  projectName?: string;
  activeEpisodeName?: string;
  onShowOnboarding?: () => void;
  onShowModelConfig?: () => void;
  isNavigationLocked?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'AI Drama Director',
  showSidebar = true,
  showHeader = false,
  currentStage,
  onSetStage,
  onExit,
  projectName,
  activeEpisodeName,
  onShowOnboarding,
  onShowModelConfig,
  isNavigationLocked = false,
}) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      {showHeader && (
        <header className="sticky top-0 z-30 bg-background border-b border-border py-3 px-4 md:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <a 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 group cursor-pointer"
              >
                <span className="text-2xl">🍌</span>
                <div>
                  <h2 className="text-sm font-bold tracking-wider group-hover:text-primary transition-colors">AiDrama</h2>
                  <p className="text-xs text-muted-foreground tracking-widest group-hover:text-primary transition-colors">Studio Pro</p>
                </div>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-primary"
                title={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {user && (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md transition-colors hover:bg-muted text-sm"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.username}</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {showSidebar && (
          <Sidebar 
            currentStage={currentStage || ''}
            setStage={onSetStage || (() => {})}
            onExit={onExit || (() => {})}
            projectName={projectName}
            activeEpisodeName={activeEpisodeName}
            onShowOnboarding={onShowOnboarding}
            onShowModelConfig={onShowModelConfig}
            isNavigationLocked={isNavigationLocked}
            collapsed={collapsed}
            onCollapseChange={setCollapsed}
          />
        )}

        <main className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 layout-section ${showSidebar ? (collapsed ? 'md:ml-16' : 'md:ml-72') : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};

export default MainLayout;