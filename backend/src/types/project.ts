export interface ProjectState {
  id: string;
  title: string;
  description?: string;
  stage: 'script' | 'assets' | 'director' | 'export' | 'prompts';
  novelEpisodes?: NovelEpisode[];
  selectedEpisodeId?: string | null;
  characters?: Character[];
  scenes?: Scene[];
  props?: Prop[];
  shots?: Shot[];
  visualStyles?: VisualStyle[];
  renderLogs?: RenderLog[];
  qualityAssessment?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface NovelEpisode {
  id: string;
  name: string;
  content: string;
  chapters?: NovelChapter[];
}

export interface NovelChapter {
  id: string;
  title: string;
  content: string;
  scenes?: Scene[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: string;
  personality: string;
  wardrobe?: string[];
  turnaround?: string[];
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  background: string;
  atmosphere: string;
  props?: string[];
}

export interface Prop {
  id: string;
  name: string;
  description: string;
  appearance: string;
}

export interface Shot {
  id: string;
  sceneId: string;
  shotNumber: number;
  description: string;
  prompt: string;
  duration: number;
  cameraMovement: string;
  characters: string[];
  props: string[];
  imageUrl?: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface VisualStyle {
  id: string;
  name: string;
  prompt: string;
  examples?: string[];
}

export interface RenderLog {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  result?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video';
  config: any;
  createdAt: string;
  updatedAt: string;
}