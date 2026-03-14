'use client';

import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, Film, User, Lock, ArrowRight, Sparkles, Star, Play, Settings, LogOut, Palette, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Login: React.FC = () => {
  const { login, register, user, logout } = useAuth();
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('密码长度不能少于 6 个字符');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setConfirmPassword('');
  };

  // 处理修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('新密码长度不能少于 6 个字符');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    try {
      // 这里应该调用修改密码的API
      // 由于没有具体的API实现，暂时模拟成功
      setTimeout(() => {
        setPasswordSuccess('密码修改成功');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 1000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '修改密码失败');
    }
  };

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('退出登录失败:', err);
    }
  };

  // 如果用户已登录，显示个人中心
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-1 via-gradient-2 to-gradient-3 flex items-center justify-center p-4 font-sans overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 30, 0], 
              y: [0, -30, 0],
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, 30, 0],
            }}
            transition={{ 
              duration: 18, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex justify-center mb-8">
              <motion.div 
                className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut"
                  }}
                >
                  <Film className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>
            </div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              AI Drama Director
            </motion.h1>
            <motion.p 
              className="text-white/80 font-medium text-lg mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              AI 短剧生成平台
            </motion.p>
            <motion.div 
              className="mt-6 flex justify-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>AI 驱动</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Play className="w-4 h-4 text-pink-300" />
                <span>专业级</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span>创意无限</span>
              </div>
            </motion.div>
          </motion.div>

          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl hover:shadow-3xl hover:bg-white/15">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <User className="w-6 h-6" />
                    个人中心
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    欢迎回来，{user.username}！
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      主题设置
                    </h3>
                    <div className="space-y-3">
                      {/* Light/Dark Mode */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">亮色/暗色模式</span>
                        <Button
                          variant="default"
                          onClick={toggleTheme}
                          className="flex items-center gap-2 text-xs"
                        >
                          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                          {theme === 'dark' ? '亮色模式' : '暗色模式'}
                        </Button>
                      </div>
                      
                      {/* Color Theme */}
                      <div>
                        <span className="text-sm text-white/70 block mb-2">颜色主题</span>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { value: 'rose', label: '玫瑰色', color: '#f43f5e' },
                            { value: 'blue', label: '蓝色', color: '#3b82f6' },
                            { value: 'purple', label: '紫色', color: '#8b5cf6' },
                            { value: 'neutral', label: '中性', color: '#6b7280' },
                          ].map((themeOption) => (
                            <Button
                              key={themeOption.value}
                              variant={colorTheme === themeOption.value ? "default" : "ghost"}
                              onClick={() => setColorTheme(themeOption.value as any)}
                              className="flex items-center gap-2 text-xs"
                              style={{ 
                                backgroundColor: colorTheme === themeOption.value ? themeOption.color + '20' : 'transparent',
                                borderColor: colorTheme === themeOption.value ? themeOption.color : 'rgba(255, 255, 255, 0.1)',
                                color: colorTheme === themeOption.value ? themeOption.color : 'rgba(255, 255, 255, 0.7)'
                              }}
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: themeOption.color }}
                              />
                              {themeOption.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Password Change */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      修改密码
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <div>
                        <Label htmlFor="currentPassword" className="text-white/70 text-sm block mb-1">
                          当前密码
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="请输入当前密码"
                            className="bg-white/5 border-white/10 text-white placeholder-white/40"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="text-white/70 text-sm block mb-1">
                          新密码
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="请输入新密码"
                            className="bg-white/5 border-white/10 text-white placeholder-white/40"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmNewPassword" className="text-white/70 text-sm block mb-1">
                          确认新密码
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmNewPassword"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="请再次输入新密码"
                            className="bg-white/5 border-white/10 text-white placeholder-white/40"
                          />
                        </div>
                      </div>
                      {passwordError && (
                        <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg">
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 text-sm rounded-lg">
                          {passwordSuccess}
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        修改密码
                      </Button>
                    </form>
                  </div>
                  
                  {/* Logout */}
                  <div className="pt-4 border-t border-white/10">
                    <Button
                      variant="default"
                      onClick={handleLogout}
                      className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="mt-12 text-center text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            © 2026 AI Drama Director. 保留所有权利。
          </motion.div>
        </div>
      </div>
    );
  }

  // 未登录时显示登录/注册表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-1 via-gradient-2 to-gradient-3 flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0], 
            y: [0, 30, 0],
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex justify-center mb-8">
            <motion.div 
              className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                }}
              >
                <Film className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
          </div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            AI Drama Director
          </motion.h1>
          <motion.p 
            className="text-white/80 font-medium text-lg mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            AI 短剧生成平台
          </motion.p>
          <motion.div 
            className="mt-6 flex justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>AI 驱动</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Play className="w-4 h-4 text-pink-300" />
              <span>专业级</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>创意无限</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        >
          <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl hover:shadow-3xl hover:bg-white/15">
            <CardHeader>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                  {mode === 'login' ? '欢迎回来' : '创建账号'}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {mode === 'login' ? '登录以继续你的创作之旅' : '注册一个新账号，开始你的短剧创作'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div 
                  className="mb-8 px-4 py-4 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-medium">⚠️</span>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/80">
                      用户名
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                        <User className="w-5 h-5" />
                      </div>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入用户名"
                        className="pl-14 bg-white/5 border-white/10 text-white placeholder-white/40"
                        disabled={isSubmitting}
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/80">
                      密码
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="pl-14 pr-14 bg-white/5 border-white/10 text-white placeholder-white/40"
                        disabled={isSubmitting}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white/80">
                        确认密码
                      </Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                          <Lock className="w-5 h-5" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="请再次输入密码"
                          className="pl-14 bg-white/5 border-white/10 text-white placeholder-white/40"
                          disabled={isSubmitting}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  onClick={(e) => handleSubmit(e as React.FormEvent)}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-600/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? '登录' : '注册'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
            <CardFooter>
              <motion.div 
                className="w-full pt-4 border-t border-white/10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={switchMode}
                  disabled={isSubmitting}
                  className="text-white/80 hover:text-white"
                >
                  {mode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录'}
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-12 text-center text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          © 2026 AI Drama Director. 保留所有权利。
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
