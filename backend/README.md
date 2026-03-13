# AI Drama Director - 后端项目

## 项目介绍

AI Drama Director 后端项目，负责 API 服务和业务逻辑，提供用户认证、项目管理、资产管理、AI 服务等功能。

## 技术栈

- Node.js 18+
- Express 4.21.2
- TypeScript 5.8.2
- MySQL2 3.12.0
- Better SQLite3 11.10.0
- JWT
- Multer

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 9+
- MySQL (生产环境)
- SQLite (开发环境)

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`，并根据环境配置相应的变量：

```env
# 服务器配置
SERVER_PORT=3001
NODE_ENV=development

# 数据库配置 (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_drama
DB_USER=root
DB_PASSWORD=password

# 数据库配置 (SQLite)
SQLITE_DB_PATH=data/local.db

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOADS_DIR=uploads
```

### 启动开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

### 启动生产服务器

```bash
pnpm start
```

## 项目结构

```
backend/
├── src/
│   ├── types/               # 共享类型定义
│   │   ├── project.ts       # 项目类型
│   │   └── model.ts         # 模型类型
│   ├── config/              # 配置文件
│   │   ├── database.ts      # 数据库配置
│   │   └── sqliteDatabase.ts # SQLite 配置
│   ├── middleware/          # 中间件
│   │   └── auth.ts          # 认证中间件
│   ├── routes/              # API 路由
│   │   ├── auth.ts          # 认证路由
│   │   ├── projects.ts      # 项目路由
│   │   ├── assets.ts        # 资产路由
│   │   └── ai.ts            # AI 服务路由
│   ├── services/            # 后端服务
│   │   ├── scriptParser.ts  # 剧本解析
│   │   ├── taskRunner.ts    # 任务运行
│   │   └── aiProxy.ts       # AI 代理
│   ├── utils/               # 工具函数
│   ├── index.ts             # 服务器入口
│   └── proxy.ts             # 代理配置
├── package.json             # 后端依赖
└── tsconfig.json            # TypeScript 配置
```

## API 接口

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户

### 项目接口

- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建新项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目信息
- `DELETE /api/projects/:id` - 删除项目
- `PATCH /api/projects/:id/patch` - 增量更新项目

### 资产接口

- `GET /api/assets/characters` - 获取角色列表
- `POST /api/assets/characters` - 创建角色
- `GET /api/assets/scenes` - 获取场景列表
- `POST /api/assets/scenes` - 创建场景

### AI 服务接口

- `POST /api/ai/script` - 生成剧本
- `POST /api/ai/image` - 生成图像
- `POST /api/ai/video` - 生成视频

## 数据库配置

- 开发环境：使用 SQLite，配置 `SQLITE_DB_PATH`
- 生产环境：使用 MySQL，配置 `DB_*` 相关变量

## 任务管理

后端实现了任务队列和恢复机制，确保后台任务的可靠执行。

## 代理配置

后端配置了第三方 API 代理，支持 OpenAI、阿里云 DashScope 和火山引擎等 AI 服务。

## 开发规范

1. **代码风格**：遵循 ESLint 和 Prettier 规范
2. **命名规范**：
   - 函数名：camelCase
   - 变量名：camelCase
   - 常量：UPPER_SNAKE_CASE
   - 类名：PascalCase
3. **文件结构**：按功能模块组织文件
4. **类型定义**：使用 TypeScript 类型系统确保类型安全
5. **错误处理**：实现统一的错误处理机制

## 构建与部署

### 开发环境
- 启动后端开发服务器：`pnpm run dev`
- 启动前端开发服务器：`cd ../frontend && pnpm run dev`

### 生产环境
1. 构建前端：`cd ../frontend && pnpm run build`
2. 构建后端：`pnpm run build`
3. 部署前端静态文件到 CDN 或静态网站托管
4. 部署后端到 Node.js 服务器

## 常见问题

### 数据库连接失败
检查数据库配置是否正确，确保 MySQL 服务正在运行，或 SQLite 数据库路径可写。

### API 调用失败
检查 API 路由是否正确，或后端服务器是否正在运行。

### 任务执行失败
检查任务队列配置，或相关服务是否可用。

## 贡献指南

1. **Fork 仓库**
2. **创建分支**：`git checkout -b feature/your-feature`
3. **提交代码**：`git commit -m "Add your feature"`
4. **推送分支**：`git push origin feature/your-feature`
5. **创建 Pull Request**

## 许可证

MIT License