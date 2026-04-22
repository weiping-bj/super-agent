# Super Agent Release Notes

**版本：v1.3.1**
**发布日期：2026-04-18**
**开发周期：2026-01-08 ~ 2026-04-18**

---

Super Agent 是一个企业级多智能体平台，帮助企业将业务知识沉淀为标准化 SOP，再从 SOP 中孵化出能自主执行任务的虚拟员工（AI Agent）。

---

## 🆕 v1.3.1 更新内容（2026-04-18）

### 📄 Office 文档在线预览

- Chat 工作区支持 Word（.docx/.doc）和 PowerPoint（.pptx/.ppt）文档的在线 PDF 预览，无需下载即可在浏览器内查看 `2026-04-18`
- 工作区文件列表新增 Office 文档和压缩包（.xlsx、.zip、.csv 等）的 MIME 类型识别与图标展示 `2026-04-18`

### 🚀 一键部署（Fork & Deploy）

- 新增 [Fork CI/CD 部署教程](fork-deploy-guide.md)：Fork 仓库后，配置 4 个 GitHub Secrets 即可通过 GitHub Actions 自动部署到自己的 AWS 账号 `2026-04-18`
- CI/CD Pipeline 支持 CloudFront CDN 分发，前端自动部署至 S3 + CloudFront，支持自定义域名 `2026-04-18`

---

## 📋 v1.3.0 更新内容（2026-04-17）

### 🌐 国际化 (i18n)

- 前端全面国际化改造，覆盖 Settings、Members、Groups、API Keys、Token Usage、Appearance 等页面 `2026-04-17`
- Canvas 节点组件国际化：StartNode、EndNode、ConditionNode、DocumentNode、HumanApprovalNode、ActionNode `2026-04-17`
- 新增 2700+ 条中英文翻译条目 `2026-04-17`

### 🤖 Agent 管理

- Agent 名称唯一性约束从组织级收窄至 Business Scope 级，允许不同 Scope 下创建同名 Agent `2026-04-16`

### 💬 Chat 对话系统

- 新增 Workspace 预热机制：创建 Session 时提前初始化工作区，减少首条消息响应延迟 `2026-04-17`

### 🧠 Scope Generator 增强

- Scope 生成器支持多语言输出：支持英文和中文两种语言生成 `2026-04-17`
- 生成后自动校验 JSON 结构，校验失败时自动要求 Agent 修复，最多重试 2 次 `2026-04-17`

### 💼 项目管理 — AI 治理

- Issue 自动富化：创建 Issue 后 AI 自动生成验收标准、标签建议、工作量估算和拆分建议 `2026-04-16`
- 跨 Issue 关系检测：自动识别冲突、依赖、重复等关系 `2026-04-16`
- Issue 就绪度评分：基于完整性、冲突、依赖、可执行性四维度计算 0-100 分 `2026-04-16`
- Sprint Triage 报告：AI 生成冲刺规划建议，包含推荐执行顺序、合并建议、缺失信息和风险标记 `2026-04-16`

### ☁️ AgentCore — Git Diff 追踪

- Agent 执行前后自动生成 Git diff，记录代码变更 `2026-04-17`
- Issue 详情页可查看关联的代码变更（diff stat + patch） `2026-04-17`

---

## 📋 v1.2.0 及之前完整记录

### 🏗️ 平台基础架构

- 基于 React 19 + Vite + TypeScript + Tailwind CSS 构建前端 `2026-01-08`
- 基于 Fastify + Prisma ORM + PostgreSQL + Redis (BullMQ) 构建后端 `2026-01-19`
- Light / Dark / System 三种主题模式 `2026-02-19`
- 代码文件查看器支持语法高亮 `2026-02-13`

---

### 🔐 认证体系

- 本地 JWT 认证，支持邮件邀请和密码管理 `2026-03-05`
- AWS Cognito 托管认证，双模式并行支持 `2026-03-05`

---

### 🧠 Business Scope（业务域）

- AI 驱动的自然语言业务域生成 `2026-02-11`
- 技能创建集成至 Scope 生成器 `2026-02-12`
- Scope 级访问控制与成员管理 `2026-02-19`
- Business Scope 软删除支持 `2026-03-04`
- Scope 级 MCP 服务器配置 `2026-03-27`

---

### 🤖 Agent 管理

- Avatar 自动生成 `2026-01-19`
- Poker Table 游戏化 Agent 可视化面板 `2026-02-11`
- Sub-Agent 发言者身份追踪与头像解析 `2026-02-18`
- 灵活的 Agent 创建流程，支持多 Scope 关联 `2026-03-18`
- Digital Twin（数字分身）创建向导 `2026-03-19`
- 可插拔 Agent 运行时抽象，支持多后端切换 `2026-03-16`

---

### 🧬 Agent 自主进化

- 蒸馏（Distillation）、排练（Rehearsal）与记忆驱动提案 `2026-04-01`
- 提案审批工作流与记忆自动蒸馏 `2026-04-08`
- Scope Memory 文件系统化：记忆按需加载，避免上下文膨胀 `2026-04-12`
- Pinned 记忆内联，Agent 无需读文件即可获取关键身份信息和用户偏好 `2026-04-12`

---

### 💬 Chat 对话系统

- Claude Agent SDK 集成 Skills、Webhooks 和定时调度 `2026-02-08`
- 会话管理与工作区资源管理器 `2026-02-08`
- 会话历史面板与空闲超时 `2026-02-11`
- 快速问题生成（LLM 上下文） `2026-02-11`
- Starred Sessions（收藏会话） `2026-04-01`
- SSE 流式 Chat 响应与消息持久化 `2026-04-03`
- Group Chat 成员角色与 Claude 运行时集成 `2026-04-03`

---

### 🔗 Workflow 工作流引擎

- 拖拽式 DAG 画布编辑器（节点式 UI） `2026-01-25`
- AI 驱动的工作流生成与修补（Workflow Copilot） `2026-01-29`
- 基于 BullMQ 的工作流执行引擎 `2026-01-29`
- 节点级逐步执行与状态追踪 `2026-02-13`
- 执行检查点与断点续跑 `2026-03-04`
- Skill Gap 检测与执行安全防护 `2026-03-06`

---

### 🧩 Skills 技能系统

- 技能市场浏览器，支持归档与收藏 `2026-02-09`
- 技能内容编辑与持久化存储 `2026-02-10`
- 两步发布确认与企业技能目录 `2026-03-23`

---

### 🔌 MCP 集成

- Scope 级 MCP 服务器管理 `2026-02-13`
- 可搜索的 MCP 服务器目录与筛选 `2026-02-13`

---

### 📚 Knowledge 知识库 (RAG)

- 文档组管理，支持 Multipart 上传 `2026-03-04`
- RAG Pipeline 集成 `2026-04-01`
- 文档组同步与 RAG Skill 自动生成 `2026-04-08`

---

### 📱 应用市场

- 已发布应用市场与应用预览功能 `2026-02-12`
- 应用数据管理与定时执行日志 `2026-02-18`

---

### 💼 项目管理

- 看板（Kanban）面板与 Digital Twin 集成 `2026-03-22`

---

### 📡 IM 渠道接入

- Slack、Discord、Telegram、钉钉、飞书五大平台适配器 `2026-02-14`
- WhatsApp Cloud API 适配器 `2026-04-08`
- BullMQ 异步消息队列，解耦消息接收与 Agent 处理 `2026-04-08`

---

### 📊 Scope Briefing 智能简报

- AI 驱动的业务域简报生成系统 `2026-02-18`

---

### 🏢 组织管理

- 组织设置与成员管理 `2026-02-18`
- 用户组 RBAC 权限控制（Skills 与 MCP 服务器） `2026-04-08`

---

### ☁️ AgentCore 云端运行时

- AgentCore 运行时容器，集成 Claude Agent SDK `2026-03-03`
- AWS Bedrock AgentCore 集成与 S3 工作区同步 `2026-03-18`

---

### 🔧 Webhook 与调度

- Webhook 执行日志与调用历史 UI `2026-04-08`

---

## Tech Stack

| 层级 | 技术栈 |
| --- | --- |
| Backend | Fastify, TypeScript, Prisma ORM, PostgreSQL, Redis (BullMQ) |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, React Router, XY Flow |
| AI | Amazon Bedrock (Claude), Claude Agent SDK, Langfuse |
| Storage | AWS S3 |
| Auth | AWS Cognito |
| Infra | AWS CDK (EC2, Aurora Serverless v2, S3, Cognito, CloudFront, CloudWatch) |
| Runtime | AWS Bedrock AgentCore |
