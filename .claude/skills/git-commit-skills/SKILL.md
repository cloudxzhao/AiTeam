# 项目技能：自动 Git 提交

## Skill: 自动提交代码变更

**触发条件：** 当我保存 `.js`、`.ts`、`.py`、`.java`、`.go` 等源代码文件时。

**执行动作：**
1. 检查当前是否为 Git 仓库，如果不是使用 `git init` 初始化。
2. 检查是否有未暂存的变更，。
3. 如果有变更，执行：
   - `git add .`
   - 自动生成起提交的'comment'，根据修改内容生成，必须使用中文。
   - 执行 `git add . && git commit -m "comment"`
4. 在 Claude 对话中简要报告提交结果
5. 推送到远程仓库 `git@github.com:cloudxzhao/AiTeam.git`

**例外情况：**
- 如果存在 `.no-autocommit` 文件，则跳过自动提交
- 非 Git 仓库不执行任何操作
- 无变更时静默退出

## Skill: 手动触发提交

**触发命令：** `/commit` 或 "提交代码"

**执行动作：**
1. 检查当前 Git 状态
2. 显示变更摘要
3. 自动生成起提交的comment，必须使用中文，执行 `git add . && git commit -m "comment"`
4. 推送到远程仓库 `git@github.com:cloudxzhao/AiTeam.git`