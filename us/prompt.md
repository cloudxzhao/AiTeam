分步执行任务：

1. 后端在本地启动，使用的组件：

   - Redis: 容器名 aiteam-redis, 密码 aiteam123, 端口 6379
     - RabbitMQ: 容器名 aiteam-mq, 用户/密码 aiteam/aiteam123, 管理端口 15672
     - PostgreSQL: 容器 4faaee9ac6cb, 用户/密码 pgsql/Admin_2026, 端口 5432

   注意后端启动可能要初始化数据库欧，注意登录到PostgreSQL: 容器 4faaee9ac6cb 初始化数据库，在启动后端。

2. 前端也在本地启动。

3. 端口如果有冲突就杀掉当前进程。





创建 Agent Teams 完成当前目录下”PRD-看板与状态流转增强.md“文档里面的需求，Teams中包含如下角色：

- Architect：负责需求分析、技术选型、生成开发计划。
- Frontend-Engineer：负责编写前端代码、依赖管理、严格执行计划。
- Backend-Engineer：负责编写后端代码、依赖管理、严格执行计划。
- Deployment：前后端开发完成后，负责将项目重新部署到本地的 Docker 中。
- Validator：负责测试用例、Bug追踪、质量门禁。
- scribe：API文档，使用说明，知识沉淀。





创建 Agent Teams 完成当前目录下”权限功能需求文档.md“文档里面的需求，Teams中包含如下角色：

- Architect：负责需求分析、技术选型、生成开发计划。
- Frontend-Engineer：负责编写前端代码、依赖管理、严格执行计划。
- Backend-Engineer：负责编写后端代码、依赖管理、严格执行计划。
- Deployment：前后端开发完成后，负责将项目重新部署到本地的 Docker 中。
- Validator：负责测试用例、Bug追踪、质量门禁。
- scribe：API文档，使用说明，知识沉淀。



创建 Agent Teams ，将当前项目重写，放在子目录 AiTeam 下。

后端使用：springboot3 + JDK21 进行重写。

前端使用组件：React 18 + TypeScript + Vite + Ant Design 5.x

中间件和数据库与当前使用的相同。

AiTeam的目录规划有：backend，frontend，docs，分别放后端，前端和文档

样式要采用 frontend-design。

- Architect：负责需求分析、技术选型、生成开发计划。
- Frontend-Engineer：负责编写前端代码、依赖管理、严格执行计划。
- Backend-Engineer：负责编写后端代码、依赖管理、严格执行计划。
- Deployment：前后端开发完成后，负责将项目重新部署到本地的 Docker 中。
- Validator：负责测试用例、Bug追踪、质量门禁。
- scribe：API文档，使用说明，知识沉淀。



永久的启动 AgentTeam 


