/**
 * 添加模型表单组件
 * 支持自定义提供商和 endpoint
 */

import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  ModelType, 
  ModelDefinition,
  ChatModelParams,
  ImageModelParams,
  VideoModelParams,
  DEFAULT_CHAT_PARAMS,
  DEFAULT_IMAGE_PARAMS,
  DEFAULT_VIDEO_PARAMS_SORA,
  DEFAULT_VIDEO_PARAMS_VEO,
  ImageApiFormat,
} from '../../types/model';
import { getProviders, addProvider } from '../../services/modelRegistry';
import { useAlert } from '../GlobalAlert';

interface AddModelFormProps {
  type: ModelType;
  onSave: (model: Omit<ModelDefinition, 'id' | 'isBuiltIn'>) => void;
  onCancel: () => void;
}

const IMAGE_API_FORMAT_OPTIONS = [
  { value: 'gemini' as ImageApiFormat, label: 'Google Gemini' },
  { value: 'openai-image' as ImageApiFormat, label: 'OpenAI / 火山引擎兼容的' },
  { value: 'dashscope-image' as ImageApiFormat, label: '阿里云百炼/通义' },
];

const AddModelForm: React.FC<AddModelFormProps> = ({ type, onSave, onCancel }) => {
  const existingProviders = getProviders();
  const { showAlert } = useAlert();
  
  const [name, setName] = useState('');
  const [apiModel, setApiModel] = useState('');
  const [apiFormat, setApiFormat] = useState<ImageApiFormat>('openai-image');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [videoMode, setVideoMode] = useState<'sync' | 'async'>('sync');
  
  // 视频模型特有参数
  const [defaultAspectRatio, setDefaultAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [supportedAspectRatios, setSupportedAspectRatios] = useState<('16:9' | '9:16' | '1:1')[]>(['16:9', '9:16']);
  const [defaultDuration, setDefaultDuration] = useState<4 | 8 | 12>(8);
  const [supportedDurations, setSupportedDurations] = useState<(4 | 8 | 12)[]>([4, 8, 12]);
  
  // 提供商配置
  const [providerMode, setProviderMode] = useState<'existing' | 'custom'>('existing');
  const [selectedProviderId, setSelectedProviderId] = useState(existingProviders[0]?.id || 'antsk');
  const [customProviderName, setCustomProviderName] = useState('');
  const [customProviderBaseUrl, setCustomProviderBaseUrl] = useState('');
  const [customProviderApiKey, setCustomProviderApiKey] = useState('');
  
  // 展开高级选项
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        apiKey: customProviderApiKey.trim() || undefined,
        isDefault: false,
      });
      providerId = newProvider.id;
    }

    // 根据模型类型设置默认参数
    let params: ChatModelParams | ImageModelParams | VideoModelParams;
    
    if (type === 'chat') {
      params = { ...DEFAULT_CHAT_PARAMS };
    } else if (type === 'image') {
      params = { ...DEFAULT_IMAGE_PARAMS, apiFormat };
    } else {
      params = {
        mode: videoMode,
        defaultAspectRatio,
        supportedAspectRatios,
        defaultDuration,
        supportedDurations,
      };
    }

    const model: Omit<ModelDefinition, 'id' | 'isBuiltIn'> = {
      name: name.trim(),
      apiModel: apiModel.trim(),
      type,
      providerId,
      endpoint: endpoint.trim() || undefined,
      description: description.trim() || undefined,
      isEnabled: true,
      params,
    } as any;

    onSave(model);
  };

  return (
    <div className="bg-[var(--bg-elevated)]/50 border border-[var(--border-secondary)] rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-bold text-[var(--text-primary)]">添加自定义模型</h4>
      
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
                ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
            }`}
          >
            使用已有提供商
          </button>
          <button
            onClick={() => setProviderMode('custom')}
            className={`flex-1 py-2 text-xs rounded transition-colors ${
              providerMode === 'custom'
                ? 'bg-[var(--accent)] text-[var(--text-primary)]'
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
                    ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
                }`}
              >
                同步模式（Chat Completion 类）
              </button>
              <button
                onClick={() => setVideoMode('async')}
                className={`flex-1 py-2 text-xs rounded transition-colors ${
                  videoMode === 'async'
                    ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
                }`}
              >
                异步模式（Sora 类）
              </button>
            </div>
            <p className="text-[9px] text-[var(--text-muted)] mt-1">
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
                      ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
                  }`}
                >
                  {ratio === '16:9' ? '横屏' : ratio === '9:16' ? '竖屏' : '方形'}
                </button>
              ))}
            </div>
          </div>

          {/* 时长配置（仅异步模式显示） */}
          {videoMode === 'async' && (
            <div>
              <label className="text-[10px] text-[var(--text-tertiary)] block mb-2">支持的视频时长（秒）</label>
              <div className="flex gap-2 mb-2">
                {([4, 8, 12] as const).map((duration) => (
                  <label key={duration} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={supportedDurations.includes(duration)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSupportedDurations([...supportedDurations, duration]);
                        } else {
                          setSupportedDurations(supportedDurations.filter(d => d !== duration));
                        }
                      }}
                      className="w-3 h-3"
                    />
                    {duration}秒
                  </label>
                ))}
              </div>
              <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">默认时长</label>
              <div className="flex gap-2">
                {supportedDurations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setDefaultDuration(duration)}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      defaultDuration === duration
                        ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                        : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)]'
                    }`}
                  >
                    {duration}秒
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 bg-[var(--accent)] text-[var(--text-primary)] text-xs font-bold rounded hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-1"
        >
          <Check className="w-3 h-3" />
          添加模型
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

export default AddModelForm;