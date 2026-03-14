'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, Loader2, Folder, ChevronRight, ChevronLeft, Calendar, AlertTriangle, Settings, Cpu, Archive, Search, Users, MapPin, Database, Palette, Package } from 'lucide-react';
import { ProjectState, AssetLibraryItem, Character, Scene, Prop } from '@/app/types/types';
import { getAllProjectsMetadata, createNewProjectState, deleteProjectFromDB, fetchAssetLibraryPaginated, deleteAssetFromLibrary, loadProjectFromDB, saveProjectToDB, exportUserDataArchive, importUserDataArchive } from '../services/storageService';
import { applyLibraryItemToProject } from '../services/assetLibraryService';
import { useAlert } from './GlobalAlert';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from './ProfileModal';
import VisualStyleManager from './VisualStyleManager';
import MainLayout from './MainLayout';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Props {
  onShowOnboarding?: () => void;
  onShowModelConfig?: () => void;
}

const Dashboard: React.FC<Props> = ({ onShowOnboarding, onShowModelConfig }) => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [libraryItems, setLibraryItems] = useState<AssetLibraryItem[]>([]);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryPageSize] = useState(10);
  const [libraryProjectOptions, setLibraryProjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'character' | 'scene' | 'prop'>('all');
  const [libraryProjectFilter, setLibraryProjectFilter] = useState<string | null>('all');
  const [assetToUse, setAssetToUse] = useState<AssetLibraryItem | null>(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDataExporting, setIsDataExporting] = useState(false);
  const [isDataImporting, setIsDataImporting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVisualStyleManager, setShowVisualStyleManager] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // 格式化日期函数
  const formatDate = useCallback((ts: number) => {
    return new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, []);

  // 加载项目列表
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getAllProjectsMetadata();
      setProjects(list);
    } catch (e) {
      console.error("Failed to load projects", e);
      showAlert('加载项目失败，请刷新页面重试', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // 获取资产库数据
  const fetchLibraryPage = useCallback(async (page: number = 1) => {
    setIsLibraryLoading(true);
    try {
      const res = await fetchAssetLibraryPaginated({
        page,
        pageSize: libraryPageSize,
        type: libraryFilter,
        projectId: libraryProjectFilter === 'all' || libraryProjectFilter === null ? 'all' : libraryProjectFilter,
      });
      setLibraryItems(res.items);
      setLibraryTotal(res.total);
      setLibraryPage(res.page);
      setLibraryProjectOptions(res.projectOptions || []);
    } catch (e) {
      console.error('❌ [资产库-Dashboard] 加载资产库失败:', e);
      showAlert('加载资产库失败，请稍后重试', { type: 'error' });
    } finally {
      setIsLibraryLoading(false);
    }
  }, [libraryPageSize, libraryFilter, libraryProjectFilter, showAlert]);

  // 当组件挂载时加载项目
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 当用户退出登录时，重定向到登录页面
  useEffect(() => {
    if (!user && !isAuthLoading) {
      router.push('/');
    }
  }, [user, isAuthLoading, router]);

  // 当资产库模态框打开或筛选条件变化时，重新获取数据
  useEffect(() => {
    if (!showLibraryModal) return;
    fetchLibraryPage(libraryPage);
  }, [showLibraryModal, libraryPage, fetchLibraryPage]);

  // 创建新项目
  const handleCreate = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const newProject = createNewProjectState();
      await saveProjectToDB(newProject);
      router.push(`/stages/${newProject.stage}?projectId=${newProject.id}`);
    } catch (e) {
      console.error('创建项目失败:', e);
      showAlert(`创建项目失败: ${e instanceof Error ? e.message : '未知错误'}`, { type: 'error' });
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, router, showAlert]);

  // 请求删除项目
  const requestDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  }, []);

  // 取消删除
  const cancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  }, []);

  // 确认删除项目
  const confirmDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // 获取项目名称用于提示
    const project = projects.find(p => p.id === id);
    const projectName = project?.title || '未命名项目';
    
    try {
        console.log('📋 准备删除项目及所有关联资源...');
        await deleteProjectFromDB(id);
        console.log('💾 重新加载项目列表...');
        await loadProjects();
        console.log(`✅ 项目 "${projectName}" 已成功删除`);
        showAlert(`项目 "${projectName}" 已成功删除`, { type: 'success' });
    } catch (error) {
        console.error("❌ 删除项目失败:", error);
        showAlert(`删除项目失败: ${error instanceof Error ? error.message : '未知错误'}\n\n请检查浏览器控制台查看详细信息`, { type: 'error' });
    } finally {
        setDeleteConfirmId(null);
    }
  }, [projects, loadProjects, showAlert]);

  // 删除资产库项目
  const handleDeleteLibraryItem = useCallback((itemId: string) => {
    showAlert('确定从资产库删除该资源吗？', {
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await deleteAssetFromLibrary(itemId);
          const nextTotal = Math.max(0, libraryTotal - 1);
          const nextTotalPages = Math.max(1, Math.ceil(nextTotal / libraryPageSize));
          const pageToShow = libraryPage > nextTotalPages ? nextTotalPages : libraryPage;
          if (pageToShow !== libraryPage) setLibraryPage(pageToShow);
          await fetchLibraryPage(pageToShow);
          showAlert('资产删除成功', { type: 'success' });
        } catch (error) {
          showAlert(`删除资产失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
        }
      }
    });
  }, [libraryTotal, libraryPageSize, libraryPage, fetchLibraryPage, showAlert]);

  // 使用资产库项目
  const handleUseAsset = useCallback(async (projectId: string) => {
    if (!assetToUse) return;
    try {
      const project = await loadProjectFromDB(projectId);
      const updated = applyLibraryItemToProject(project, assetToUse);
      await saveProjectToDB(updated);
      router.push(`/stages/${updated.stage}?projectId=${updated.id}`);
      setAssetToUse(null);
    } catch (error) {
      showAlert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
    }
  }, [assetToUse, router, showAlert]);

  // 过滤资产库项目
  const filteredLibraryItems = useMemo(() => {
    if (!libraryQuery.trim()) return libraryItems;
    const query = libraryQuery.trim().toLowerCase();
    return libraryItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [libraryItems, libraryQuery]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(libraryTotal / libraryPageSize));
  }, [libraryTotal, libraryPageSize]);

  // 导出数据
  const handleExportData = useCallback(async () => {
    if (isDataExporting) return;

    setIsDataExporting(true);
    try {
      await exportUserDataArchive();
      showAlert('导出完成，备份文件已下载。包含数据库数据及所有媒体文件。', { type: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      showAlert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
    } finally {
      setIsDataExporting(false);
    }
  }, [isDataExporting, showAlert]);

  // 触发导入数据
  const handleImportData = useCallback(() => {
    if (isDataImporting) return;
    importInputRef.current?.click();
  }, [isDataImporting]);

  // 处理导入文件变化
  const handleImportFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      showAlert('请选择 .zip 备份文件。', { type: 'warning' });
      return;
    }

    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    const confirmMessage = `将导入备份文件（${sizeMB} MB）。系统将自动创建新用户并导入全部数据。是否继续？`;

    showAlert(confirmMessage, {
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          setIsDataImporting(true);
          const result = await importUserDataArchive(file);
          showAlert(
            `导入完成！\n\n` +
            `已创建新用户：${result.newUser.username}\n` +
            `默认密码：${result.newUser.defaultPassword}\n\n` +
            `导入统计：${result.stats.projects} 个项目，${result.stats.assets} 个资产，${result.stats.files} 个文件。\n\n` +
            `请使用新账号登录查看导入的数据，并及时修改密码。`,
            { type: 'success' }
          );
        } catch (error) {
          console.error('Import failed:', error);
          showAlert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
        } finally {
          setIsDataImporting(false);
        }
      }
    });
  }, [showAlert]);

  return (
    <MainLayout title="项目库" showSidebar={false} showHeader={true}>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-foreground tracking-tight mb-2 flex items-center gap-3">
          项目库
          <span className="text-muted-foreground text-lg">/</span>
          <span className="text-muted-foreground text-sm font-mono tracking-widest uppercase">Projects Database</span>
        </h1>
        <p className="text-muted-foreground text-sm">管理您的 AI 短剧项目</p>
      </div>

      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {projects.length > 0 ? `共 ${projects.length} 个项目` : '暂无项目'}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="default"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 text-xs tracking-widest uppercase"
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">系统设置</span>
            </Button>
            <Button
              variant="default"
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center gap-3 px-6 text-xs tracking-widest uppercase"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="font-bold">{isCreating ? '创建中...' : '新建项目'}</span>
            </Button>
          </div>
        </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">加载项目中...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">暂无项目</h3>
          <p className="text-muted-foreground mb-6">点击下方按钮创建您的第一个 AI 短剧项目</p>
          <Button
            variant="default"
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center gap-2 px-6 text-xs tracking-widest uppercase"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="font-bold">{isCreating ? '创建中...' : '新建项目'}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create New Card */}
          <Card 
            onClick={isCreating ? undefined : handleCreate}
            className={`cursor-pointer transition-all duration-300 ${isCreating ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-1'}`}
          >
            <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-14 h-14 border border-border flex items-center justify-center mb-6 rounded-full transition-all duration-300 hover:scale-110">
                {isCreating ? <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" /> : <Plus className="w-6 h-6 text-muted-foreground" />}
              </div>
              <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{isCreating ? '创建中...' : 'Create New Project'}</span>
            </CardContent>
          </Card>

          {/* Project List */}
          {projects.map((proj) => (
            <Card 
              key={proj.id}
              onClick={() => router.push(`/stages/${proj.stage}?projectId=${proj.id}`)}
              className="cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
            >
              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === proj.id && (
                <div 
                  className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-200 rounded-xl"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <div className="w-12 h-12 bg-destructive/10 flex items-center justify-center rounded-full">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-foreground font-bold text-xs uppercase tracking-widest">确认删除项目？</p>
                    <p className="text-muted-foreground text-[10px] font-mono">此操作无法撤销</p>
                    <div className="text-[9px] text-muted-foreground space-y-1 pt-3 border-t border-border">
                      <p>将同时删除以下所有资源：</p>
                      <p className="text-muted-foreground font-mono">· 角色和场景参考图</p>
                      <p className="text-muted-foreground font-mono">· 所有关键帧图像</p>
                      <p className="text-muted-foreground font-mono">· 所有生成的视频片段</p>
                      <p className="text-muted-foreground font-mono">· 渲染历史记录</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full pt-3">
                    <Button 
                      onClick={cancelDelete}
                      variant="default"
                      className="flex-1 text-[10px] font-bold uppercase tracking-wider"
                    >
                      取消
                    </Button>
                    <Button 
                      onClick={(e) => confirmDelete(e, proj.id)}
                      variant="default"
                      className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 text-[10px] font-bold uppercase tracking-wider"
                    >
                      永久删除
                    </Button>
                  </div>
                </div>
              )}

              {/* Normal Content */}
              <div className="flex-1 p-6 relative flex flex-col">
                {/* Delete Button */}
                <Button 
                  variant="ghost"
                  onClick={(e) => requestDelete(e, proj.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-muted text-muted-foreground hover:text-destructive"
                  title="删除项目"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="flex-1">
                  <Folder className="w-8 h-8 text-muted-foreground mb-6" />
                  <h3 className="text-sm font-bold text-foreground mb-3 line-clamp-1 tracking-wide">{proj.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="text-[9px] font-mono uppercase tracking-wider">
                      {proj.stage === 'script' ? '剧本阶段' : 
                       proj.stage === 'assets' ? '资产生成' :
                       proj.stage === 'director' ? '导演工作台' : '导出阶段'}
                    </Badge>
                  </div>
                  {proj.scriptData?.logline && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-mono border-l border-border pl-2">
                      {proj.scriptData.logline}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-muted">
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {formatDate(proj.lastModified)}
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Card>
          ))}
        </div>
      )}

        {/* Settings Modal */}
        <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                系统设置
                <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Settings</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-2">
                管理模型配置、资产库以及数据导入导出
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {onShowModelConfig && (
                <Button
                  variant="default"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onShowModelConfig();
                  }}
                  className="p-4 text-left justify-start transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-foreground text-sm font-bold">
                    <Cpu className="w-4 h-4 text-primary" />
                    模型配置
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-2">管理模型与 API 设置</div>
                </Button>
              )}

              <Button
                variant="default"
                onClick={() => {
                  setShowSettingsModal(false);
                  setLibraryPage(1);
                  setLibraryProjectFilter('all');
                  setShowLibraryModal(true);
                }}
                className="p-4 text-left justify-start transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-foreground text-sm font-bold">
                  <Archive className="w-4 h-4 text-primary" />
                  资产库
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-2">浏览并复用角色与场景资产</div>
              </Button>

              <Button
                variant="default"
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowVisualStyleManager(true);
                }}
                className="p-4 text-left justify-start transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-foreground text-sm font-bold">
                  <Palette className="w-4 h-4 text-primary" />
                  视觉风格管理
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-2">管理视觉风格及提示词配置</div>
              </Button>

              <Button
                variant="default"
                onClick={handleExportData}
                disabled={isDataExporting}
                className="p-4 text-left justify-start transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-foreground text-sm font-bold">
                  <Database className="w-4 h-4 text-primary" />
                  {isDataExporting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      导出中...
                    </>
                  ) : (
                    '导出数据'
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-2">导出当前用户的数据库及媒体文件（ZIP）</div>
              </Button>

              <Button
                variant="default"
                onClick={handleImportData}
                disabled={isDataImporting}
                className="p-4 text-left justify-start transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-foreground text-sm font-bold">
                  <Database className="w-4 h-4 text-primary" />
                  {isDataImporting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      导入中...
                    </>
                  ) : (
                    '导入数据'
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-2">导入 ZIP 备份，自动创建新用户</div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Asset Library Modal */}
        <Dialog open={showLibraryModal} onOpenChange={setShowLibraryModal}>
          <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-end justify-between w-full">
                <div>
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <Archive className="w-4 h-4 text-primary" />
                    资产库
                    <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Asset Library</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-2">
                    在项目里将角色与场景加入资产库，跨项目复用
                  </DialogDescription>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                  共 {libraryTotal} 条，第 {libraryPage}/{totalPages} 页
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-3 mb-6 mt-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                  placeholder="搜索资产名称..."
                  className="pl-9 text-xs"
                />
              </div>
              <div className="min-w-[180px]">
                <Select
                  value={libraryProjectFilter || 'all'}
                  onValueChange={(value) => { setLibraryProjectFilter(value); setLibraryPage(1); }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部项目</SelectItem>
                    {libraryProjectOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                {(['all', 'character', 'scene', 'prop'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={libraryFilter === type ? "default" : "ghost"}
                    onClick={() => { setLibraryFilter(type); setLibraryPage(1); }}
                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {type === 'all' ? '全部' : type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具'}
                  </Button>
                ))}
              </div>
            </div>

            {isLibraryLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">加载资产中...</p>
              </div>
            ) : filteredLibraryItems.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-10 text-center">
                <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">暂无资产</h3>
                <p className="text-muted-foreground mb-6">可在项目的“角色与场景”中加入资产库</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredLibraryItems.map((item) => {
                    const preview =
                      item.type === 'character'
                        ? (item.data as Character).referenceImage
                        : item.type === 'scene'
                          ? (item.data as Scene).referenceImage
                          : (item.data as Prop).referenceImage;
                    return (
                      <Card key={item.id} className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="aspect-video bg-muted overflow-hidden">
                          {preview ? (
                            <img 
                              src={preview} 
                              alt={item.name} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              {item.type === 'character' ? (
                                <Users className="w-8 h-8 opacity-30" />
                              ) : item.type === 'scene' ? (
                                <MapPin className="w-8 h-8 opacity-30" />
                              ) : (
                                <Package className="w-8 h-8 opacity-30" />
                              )}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <div className="text-sm font-bold text-foreground line-clamp-1">{item.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">
                              {item.type === 'character' ? '角色' : item.type === 'scene' ? '场景' : '道具'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-1 line-clamp-1">
                              {(item.projectName && item.projectName.trim()) || '未知项目'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              onClick={() => setAssetToUse(item)}
                              className="flex-1 text-[10px] font-bold uppercase tracking-wider"
                            >
                              选择项目使用
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteLibraryItem(item.id)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      disabled={libraryPage <= 1 || isLibraryLoading}
                      onClick={() => setLibraryPage((p) => Math.max(1, p - 1))}
                      className="p-2 transition-colors"
                      title="上一页"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono">
                      {libraryPage} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      disabled={libraryPage >= totalPages || isLibraryLoading}
                      onClick={() => setLibraryPage((p) => Math.min(totalPages, p + 1))}
                      className="p-2 transition-colors"
                      title="下一页"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Asset Library Project Picker */}
        <Dialog open={!!assetToUse} onOpenChange={(open) => !open && setAssetToUse(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold tracking-widest uppercase">选择项目使用</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground font-mono">
                将资产“{assetToUse?.name}”导入到以下项目
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {projects.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-8 text-center">
                  <Folder className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">暂无项目可用</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projects.map((proj) => (
                    <Button
                      key={proj.id}
                      variant="default"
                      onClick={() => handleUseAsset(proj.id)}
                      className="p-4 text-left justify-start transition-all duration-300 hover:shadow-md"
                    >
                      <div className="text-sm font-bold text-foreground line-clamp-1">{proj.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-1">最后修改: {formatDate(proj.lastModified)}</div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}

        {showVisualStyleManager && <VisualStyleManager onClose={() => setShowVisualStyleManager(false)} />}

        <input
          ref={importInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={handleImportFileChange}
        />
    </MainLayout>
  );
};

export default Dashboard;
