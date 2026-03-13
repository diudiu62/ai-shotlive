'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getToken,
  getSavedUser,
  saveAuth,
  clearAuth,
  setAuthExpiredCallback,
  apiPost,
  apiGet,
  apiPut,
} from '../services/apiClient';
import { fetchVisualStyles } from '../services/visualStyleService';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (currentPassword: string, newUsername?: string, newPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

/**
 * 检查是否在浏览器环境中
 */
const isBrowser = typeof window !== 'undefined';

/**
 * 从服务器同步用户偏好到 localStorage
 */
const syncPreferencesFromServer = async () => {
  try {
    const prefs = await apiGet<{ theme: string; onboarding_completed: boolean }>('/api/preferences');
    if (isBrowser) {
      if (prefs.theme) {
        localStorage.setItem('AiDrama_theme', prefs.theme);
        document.documentElement.setAttribute('data-theme', prefs.theme);
      }
      if (prefs.onboarding_completed) {
        localStorage.setItem('AiDrama_onboarding_completed', 'true');
      } else {
        localStorage.removeItem('AiDrama_onboarding_completed');
      }
    }
  } catch {
    // 同步失败使用本地默认值
  }
};

/**
 * 将当前 localStorage 中的偏好上传到服务器
 */
const syncPreferencesToServer = async () => {
  try {
    if (isBrowser) {
      const theme = localStorage.getItem('AiDrama_theme') || 'dark';
      const onboardingCompleted = localStorage.getItem('AiDrama_onboarding_completed') === 'true';
      await apiPut('/api/preferences', {
        theme,
        onboarding_completed: onboardingCompleted,
      });
    }
  } catch {
    // 同步失败不影响使用
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      // 退出前先把当前偏好同步到服务器
      await syncPreferencesToServer();
      // 调用后端退出登录接口，记录日志
      await apiPost('/api/auth/logout', {});
    } catch (error) {
      // 同步失败或接口调用失败不影响退出
      console.error('同步偏好或退出登录失败:', error);
    }

    clearAuth();
    // 清除用户级别的 localStorage 缓存
    if (isBrowser) {
      localStorage.removeItem('AiDrama_model_registry');
      localStorage.removeItem('AiDrama_onboarding_completed');
    }
    setUser(null);
  }, []);

  // 设置认证过期回调
  useEffect(() => {
    setAuthExpiredCallback(handleLogout);
  }, [handleLogout]);

  // 启动时验证已存在的 token
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // 先尝试使用本地存储的用户信息
        const savedUser = getSavedUser();
        if (savedUser) {
          setUser(savedUser);
        }

        // 再异步验证 token 有效性
        const data = await apiGet<{ user: User }>('/api/auth/me');
        setUser(data.user);

        // token 有效，同步用户偏好并预加载视觉风格缓存
        await syncPreferencesFromServer();
        fetchVisualStyles().catch(() => {});
      } catch {
        // token 无效，清除
        clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await apiPost<{ token: string; user: User }>('/api/auth/login', {
      username,
      password,
    });
    saveAuth(data.token, data.user);
    setUser(data.user);

    // 登录后从服务器同步数据到 localStorage
    try {
      // 同步模型注册表
      const registry = await apiGet('/api/models/registry');
      if (isBrowser && registry) {
        localStorage.setItem('AiDrama_model_registry', JSON.stringify(registry));
      }
      // 同步用户偏好（主题、引导状态）
      await syncPreferencesFromServer();
      // 预加载视觉风格缓存
      fetchVisualStyles().catch(() => {});
    } catch {
      // 同步失败不影响登录
    }
  };

  const register = async (username: string, password: string) => {
    const data = await apiPost<{ token: string; user: User }>('/api/auth/register', {
      username,
      password,
    });
    saveAuth(data.token, data.user);
    setUser(data.user);
  };

  const updateProfile = async (currentPassword: string, newUsername?: string, newPassword?: string) => {
    const data = await apiPut<{ token: string; user: User }>('/api/auth/profile', {
      currentPassword,
      newUsername: newUsername || undefined,
      newPassword: newPassword || undefined,
    });
    saveAuth(data.token, data.user);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout: handleLogout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
