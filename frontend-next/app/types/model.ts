export interface ChatModelDefinition {
  id: string;
  name: string;
  modelName?: string;
  apiModel?: string;
  provider: string;
  providerId?: string;
  type: 'text';
  isEnabled: boolean;
  isBuiltIn?: boolean;
  maxTokens?: number;
  temperature?: number;
  endpoint?: string;
  description?: string;
  params?: any;
}

export interface ImageModelDefinition {
  id: string;
  name: string;
  apiModel?: string;
  endpoint?: string;
  provider: string;
  providerId?: string;
  type: 'image';
  isEnabled: boolean;
  isBuiltIn?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  supportedAspectRatios?: string[];
  params?: {
    defaultAspectRatio?: string;
  };
  description?: string;
}

export interface VideoModelDefinition {
  id: string;
  name: string;
  apiModel?: string;
  endpoint?: string;
  provider: string;
  providerId?: string;
  type: 'video';
  isEnabled: boolean;
  isBuiltIn?: boolean;
  maxDuration?: number;
  supportedAspectRatios?: string[];
  params?: {
    supportedAspectRatios?: AspectRatio[];
    supportedDurations?: VideoDuration[];
    defaultAspectRatio?: AspectRatio;
    defaultDuration?: VideoDuration;
    mode?: 'async' | 'sync';
  };
  description?: string;
}

export type ImageApiFormat = 'png' | 'jpeg' | 'webp' | 'openai-image' | 'dashscope-image' | 'gemini';

export type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16';

export type VideoDuration = '5s' | '10s' | '15s' | '30s';

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  isEnabled: boolean;
}

export interface Model {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video';
  providerId: string;
  isEnabled: boolean;
  config?: any;
}

export interface ChatOptions {
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json';
  timeout?: number;
  systemPrompt?: string;
  overrideParams?: any;
}

export interface ImageGenerateOptions {
  model: string;
  prompt: string;
  aspectRatio?: AspectRatio;
  quality?: 'standard' | 'hd';
  referenceImages?: string[];
}

export interface VideoGenerateOptions {
  model?: string;
  prompt?: string;
  prompts?: string[];
  startImage?: string;
  endImage?: string;
  duration?: VideoDuration;
  aspectRatio?: AspectRatio;
}

export const DEFAULT_ACTIVE_MODELS = {
  text: 'gpt-4o-mini',
  image: 'dall-e-3',
  video: 'ep-20250516140456-xqxzh'
};

export const BUILTIN_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1'
  },
  {
    id: 'dashscope',
    name: '阿里云 DashScope',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
  },
  {
    id: 'volcengine',
    name: '火山引擎',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3'
  }
];

export const ALL_BUILTIN_MODELS = [
  // OpenAI 模型
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    type: 'text',
    providerId: 'openai',
    isEnabled: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    type: 'text',
    providerId: 'openai',
    isEnabled: true
  },
  {
    id: 'dall-e-3',
    name: 'DALL·E 3',
    type: 'image',
    providerId: 'openai',
    isEnabled: true
  },
  // 阿里云模型
  {
    id: 'qwen2.5-72b-a14b',
    name: '通义千问 2.5',
    type: 'text',
    providerId: 'dashscope',
    isEnabled: true
  },
  {
    id: 'ep-20250516140456-xqxzh',
    name: '通义视觉',
    type: 'image',
    providerId: 'dashscope',
    isEnabled: true
  },
  {
    id: 'ep-20250516140456-xqxzh',
    name: '通义视频',
    type: 'video',
    providerId: 'dashscope',
    isEnabled: true
  },
  // 火山引擎模型
  {
    id: 'ep-20250516140456-xqxzh',
    name: '火山引擎文本',
    type: 'text',
    providerId: 'volcengine',
    isEnabled: true
  },
  {
    id: 'ep-20250516140456-xqxzh',
    name: '火山引擎图像',
    type: 'image',
    providerId: 'volcengine',
    isEnabled: true
  },
  {
    id: 'ep-20250516140456-xqxzh',
    name: '火山引擎视频',
    type: 'video',
    providerId: 'volcengine',
    isEnabled: true
  }
];

export type ModelType = 'chat' | 'image' | 'video' | 'text';

export type ModelDefinition = ChatModelDefinition | ImageModelDefinition | VideoModelDefinition;

export interface ModelProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  isEnabled: boolean;
  isBuiltIn?: boolean;
  isDefault?: boolean;
}

export interface ModelRegistryState {
  providers: ModelProvider[];
  models: ModelDefinition[];
  activeModels: ActiveModels;
}

export interface ActiveModels {
  text: string;
  image: string;
  video: string;
  audio?: string;
}

export const deprecatedVideoModelIds = ['old-video-model'];

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  storageUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
  twelveLabsVideoId?: string;
  twelveLabsStatus?: 'pending' | 'indexing' | 'ready' | 'failed';
  twelveLabsError?: string;
}

export type ChatModelParams = {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
};

export type Status = 'idle' | 'pending' | 'generating' | 'completed' | 'failed';

export interface AlertOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}