# AiTeam 部署说明

## 目录结构

```
deploy/
├── docker-compose.yml    # 主部署文件
├── frontend/
│   └── Dockerfile        # 前端 Docker 构建文件
└── README.md             # 本文件
```

## 外部依赖

### PostgreSQL 数据库
- **容器 ID**: `4faaee9ac6cb` (容器名：stoic_nash)
- **网络**: bridge
- **账户**: pgsql / Admin_2026
- **数据库**: aiteam

### Redis 和 RabbitMQ
已部署到 bridge 网络，可通过 docker-compose 管理：

```bash
# 启动 Redis 和 RabbitMQ
docker compose up -d redis rabbitmq

# 查看状态
docker compose ps

# 停止服务
docker compose down redis rabbitmq
```

## 部署服务

### 启动所有服务
```bash
cd deploy
docker compose up -d
```

### 仅启动后端
```bash
docker compose up -d backend
```

### 仅启动前端
```bash
docker compose up -d frontend
```

### 查看日志
```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
```

## 服务端口

| 服务 | 容器名 | 访问端口 | 说明 |
|------|--------|----------|------|
| 后端 API | aiteam-backend | 8000 | Spring Boot API |
| 前端 Web | aiteam-web | 9000 | React + Vite |
| Redis | aiteam-redis | - | 内部使用，密码：aiteam123 |
| RabbitMQ | aiteam-mq | 15672 | 管理界面，账号：aiteam/aiteam123 |

## 注意事项

1. 所有容器都部署在 `bridge` 网络中，与外部 PostgreSQL 容器通信
2. 后端依赖 Redis，启动前确保 Redis 已就绪
3. 前端依赖后端，启动前确保后端 API 可访问
4. 如需重置服务，先执行 `docker compose down` 再重新启动
