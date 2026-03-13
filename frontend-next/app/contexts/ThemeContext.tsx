'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiPut } from '../services/apiClient';

const STORAGE_KEY = 'AiDrama_theme';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    // 检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);

      // 添加主题切换动画
      document.documentElement.classList.add('theme-transition');
      
      // 异步同步到服务器（已登录时）
      const token = localStorage.getItem('AiDrama_auth_token');
      if (token) {
        apiPut('/api/preferences', {
          theme,
          onboarding_completed: localStorage.getItem('AiDrama_onboarding_completed') === 'true',
        }).catch(() => { /* 同步失败不影响使用 */ });
      }

      // 清理动画类
      return () => {
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 300);
      };
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        setTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
