'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StageExport from "../../components/StageExport";
import MainLayout from "../../components/MainLayout";
import { ProjectState } from '@/app/types/types';
import { loadProjectFromDB } from '@/app/services/storageService';

function ExportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const [project, setProject] = useState<ProjectState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const projectData = await loadProjectFromDB(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetStage = (stage: 'script' | 'assets' | 'director' | 'export' | 'prompts') => {
    if (isNavigationLocked) return;
    router.push(`/stages/${stage}?projectId=${projectId}`);
  };

  const handleExit = () => {
    if (isNavigationLocked) return;
    router.push('/dashboard');
  };

  const handleGeneratingChange = (isGenerating: boolean) => {
    setIsNavigationLocked(isGenerating);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!project) {
    return <div className="flex justify-center items-center h-screen">Project not found</div>;
  }

  return (
    <MainLayout
      currentStage="export"
      onSetStage={handleSetStage}
      onExit={handleExit}
      projectName={project.title}
      isNavigationLocked={isNavigationLocked}
    >
      <StageExport 
        project={project} 
        onGeneratingChange={handleGeneratingChange}
      />
    </MainLayout>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ExportPageContent />
    </Suspense>
  );
}
