# AI Drama Director - 前端项目

## 项目介绍

AI Drama Director 前端项目，负责用户界面和交互逻辑，提供剧本管理、资产创建、分镜设计、视频导出等功能。

## 技术栈

- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS 4.2.1
- Framer Motion
- Radix UI
- Lucide React

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 9+

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`，并根据环境配置相应的变量：

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

### 启动开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

### 预览生产版本

```bash
pnpm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── components/          # 前端组件
│   │   ├── StageScript/     # 剧本管理
│   │   ├── StageAssets/     # 资产管理
│   │   ├── StageDirector/   # 导演工作台
│   │   ├── StageExport/     # 视频导出
│   │   └── StagePrompts/    # 提示词管理
│   ├── contexts/            # React Context
│   ├── services/            # 前端服务
│   │   ├── apiClient.ts     # API 客户端
│   │   ├── storageService.ts # 存储服务
│   │   └── aiService.ts     # AI 服务
│   ├── types/               # 类型定义
│   ├── App.tsx              # 应用入口
│   └── index.tsx            # 渲染入口
├── public/                  # 静态资源
├── vite.config.ts           # Vite 配置
├── package.json             # 前端依赖
└── tsconfig.json            # TypeScript 配置
```

## API 调用

使用统一的 `apiClient` 进行 API 调用：

```typescript
import { apiClient } from './services/apiClient';

// 示例：获取项目列表
const projects = await apiClient.get('/projects');

// 示例：创建新项目
const newProject = await apiClient.post('/projects', {
  title: '新项目',
  description: '项目描述'
});
```

## 状态管理

使用 React Context 进行状态管理：

```typescript
import { useAuth } from './contexts/AuthContext';
import { useAlert } from './components/GlobalAlert';

// 使用认证状态
const { isAuthenticated, user } = useAuth();

// 使用全局提示
const { showAlert } = useAlert();
```

## 开发规范

1. **代码风格**：遵循 ESLint 和 Prettier 规范
2. **命名规范**：
   - 组件名：PascalCase
   - 变量名：camelCase
   - 常量：UPPER_SNAKE_CASE
3. **文件结构**：按功能模块组织文件
4. **类型定义**：使用 TypeScript 类型系统确保类型安全

## 构建与部署

### 开发环境
- 启动前端开发服务器：`pnpm run dev`
- 启动后端开发服务器：`cd ../backend && pnpm run dev`

### 生产环境
1. 构建前端：`pnpm run build`
2. 构建后端：`cd ../backend && pnpm run build`
3. 部署前端静态文件到 CDN 或静态网站托管
4. 部署后端到 Node.js 服务器

## 常见问题

### 跨域问题
开发环境中，Vite 会自动代理 API 请求到后端服务器，无需额外配置。

### 类型错误
如果遇到类型错误，检查是否正确导入类型定义，或在 `src/types` 目录中添加缺失的类型定义。

### 构建失败
如果构建失败，检查是否有未解决的 TypeScript 错误，或依赖版本不兼容的问题。

## 贡献指南

1. **Fork 仓库**
2. **创建分支**：`git checkout -b feature/your-feature`
3. **提交代码**：`git commit -m "Add your feature"`
4. **推送分支**：`git push origin feature/your-feature`
5. **创建 Pull Request**

## 许可证

MIT License