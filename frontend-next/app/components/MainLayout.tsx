'use client';

import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon, User, LogOut, HelpCircle, Settings, FileText, Users, Clapperboard, Film, ListTree, ChevronLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from './ProfileModal';

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

  const navItems = [
    { id: 'script', label: '小说与剧本', sub: 'Phase 01', icon: FileText },
    { id: 'assets', label: '角色与场景', sub: 'Phase 02', icon: Users },
    { id: 'director', label: '导演工作台', sub: 'Phase 03', icon: Clapperboard },
    { id: 'export', label: '成片与导出', sub: 'Phase 04', icon: Film },
    { id: 'prompts', label: '提示词管理', sub: 'Advanced', icon: ListTree },
  ];

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
          <aside 
            className={`fixed md:static inset-y-0 left-0 z-40 ${collapsed ? 'w-16' : 'w-72'} bg-background border-r border-border transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <a 
                  href="/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 group cursor-pointer ${collapsed ? 'justify-center flex-1' : ''}`}
                >
                  <span className="text-2xl">🍌</span>
                  {!collapsed && (
                    <div>
                      <h2 className="text-sm font-bold tracking-wider group-hover:text-primary transition-colors">AiDrama</h2>
                      <p className="text-xs text-muted-foreground tracking-widest group-hover:text-primary transition-colors">Studio Pro</p>
                    </div>
                  )}
                </a>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
                    title={collapsed ? '展开侧边栏' : '收起侧边栏'}
                  >
                    <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {!collapsed && projectName && (
                <div className="p-4 border-b border-border">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">当前项目</div>
                  <div className="text-sm font-medium text-secondary truncate font-mono">{projectName}</div>
                  {activeEpisodeName ? (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground truncate">
                        当前剧本：{activeEpisodeName}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      <span className="text-xs text-yellow-500">
                        未选择剧本
                      </span>
                    </div>
                  )}
                </div>
              )}

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = currentStage === item.id;
                  const isLocked = isNavigationLocked && !isActive;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSetStage?.(item.id as 'script' | 'assets' | 'director' | 'export' | 'prompts')}
                      className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-3 transition-all duration-200 group relative border-l-2 ${
                        isActive 
                          ? 'border-primary bg-muted text-primary'
                          : isLocked
                            ? 'border-transparent text-muted-foreground opacity-50 cursor-not-allowed'
                            : 'border-transparent text-muted-foreground hover:text-primary hover:bg-muted'
                      }`}
                      title={isLocked ? '生成任务进行中，切换页面将导致数据丢失' : item.label}
                      disabled={isLocked}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : isLocked ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                        {!collapsed && (
                          <span className="font-medium text-sm tracking-wide uppercase">{item.label}</span>
                        )}
                      </div>
                      {!collapsed && (
                        <span className="text-xs font-mono text-muted-foreground">{item.sub}</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border">
                <div className="space-y-3">
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'flex-start'} gap-2 transition-colors text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-primary`}
                    title={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {!collapsed && (
                      <span>{theme === 'dark' ? '亮色主题' : '暗色主题'}</span>
                    )}
                  </button>
                  
                  {onShowOnboarding && (
                    <button
                      onClick={onShowOnboarding}
                      className={`w-full flex items-center ${collapsed ? 'justify-center' : 'flex-start'} gap-2 transition-colors text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-primary`}
                      title="新手引导"
                    >
                      <HelpCircle className="w-4 h-4" />
                      {!collapsed && <span>新手引导</span>}
                    </button>
                  )}
                  
                  {onShowModelConfig && (
                    <button
                      onClick={onShowModelConfig}
                      className={`w-full flex items-center ${collapsed ? 'justify-center' : 'flex-start'} gap-2 transition-colors text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-primary`}
                      title="模型配置"
                    >
                      <Settings className="w-4 h-4" />
                      {!collapsed && <span>模型配置</span>}
                    </button>
                  )}
                  
                  {user && (
                    <div className="pt-3 border-t border-border">
                      {!collapsed ? (
                        <>
                          <button
                            onClick={() => setShowProfileModal(true)}
                            className="w-full flex items-center gap-2 transition-colors text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-primary"
                          >
                            <User className="w-4 h-4" />
                            {user.username}
                          </button>
                          
                          <button
                            onClick={async () => await logout()}
                            className="w-full flex items-center gap-2 transition-colors text-xs font-mono uppercase tracking-wide text-destructive hover:text-destructive/80 mt-2"
                            title="退出登录"
                          >
                            <LogOut className="w-4 h-4" />
                            退出登录
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <button
                            onClick={() => setShowProfileModal(true)}
                            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                            title={`${user.username} - 修改账户信息`}
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => await logout()}
                            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                            title="退出登录"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {onExit && !collapsed && (
                    <div className="pt-3 border-t border-border">
                      <button 
                        onClick={onExit}
                        className={`w-full flex items-center gap-2 transition-colors text-xs font-mono uppercase tracking-wide ${
                          isNavigationLocked 
                            ? 'text-muted-foreground opacity-50 cursor-not-allowed' 
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                        title={isNavigationLocked ? '生成任务进行中，退出将导致数据丢失' : undefined}
                        disabled={isNavigationLocked}
                      >
                        <X className="w-3 h-3" />
                        返回项目列表
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
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