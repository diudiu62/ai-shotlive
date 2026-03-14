'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type ColorTheme = 'rose' | 'blue' | 'purple' | 'neutral';

interface ThemeContextValue {
  theme: Theme;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// 主题颜色配置
const themeColors = {
  rose: {
    light: {
      'background': 'oklch(1.0000 0.0000 0)',
      'foreground': 'oklch(0.1498 0.0047 96.4752)',
      'card': 'oklch(1.0000 0.0000 0)',
      'card-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'popover': 'oklch(1.0000 0.0000 0)',
      'popover-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'primary': 'oklch(0.6368 0.2134 25.4865)',
      'primary-foreground': 'oklch(1.0000 0.0000 0)',
      'secondary': 'oklch(0.9702 0.0166 26.9437)',
      'secondary-foreground': 'oklch(0.6368 0.2134 25.4865)',
      'muted': 'oklch(0.9702 0.0166 26.9437)',
      'muted-foreground': 'oklch(0.5560 0.0887 28.6065)',
      'accent': 'oklch(0.9702 0.0166 26.9437)',
      'accent-foreground': 'oklch(0.6368 0.2134 25.4865)',
      'destructive': 'oklch(0.6498 0.2078 25.7599)',
      'border': 'oklch(0.9216 0.0250 27.7401)',
      'input': 'oklch(0.9216 0.0250 27.7401)',
      'ring': 'oklch(0.6368 0.2134 25.4865)',
      'chart-1': 'oklch(0.6368 0.2134 25.4865)',
      'chart-2': 'oklch(0.7400 0.1800 25.0000)',
      'chart-3': 'oklch(0.5500 0.2000 25.0000)',
      'chart-4': 'oklch(0.4500 0.1800 25.0000)',
      'chart-5': 'oklch(0.3500 0.1500 25.0000)',
      'sidebar': 'oklch(0.9850 0.0090 96.4752)',
      'sidebar-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'sidebar-primary': 'oklch(0.6368 0.2134 25.4865)',
      'sidebar-primary-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-accent': 'oklch(0.9702 0.0166 26.9437)',
      'sidebar-accent-foreground': 'oklch(0.6368 0.2134 25.4865)',
      'sidebar-border': 'oklch(0.9216 0.0250 27.7401)',
      'sidebar-ring': 'oklch(0.6368 0.2134 25.4865)',
    },
    dark: {
      'background': 'oklch(0.1498 0.0047 96.4752)',
      'foreground': 'oklch(1.0000 0.0000 0)',
      'card': 'oklch(0.2050 0.0060 96.4752)',
      'card-foreground': 'oklch(1.0000 0.0000 0)',
      'popover': 'oklch(0.2050 0.0060 96.4752)',
      'popover-foreground': 'oklch(1.0000 0.0000 0)',
      'primary': 'oklch(0.6368 0.2134 25.4865)',
      'primary-foreground': 'oklch(1.0000 0.0000 0)',
      'secondary': 'oklch(0.2690 0.0075 96.4752)',
      'secondary-foreground': 'oklch(1.0000 0.0000 0)',
      'muted': 'oklch(0.2690 0.0075 96.4752)',
      'muted-foreground': 'oklch(0.7080 0.0120 96.4752)',
      'accent': 'oklch(0.2690 0.0075 96.4752)',
      'accent-foreground': 'oklch(1.0000 0.0000 0)',
      'destructive': 'oklch(0.6498 0.2078 25.7599)',
      'border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'input': 'oklch(1.0000 0.0000 0 / 0.1500)',
      'ring': 'oklch(0.6368 0.2134 25.4865)',
      'chart-1': 'oklch(0.6368 0.2134 25.4865)',
      'chart-2': 'oklch(0.7400 0.1800 25.0000)',
      'chart-3': 'oklch(0.5500 0.2000 25.0000)',
      'chart-4': 'oklch(0.4500 0.1800 25.0000)',
      'chart-5': 'oklch(0.3500 0.1500 25.0000)',
      'sidebar': 'oklch(0.2050 0.0060 96.4752)',
      'sidebar-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-primary': 'oklch(0.6368 0.2134 25.4865)',
      'sidebar-primary-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-accent': 'oklch(0.2690 0.0075 96.4752)',
      'sidebar-accent-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'sidebar-ring': 'oklch(0.6368 0.2134 25.4865)',
    }
  },
  blue: {
    light: {
      'background': 'oklch(1.0000 0.0000 0)',
      'foreground': 'oklch(0.1498 0.0047 96.4752)',
      'card': 'oklch(1.0000 0.0000 0)',
      'card-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'popover': 'oklch(1.0000 0.0000 0)',
      'popover-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'primary': 'oklch(0.6368 0.1544 259.8150)',
      'primary-foreground': 'oklch(1.0000 0.0000 0)',
      'secondary': 'oklch(0.9702 0.0116 256.0870)',
      'secondary-foreground': 'oklch(0.6368 0.1544 259.8150)',
      'muted': 'oklch(0.9702 0.0116 256.0870)',
      'muted-foreground': 'oklch(0.5560 0.0662 257.6980)',
      'accent': 'oklch(0.9702 0.0116 256.0870)',
      'accent-foreground': 'oklch(0.6368 0.1544 259.8150)',
      'destructive': 'oklch(0.6498 0.1867 25.7599)',
      'border': 'oklch(0.9216 0.0185 257.0090)',
      'input': 'oklch(0.9216 0.0185 257.0090)',
      'ring': 'oklch(0.6368 0.1544 259.8150)',
      'chart-1': 'oklch(0.6368 0.1544 259.8150)',
      'chart-2': 'oklch(0.7400 0.1300 260.0000)',
      'chart-3': 'oklch(0.5500 0.1500 260.0000)',
      'chart-4': 'oklch(0.4500 0.1300 260.0000)',
      'chart-5': 'oklch(0.3500 0.1000 260.0000)',
      'sidebar': 'oklch(0.9850 0.0090 96.4752)',
      'sidebar-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'sidebar-primary': 'oklch(0.6368 0.1544 259.8150)',
      'sidebar-primary-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-accent': 'oklch(0.9702 0.0116 256.0870)',
      'sidebar-accent-foreground': 'oklch(0.6368 0.1544 259.8150)',
      'sidebar-border': 'oklch(0.9216 0.0185 257.0090)',
      'sidebar-ring': 'oklch(0.6368 0.1544 259.8150)',
    },
    dark: {
      'background': 'oklch(0.1498 0.0047 96.4752)',
      'foreground': 'oklch(1.0000 0.0000 0)',
      'card': 'oklch(0.2050 0.0060 96.4752)',
      'card-foreground': 'oklch(1.0000 0.0000 0)',
      'popover': 'oklch(0.2050 0.0060 96.4752)',
      'popover-foreground': 'oklch(1.0000 0.0000 0)',
      'primary': 'oklch(0.6368 0.1544 259.8150)',
      'primary-foreground': 'oklch(1.0000 0.0000 0)',
      'secondary': 'oklch(0.2690 0.0075 96.4752)',
      'secondary-foreground': 'oklch(1.0000 0.0000 0)',
      'muted': 'oklch(0.2690 0.0075 96.4752)',
      'muted-foreground': 'oklch(0.7080 0.0120 96.4752)',
      'accent': 'oklch(0.2690 0.0075 96.4752)',
      'accent-foreground': 'oklch(1.0000 0.0000 0)',
      'destructive': 'oklch(0.6498 0.1867 25.7599)',
      'border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'input': 'oklch(1.0000 0.0000 0 / 0.1500)',
      'ring': 'oklch(0.6368 0.1544 259.8150)',
      'chart-1': 'oklch(0.6368 0.1544 259.8150)',
      'chart-2': 'oklch(0.7400 0.1300 260.0000)',
      'chart-3': 'oklch(0.5500 0.1500 260.0000)',
      'chart-4': 'oklch(0.4500 0.1300 260.0000)',
      'chart-5': 'oklch(0.3500 0.1000 260.0000)',
      'sidebar': 'oklch(0.2050 0.0060 96.4752)',
      'sidebar-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-primary': 'oklch(0.6368 0.1544 259.8150)',
      'sidebar-primary-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-accent': 'oklch(0.2690 0.0075 96.4752)',
      'sidebar-accent-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'sidebar-ring': 'oklch(0.6368 0.1544 259.8150)',
    }
  },
  purple: {
    light: {
      'background': 'oklch(1.0000 0.0000 0)',
      'foreground': 'oklch(0.1498 0.0047 96.4752)',
      'card': 'oklch(1.0000 0.0000 0)',
      'card-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'popover': 'oklch(1.0000 0.0000 0)',
      'popover-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'primary': 'oklch(0.6368 0.1844 305.8150)',
      'primary-foreground': 'oklch(1.0000 0.0000 0)',
      'secondary': 'oklch(0.9702 0.0136 302.0870)',
      'secondary-foreground': 'oklch(0.6368 0.1844 305.8150)',
      'muted': 'oklch(0.9702 0.0136 302.0870)',
      'muted-foreground': 'oklch(0.5560 0.0762 303.6980)',
      'accent': 'oklch(0.9702 0.0136 302.0870)',
      'accent-foreground': 'oklch(0.6368 0.1844 305.8150)',
      'destructive': 'oklch(0.6498 0.1867 25.7599)',
      'border': 'oklch(0.9216 0.0215 303.0090)',
      'input': 'oklch(0.9216 0.0215 303.0090)',
      'ring': 'oklch(0.6368 0.1844 305.8150)',
      'chart-1': 'oklch(0.6368 0.1844 305.8150)',
      'chart-2': 'oklch(0.7400 0.1500 306.0000)',
      'chart-3': 'oklch(0.5500 0.1700 306.0000)',
      'chart-4': 'oklch(0.4500 0.1500 306.0000)',
      'chart-5': 'oklch(0.3500 0.1200 306.0000)',
      'sidebar': 'oklch(0.9850 0.0090 96.4752)',
      'sidebar-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'sidebar-primary': 'oklch(0.6368 0.1844 305.8150)',
      'sidebar-primary-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-accent': 'oklch(0.9702 0.0136 302.0870)',
      'sidebar-accent-foreground': 'oklch(0.6368 0.1844 305.8150)',
      'sidebar-border': 'oklch(0.9216 0.0215 303.0090)',
      'sidebar-ring': 'oklch(0.6368 0.1844 305.8150)',
    },
    dark: {
      'background': 'oklch(0.1498 0.0047 96.4752)',
      'foreground': 'oklch(1.0000 0.0000 0)',
      'card': 'oklch(0.2050 0.0060 96.4752)',
      'card-foreground': 'oklch(1.0000 0.0000 0)',
      'popover': 'oklch(0.2050 0.0060 96.4752)',
      'popover-foreground': 'oklch(1.0000 0.0000 0)',
      'primary': 'oklch(0.6368 0.1844 305.8150)',
      'primary-foreground': 'oklch(1.0000 0.0000 0)',
      'secondary': 'oklch(0.2690 0.0075 96.4752)',
      'secondary-foreground': 'oklch(1.0000 0.0000 0)',
      'muted': 'oklch(0.2690 0.0075 96.4752)',
      'muted-foreground': 'oklch(0.7080 0.0120 96.4752)',
      'accent': 'oklch(0.2690 0.0075 96.4752)',
      'accent-foreground': 'oklch(1.0000 0.0000 0)',
      'destructive': 'oklch(0.6498 0.1867 25.7599)',
      'border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'input': 'oklch(1.0000 0.0000 0 / 0.1500)',
      'ring': 'oklch(0.6368 0.1844 305.8150)',
      'chart-1': 'oklch(0.6368 0.1844 305.8150)',
      'chart-2': 'oklch(0.7400 0.1500 306.0000)',
      'chart-3': 'oklch(0.5500 0.1700 306.0000)',
      'chart-4': 'oklch(0.4500 0.1500 306.0000)',
      'chart-5': 'oklch(0.3500 0.1200 306.0000)',
      'sidebar': 'oklch(0.2050 0.0060 96.4752)',
      'sidebar-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-primary': 'oklch(0.6368 0.1844 305.8150)',
      'sidebar-primary-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-accent': 'oklch(0.2690 0.0075 96.4752)',
      'sidebar-accent-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'sidebar-ring': 'oklch(0.6368 0.1844 305.8150)',
    }
  },
  neutral: {
    light: {
      'background': 'oklch(1.0000 0.0000 0)',
      'foreground': 'oklch(0.1498 0.0047 96.4752)',
      'card': 'oklch(1.0000 0.0000 0)',
      'card-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'popover': 'oklch(1.0000 0.0000 0)',
      'popover-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'primary': 'oklch(0.2050 0.0000 0)',
      'primary-foreground': 'oklch(0.9850 0.0000 0)',
      'secondary': 'oklch(0.9702 0.0000 0)',
      'secondary-foreground': 'oklch(0.2050 0.0000 0)',
      'muted': 'oklch(0.9702 0.0000 0)',
      'muted-foreground': 'oklch(0.5560 0.0000 0)',
      'accent': 'oklch(0.9702 0.0000 0)',
      'accent-foreground': 'oklch(0.2050 0.0000 0)',
      'destructive': 'oklch(0.5770 0.2450 27.3250)',
      'border': 'oklch(0.9220 0.0000 0)',
      'input': 'oklch(0.9220 0.0000 0)',
      'ring': 'oklch(0.7080 0.0000 0)',
      'chart-1': 'oklch(0.8090 0.1050 251.8130)',
      'chart-2': 'oklch(0.6230 0.2140 259.8150)',
      'chart-3': 'oklch(0.5460 0.2450 262.8810)',
      'chart-4': 'oklch(0.4880 0.2430 264.3760)',
      'chart-5': 'oklch(0.4240 0.1990 265.6380)',
      'sidebar': 'oklch(0.9850 0.0090 96.4752)',
      'sidebar-foreground': 'oklch(0.1498 0.0047 96.4752)',
      'sidebar-primary': 'oklch(0.2050 0.0000 0)',
      'sidebar-primary-foreground': 'oklch(0.9850 0.0000 0)',
      'sidebar-accent': 'oklch(0.9702 0.0000 0)',
      'sidebar-accent-foreground': 'oklch(0.2050 0.0000 0)',
      'sidebar-border': 'oklch(0.9220 0.0000 0)',
      'sidebar-ring': 'oklch(0.7080 0.0000 0)',
    },
    dark: {
      'background': 'oklch(0.1498 0.0047 96.4752)',
      'foreground': 'oklch(1.0000 0.0000 0)',
      'card': 'oklch(0.2050 0.0060 96.4752)',
      'card-foreground': 'oklch(1.0000 0.0000 0)',
      'popover': 'oklch(0.2050 0.0060 96.4752)',
      'popover-foreground': 'oklch(1.0000 0.0000 0)',
      'primary': 'oklch(0.9220 0.0000 0)',
      'primary-foreground': 'oklch(0.2050 0.0000 0)',
      'secondary': 'oklch(0.2690 0.0075 96.4752)',
      'secondary-foreground': 'oklch(1.0000 0.0000 0)',
      'muted': 'oklch(0.2690 0.0075 96.4752)',
      'muted-foreground': 'oklch(0.7080 0.0120 96.4752)',
      'accent': 'oklch(0.2690 0.0075 96.4752)',
      'accent-foreground': 'oklch(1.0000 0.0000 0)',
      'destructive': 'oklch(0.7040 0.1910 22.2160)',
      'border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'input': 'oklch(1.0000 0.0000 0 / 0.1500)',
      'ring': 'oklch(0.5560 0.0000 0)',
      'chart-1': 'oklch(0.8090 0.1050 251.8130)',
      'chart-2': 'oklch(0.6230 0.2140 259.8150)',
      'chart-3': 'oklch(0.5460 0.2450 262.8810)',
      'chart-4': 'oklch(0.4880 0.2430 264.3760)',
      'chart-5': 'oklch(0.4240 0.1990 265.6380)',
      'sidebar': 'oklch(0.2050 0.0060 96.4752)',
      'sidebar-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-primary': 'oklch(0.4880 0.2430 264.3760)',
      'sidebar-primary-foreground': 'oklch(0.9850 0.0000 0)',
      'sidebar-accent': 'oklch(0.2690 0.0075 96.4752)',
      'sidebar-accent-foreground': 'oklch(1.0000 0.0000 0)',
      'sidebar-border': 'oklch(1.0000 0.0000 0 / 0.1000)',
      'sidebar-ring': 'oklch(0.5560 0.0000 0)',
    }
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('AiDrama_theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window === 'undefined') return 'rose';
    const stored = localStorage.getItem('AiDrama_colorTheme') as ColorTheme | null;
    return stored === 'rose' || stored === 'blue' || stored === 'purple' || stored === 'neutral' ? stored : 'rose';
  });

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const setColorTheme = useCallback((next: ColorTheme) => {
    setColorThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // 更新主题时的副作用
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 更新亮色/暗色模式
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('AiDrama_theme', theme);

      // 更新颜色主题
      const themeConfig = themeColors[colorTheme];
      if (themeConfig) {
        const colors = themeConfig[theme === 'dark' ? 'dark' : 'light'];
        if (colors) {
          Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
          });
        }
      }
      localStorage.setItem('AiDrama_colorTheme', colorTheme);

      // 添加主题切换动画
      document.documentElement.classList.add('theme-transition');
      
      // 清理动画类
      return () => {
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 300);
      };
    }
  }, [theme, colorTheme]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        colorTheme,
        toggleTheme, 
        setTheme,
        setColorTheme,
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
