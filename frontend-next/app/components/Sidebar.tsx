'use client';

import React, { useState } from 'react';
import { FileText, Users, Clapperboard, Film, ChevronLeft, ListTree, HelpCircle, Cpu, Sun, Moon, Loader2, LogOut } from 'lucide-react';
// import logoImg from '../logo.png';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from './ProfileModal';

interface SidebarProps {
  currentStage: string;
  setStage: (stage: 'script' | 'assets' | 'director' | 'export' | 'prompts') => void;
  onExit: () => void;
  projectName?: string;
  activeEpisodeName?: string;
  onShowOnboarding?: () => void;
  onShowModelConfig?: () => void;
  isNavigationLocked?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStage, setStage, onExit, projectName, activeEpisodeName, onShowOnboarding, onShowModelConfig, isNavigationLocked }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { id: 'script', label: '小说与剧本', icon: FileText, sub: 'Phase 01' },
    { id: 'assets', label: '角色与场景', icon: Users, sub: 'Phase 02' },
    { id: 'director', label: '导演工作台', icon: Clapperboard, sub: 'Phase 03' },
    { id: 'export', label: '成片与导出', icon: Film, sub: 'Phase 04' },
    { id: 'prompts', label: '提示词管理', icon: ListTree, sub: 'Advanced' },
  ];

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-72'} bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 flex flex-col z-50 select-none transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="w-full flex justify-between items-center mb-6">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-3 group cursor-pointer ${collapsed ? 'justify-center flex-1' : ''}`}
          >
            {/* <img src={logoImg} alt="Logo" className="w-8 h-8 flex-shrink-0 transition-transform group-hover:scale-110" /> */}
            <span className="text-2xl">🍌</span>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-sidebar-foreground tracking-wider group-hover:text-sidebar-primary transition-colors">AiDrama</h1>
                <p className="text-[10px] text-sidebar-foreground/70 tracking-widest group-hover:text-sidebar-primary transition-colors">Studio Pro</p>
              </div>
            )}
          </a>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground flex-shrink-0"
            title={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {!collapsed && (
          <button 
            onClick={onExit}
            className={`flex items-center gap-2 transition-colors text-xs font-mono uppercase tracking-wide group w-full ${
              isNavigationLocked 
                ? 'text-sidebar-foreground/50 opacity-50 cursor-not-allowed' 
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
            }`}
            title={isNavigationLocked ? '生成任务进行中，退出将导致数据丢失' : undefined}
          >
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            返回项目列表
          </button>
        )}
      </div>

      {/* Project Status */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border">
           <div className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest mb-1">当前项目</div>
           <div className="text-sm font-medium text-sidebar-foreground truncate font-mono">{projectName || '未命名项目'}</div>
           {activeEpisodeName ? (
             <div className="mt-2 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               <span className="text-[10px] text-sidebar-foreground/70 truncate">
                 当前剧本：{activeEpisodeName}
               </span>
             </div>
           ) : (
             <div className="mt-2 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
               <span className="text-[10px] text-yellow-500">
                 未选择剧本
               </span>
             </div>
           )}
        </div>
      )}

      {/* Generation Lock Indicator */}
      {!collapsed && isNavigationLocked && (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-yellow-500 animate-spin flex-shrink-0" />
            <span className="text-[10px] font-medium text-yellow-500 uppercase tracking-wide">生成任务进行中</span>
          </div>
          <p className="text-[10px] text-sidebar-foreground/50 mt-1 leading-relaxed">
            切换页面将导致数据丢失
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = currentStage === item.id;
          const isLocked = isNavigationLocked && !isActive;
          return (
            <button
              key={item.id}
              onClick={() => setStage(item.id as 'script' | 'assets' | 'director' | 'export' | 'prompts')}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-2 transition-all duration-200 group relative border-l-2 ${
                isActive 
                  ? 'border-sidebar-primary bg-sidebar-accent text-sidebar-primary-foreground'
                  : isLocked
                    ? 'border-transparent text-sidebar-foreground/50 opacity-50 cursor-not-allowed'
                    : 'border-transparent text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
              title={isLocked ? '生成任务进行中，切换页面将导致数据丢失' : item.label}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-sidebar-primary' : isLocked ? 'text-sidebar-foreground/50' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'}`} />
                {!collapsed && (
                  <span className="font-medium text-xs tracking-wider uppercase">{item.label}</span>
                )}
              </div>
              {!collapsed && (
                <span className={`text-[10px] font-mono ${isActive ? 'text-sidebar-foreground/70' : 'text-sidebar-foreground/50'}`}>{item.sub}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer transition-colors`}
          title={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
        >
          {!collapsed && (
            <span className="font-mono text-[10px] uppercase tracking-widest">{theme === 'dark' ? '亮色主题' : '暗色主题'}</span>
          )}
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {onShowOnboarding && (
          <button 
            onClick={onShowOnboarding}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer transition-colors`}
            title="新手引导"
          >
            {!collapsed && (
              <span className="font-mono text-[10px] uppercase tracking-widest">新手引导</span>
            )}
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
        {onShowModelConfig && (
          <button 
            onClick={onShowModelConfig}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer transition-colors`}
            title="模型配置"
          >
            {!collapsed && (
              <span className="font-mono text-[10px] uppercase tracking-widest">模型配置</span>
            )}
            <Cpu className="w-4 h-4" />
          </button>
        )}
        {user && (
          <div className="pt-3 border-t border-sidebar-border">
            {!collapsed ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="font-mono text-[10px] text-sidebar-foreground/50 truncate mr-2 hover:text-sidebar-foreground hover:underline underline-offset-2 cursor-pointer transition-colors"
                  title="修改账户信息"
                >
                  {user.username}
                </button>
                <button
                  onClick={async () => await logout()}
                  className="flex items-center gap-1.5 text-sidebar-foreground/50 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0"
                  title="退出登录"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest">退出</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="p-2 rounded-full hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  title={`${user.username} - 修改账户信息`}
                >
                  <span className="text-sm">👤</span>
                </button>
                <button
                  onClick={async () => await logout()}
                  className="p-2 rounded-full hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-red-500"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </aside>
  );
};

export default Sidebar;