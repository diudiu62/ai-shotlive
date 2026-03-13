/**
 * 通用模型表单组件
 * 支持添加新模型和编辑现有模型
 */

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { 
  ModelType, 
  ModelDefinition,
  ImageApiFormat,
  AspectRatio,
} from '../../types/model';
import { getProviders, addProvider } from '../../services/modelRegistry';
import { useAlert } from '../GlobalAlert';

interface ModelFormProps {
  type: ModelType;
  model?: ModelDefinition; // 编辑模式时传入现有模型
  onSave: (model: Omit<ModelDefinition, 'id' | 'isBuiltIn'>) => void;
  onCancel: () => void;
}

const IMAGE_API_FORMAT_OPTIONS = [
  { value: 'gemini' as ImageApiFormat, label: 'Google Gemini' },
  { value: 'openai-image' as ImageApiFormat, label: 'OpenAI / 火山引擎兼容的' },
  { value: 'dashscope-image' as ImageApiFormat, label: '阿里云百炼/通义' },
];

const ModelForm: React.FC<ModelFormProps> = ({ type, model, onSave, onCancel }) => {
  const existingProviders = getProviders();
  const { showAlert } = useAlert();
  
  const isEditMode = !!model;
  
  // 初始化表单状态
  const [name, setName] = useState(model?.name || '');
  const [apiModel, setApiModel] = useState(model?.apiModel || '');
  const [apiFormat, setApiFormat] = useState<ImageApiFormat>(
    (model?.type === 'image' ? (model as any).params?.apiFormat : undefined) || 'openai-image'
  );
  const [description, setDescription] = useState(model?.description || '');
  const [endpoint, setEndpoint] = useState(model?.endpoint || '');
  const [videoMode, setVideoMode] = useState<'sync' | 'async'>(
    (model?.type === 'video' ? (model as any).params?.mode : undefined) || 'sync'
  );
  
  // 视频模型特有参数
  const [defaultAspectRatio, setDefaultAspectRatio] = useState<'16:9' | '9:16' | '1:1'>(
    (model?.type === 'video' ? (model as any).params?.defaultAspectRatio : undefined) || '16:9'
  );
  const [supportedAspectRatios, setSupportedAspectRatios] = useState<('16:9' | '9:16' | '1:1')[]>(
    (model?.type === 'video' ? (model as any).params?.supportedAspectRatios : undefined) || ['16:9', '9:16']
  );
  const [defaultDuration, setDefaultDuration] = useState<number>(
    (model?.type === 'video' ? (model as any).params?.defaultDuration : undefined) || 8
  );
  const [supportedDurations, setSupportedDurations] = useState<number[]>(
    (model?.type === 'video' ? (model as any).params?.supportedDurations : undefined) || [4, 8, 12]
  );

  // 提供商配置
  const [providerMode, setProviderMode] = useState<'existing' | 'custom'>(model ? 'existing' : 'existing');
  const [selectedProviderId, setSelectedProviderId] = useState(model?.providerId || existingProviders[0]?.id || 'antsk');
  const [customProviderName, setCustomProviderName] = useState('');
  const [customProviderBaseUrl, setCustomProviderBaseUrl] = useState('');
  const [customProviderApiKey, setCustomProviderApiKey] = useState('');

  // 编辑模式时，初始化表单数据
  useEffect(() => {
    if (model && isEditMode) {
      setName(model.name);
      setApiModel(model.apiModel || '');
      setDescription(model.description || '');
      setEndpoint(model.endpoint || '');
      if (model.providerId) {
        setSelectedProviderId(model.providerId);
      }
      
      // 初始化模型特定参数
      if (model.type === 'image') {
        setApiFormat((model as any).params?.apiFormat || 'openai-image');
      } else if (model.type === 'video') {
        const videoParams = (model as any).params;
        setVideoMode(videoParams?.mode || 'sync');
        setDefaultAspectRatio(videoParams?.defaultAspectRatio || '16:9');
        setSupportedAspectRatios(videoParams?.supportedAspectRatios || ['16:9', '9:16']);
        setDefaultDuration(videoParams?.defaultDuration || 8);
        setSupportedDurations(videoParams?.supportedDurations || [4, 8, 12]);
      }
    }
  }, [model, isEditMode]);
  


  const handleSave = () => {
    if (!name.trim() || !apiModel.trim()) {
      showAlert('请填写模型名称和 API 模型名', { type: 'warning' });
      return;
    }

    // 处理提供商
    let providerId = selectedProviderId;
    
    if (providerMode === 'custom') {
      if (!customProviderName.trim() || !customProviderBaseUrl.trim()) {
        showAlert('请填写自定义提供商名称和 API 基础 URL', { type: 'warning' });
        return;
      }
      const sanitizedBaseUrl = customProviderBaseUrl.trim().replace(/\/+$/, '');
      // 创建新提供商（包含 API Key）
      const newProvider = addProvider({
        name: customProviderName.trim(),
        baseUrl: sanitizedBaseUrl,
        apiKey: customProviderApiKey.trim(),
        isDefault: false,
        isEnabled: true,
      });
      providerId = newProvider.id;
    }

    // 根据模型类型设置参数（统一使用表单中的当前值）
    let params: any;
    
    if (type === 'chat') {
      // 对话模型：使用默认参数结构
      params = { temperature: 0.7, max_tokens: 2000 };
    } else if (type === 'image') {
      // 图片模型：使用表单中的参数
      params = { 
        defaultAspectRatio: '16:9' as AspectRatio, 
        supportedAspectRatios: ['16:9', '9:16', '1:1'] as AspectRatio[],
        apiFormat 
      };
    } else {
      // 视频模型：使用表单中的参数
      params = {
        mode: videoMode,
        defaultAspectRatio,
        supportedAspectRatios,
        defaultDuration,
        supportedDurations,
      };
    }

    const modelData: Omit<ModelDefinition, 'id' | 'isBuiltIn'> = {
      name: name.trim(),
      apiModel: apiModel.trim(),
      type,
      providerId,
      endpoint: endpoint.trim() || undefined,
      description: description.trim() || undefined,
      isEnabled: isEditMode ? (model?.isEnabled ?? true) : true,
      params,
    } as any;

    onSave(modelData);
  };

  return (
    <div className="bg-[var(--bg-elevated)]/50 border border-[var(--border-secondary)] rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-bold text-[var(--text-primary)]">
        {isEditMode ? '编辑模型' : '添加自定义模型'}
      </h4>
      
      {/* 基础信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">模型名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：GPT-4 Turbo"
            className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">API 模型名 *（可与内置重复）</label>
          <input
            type="text"
            value={apiModel}
            onChange={(e) => setApiModel(e.target.value)}
            placeholder="如：gpt-4-turbo、claude-3-opus"
            className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono"
          />
          <p className="text-[9px] text-[var(--text-muted)] mt-1">
            该字段会作为 API 请求中的 model 参数；内部 ID 会自动生成
          </p>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">接口格式</label>
        {/* 下拉框选择接口格式 */}
        <select
          value={apiFormat}
          onChange={(e) => setApiFormat(e.target.value as ImageApiFormat)}
          className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        >
          {IMAGE_API_FORMAT_OPTIONS.map(({value, label}) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">描述（可选）</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="可选的描述信息"
          className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* API 端点 */}
      <div>
        <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">API 端点 (Endpoint)</label>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder={type === 'chat' ? '/v1/chat/completions' : type === 'image' ? '/v1beta/models/{model}:generateContent' : '/v1/videos'}
          className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono"
        />
        <p className="text-[9px] text-[var(--text-muted)] mt-1">
          留空则使用默认端点
        </p>
      </div>

      {/* 提供商选择 */}
      <div>
        <label className="text-[10px] text-[var(--text-tertiary)] block mb-2">API 提供商</label>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setProviderMode('existing')}
            className={`flex-1 py-2 text-xs rounded transition-colors ${
              providerMode === 'existing'
                ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
            }`}
          >
            使用已有提供商
          </button>
          <button
            onClick={() => setProviderMode('custom')}
            className={`flex-1 py-2 text-xs rounded transition-colors ${
              providerMode === 'custom'
                ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
            }`}
          >
            添加新提供商
          </button>
        </div>
        
        {providerMode === 'existing' ? (
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            {existingProviders.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.baseUrl})</option>
            ))}
          </select>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">提供商名称 *</label>
              <input
                type="text"
                value={customProviderName}
                onChange={(e) => setCustomProviderName(e.target.value)}
                placeholder="如：OpenAI Official"
                className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">API 基础 URL *</label>
              <input
                type="text"
                value={customProviderBaseUrl}
                onChange={(e) => setCustomProviderBaseUrl(e.target.value)}
                placeholder="如：https://api.openai.com"
                className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">提供商 API Key *</label>
              <input
                type="password"
                value={customProviderApiKey}
                onChange={(e) => setCustomProviderApiKey(e.target.value)}
                placeholder="输入此提供商的 API Key"
                className="w-full bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono"
              />
              <p className="text-[9px] text-[var(--text-muted)] mt-1">
                此 API Key 会用于该提供商下的所有模型
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 视频模型特有选项 */}
      {type === 'video' && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">API 模式</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVideoMode('sync')}
                className={`flex-1 py-2 text-xs rounded transition-colors ${
                  videoMode === 'sync'
                    ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
                }`}
              >
                同步模式（Chat Completion 类）
              </button>
              <button
                onClick={() => setVideoMode('async')}
                className={`flex-1 py-2 text-xs rounded transition-colors ${
                  videoMode === 'async'
                    ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
                }`}
              >
                异步模式（Sora 类）
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              同步模式：直接返回结果；异步模式：先创建任务，再轮询获取结果
            </p>
          </div>

          {/* 横竖屏比例配置 */}
          <div>
            <label className="text-[10px] text-[var(--text-tertiary)] block mb-2">支持的横竖屏比例</label>
            <div className="flex gap-2 mb-2">
              {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                <label key={ratio} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={supportedAspectRatios.includes(ratio)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSupportedAspectRatios([...supportedAspectRatios, ratio]);
                      } else {
                        setSupportedAspectRatios(supportedAspectRatios.filter(r => r !== ratio));
                      }
                    }}
                    className="w-3 h-3"
                  />
                  {ratio === '16:9' ? '横屏' : ratio === '9:16' ? '竖屏' : '方形'}
                </label>
              ))}
            </div>
            <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">默认比例</label>
            <div className="flex gap-2">
              {supportedAspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setDefaultAspectRatio(ratio)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    defaultAspectRatio === ratio
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                      : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
                  }`}
                >
                  {ratio === '16:9' ? '横屏' : ratio === '9:16' ? '竖屏' : '方形'}
                </button>
              ))}
            </div>
          </div>

          {/* 时长配置（简洁现代风格） */}
          <div>
            <label className="text-[10px] text-[var(--text-tertiary)] font-medium block mb-3">视频时长配置</label>
            
            {/* 支持的时长列表 */}
            <div className="space-y-2">
              <label className="text-[9px] text-[var(--text-muted)] block">支持的时长选项（点击设为默认）</label>
              <div className="flex flex-wrap gap-2">
                {supportedDurations.map((duration, index) => (
                  <div key={index} className="relative group">
                    <button
                      onClick={() => setDefaultDuration(duration)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        defaultDuration === duration 
                          ? 'bg-[var(--success-bg)] text-[var(--success-text)]' 
                          : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-secondary)]'
                      }`}
                    >
                      <span>{duration}秒</span>
                      {defaultDuration === duration && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSupportedDurations(supportedDurations.filter((_, i) => i !== index));
                        // 如果删除的是默认时长，自动选择第一个时长作为默认
                        if (defaultDuration === duration && supportedDurations.length > 1) {
                          setDefaultDuration(supportedDurations[0] === duration ? supportedDurations[1] : supportedDurations[0]);
                        }
                      }}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--danger-bg)] text-[var(--danger-text)] rounded-full p-0.5 hover:bg-[var(--danger-hover)]"
                      title="删除此时长选项"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="秒数"
                    className="w-16 bg-[var(--bg-hover)] border border-[var(--border-secondary)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const newDuration = Number(input.value);
                        if (newDuration >= 1 && newDuration <= 60) {
                          setSupportedDurations([...supportedDurations, newDuration]);
                          // 如果是第一个时长，自动设为默认
                          if (supportedDurations.length === 0) {
                            setDefaultDuration(newDuration);
                          }
                          input.value = '';
                        }
                      }
                    }}
                  />

                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-[var(--text-muted)] mt-3">
              当前默认时长：<span className="font-medium text-[var(--success-text)]">{defaultDuration}秒</span> • 支持1-60秒的视频时长
            </p>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 bg-[var(--accent)] text-[var(--text-primary)] text-xs font-bold rounded hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-1"
        >
          <Check className="w-3 h-3" />
          {isEditMode ? '保存修改' : '添加模型'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 bg-[var(--bg-hover)] text-[var(--text-tertiary)] text-xs rounded hover:bg-[var(--border-secondary)] transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ModelForm;