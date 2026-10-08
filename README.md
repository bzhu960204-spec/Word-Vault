# WordVault

个人英语单词学习 + Anki-like 复习应用。

- **后端**：Java 17 + Spring Boot 3 + Spring Data JPA + H2（文件模式） + Lombok
- **前端**：React 18 + Vite + React Router + Axios

## 功能模块

1. **单词管理** — 增删改查、搜索（英文/中文）、标签筛选、熟悉度筛选
2. **Anki 卡片** — 为单词生成 `EN_TO_CN` 卡片（同一单词同类型仅一张，自动去重）
3. **复习** — 每日到期卡片队列，简化版 SM-2 算法，支持 Again / Hard / Good / Easy 评分及键盘快捷键 1/2/3/4
4. **仪表盘** — 总数统计、连续打卡天数、近 30 天复习量柱图

## 目录结构

```
WordVault/
├── backend/        Spring Boot 应用
│   └── data/       H2 数据库文件（首次运行后自动生成）
└── frontend/       Vite + React 应用
```

## 开发模式

需要 **JDK 17+**、**Maven 3.8+**、**Node.js 20+**。

### 启动后端（端口 8080）

```powershell
cd backend
mvn spring-boot:run
```

- API 基址：`http://localhost:8080/api`
- H2 控制台：`http://localhost:8080/h2-console`
  - JDBC URL：`jdbc:h2:file:./data/wordvault`
  - 用户名 `sa`，密码留空
- 数据文件：`backend/data/wordvault.mv.db`（删除即清空数据）
- 首次启动会插入 3 个示例单词与对应卡片（可通过 `wordvault.seed-data: false` 关闭）

### 启动前端（端口 5173）

```powershell
cd frontend
npm install
npm run dev
```

打开 `http://localhost:5173`，Vite 已配置 `/api` 代理到 `localhost:8080`。

## 生产构建（单 jar）

```powershell
cd backend
mvn -P with-frontend package
java -jar target/wordvault-backend-0.0.1-SNAPSHOT.jar
```

`with-frontend` profile 会自动安装 Node、构建前端，并把 `frontend/dist/*` 拷贝到 jar 的 `static/` 目录，由 Spring Boot 单进程托管。打开 `http://localhost:8080` 即可访问完整应用，刷新任何前端路由不会 404（SPA fallback 已配置）。

## REST API 速览

| Method | Path | 说明 |
|---|---|---|
| GET | `/api/words?q=&tag=&familiarity=` | 单词列表（支持筛选） |
| GET | `/api/words/tags` | 所有去重标签 |
| GET/POST/PUT/DELETE | `/api/words[/{id}]` | 单词 CRUD |
| POST | `/api/words/import` | 批量导入（body: JSON 数组，见下方） |
| POST | `/api/words/{id}/cards` | 为单词生成卡片（body: `{type: "EN_TO_CN"}`） |
| GET | `/api/cards?wordId=` | 卡片列表 |
| DELETE | `/api/cards/{id}` | 删除卡片 |
| GET | `/api/review/due` | 今日到期卡片 |
| POST | `/api/review/{cardId}` | 提交评分（body: `{rating: "GOOD"}`） |
| GET | `/api/stats/summary` | 仪表盘数字 |
| GET | `/api/stats/daily?days=30` | 每日复习量 |

## SM-2 简化算法

- **Again**：`ease -= 0.2`（下限 1.3），`interval = 1`，`reps = 0`，`lapses += 1`，状态 `LEARNING`
- **Hard**：`ease -= 0.15`，`interval = max(1, round(prev × 1.2))`
- **Good**：第 1 次 `1`，第 2 次 `6`，之后 `round(prev × ease)`
- **Easy**：`ease += 0.15`，`interval = round(prev × ease × 1.3)`

每次评分后写入 `ReviewLog`，供仪表盘统计使用。

## 批量导入 JSON

`POST /api/words/import` 接受单个对象或对象数组，返回已创建的单词列表。

```json
POST /api/words/import
Content-Type: application/json

[
  {
    "text": "resilient",
    "translation": "有弹性的；能恢复的",
    "partOfSpeech": "adj.",
    "exampleEn": "She is remarkably resilient under pressure.",
    "exampleCn": "她在压力下表现得非常有韧性。",
    "usageNote": "常修饰人或系统，表示从困境中快速恢复的能力。",
    "tags": "gre,adj",
    "source": "GRE词汇书",
    "familiarity": 0
  },
  {
    "text": "pragmatic",
    "translation": "务实的；实用主义的",
    "partOfSpeech": "adj.",
    "exampleEn": "We need a pragmatic approach to solve this problem.",
    "exampleCn": "我们需要一种务实的方法来解决这个问题。",
    "tags": "daily,adj",
    "source": "经济学人2024-03",
    "familiarity": 1
  }
]
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `text` | string | ✅ | 英文单词 |
| `translation` | string | | 中文含义 |
| `partOfSpeech` | string | | 词性，如 `n.` `v.` `adj.` |
| `exampleEn` | string | | 英文例句 |
| `exampleCn` | string | | 例句中文翻译 |
| `usageNote` | string | | 用法说明 |
| `tags` | string | | 逗号分隔标签，如 `"gre,adj,daily"` |
| `source` | string | | 来源，如 `"GRE词汇书"`、`"经济学人2024-01"` |
| `familiarity` | int (0-5) | | 熟悉度，默认 `0` |

前端单词库页面点击「导入 JSON」按钮可直接粘贴 JSON 进行导入。

## 测试

```powershell
cd backend
mvn test
```

包含 SM-2 算法的核心断言测试。
