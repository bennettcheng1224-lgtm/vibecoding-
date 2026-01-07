# 從 D 語言版本遷移到 Python FastAPI 版本指南

## 🎯 遷移概述

本指南將協助您從舊版（D 語言 + Vibe.d）遷移到新版（Python + FastAPI + SQLite）。

## ✨ 主要改進

### 1. 資料持久化
- **舊版**: 資料儲存在記憶體中，重啟後遺失
- **新版**: SQLite 資料庫持久化儲存

### 2. 技術棧
- **舊版**: D 語言 + Vibe.d（小眾技術）
- **新版**: Python + FastAPI（主流技術，更多開發者支援）

### 3. 套件管理
- **舊版**: DUB
- **新版**: uv（更快速、現代化）

## 📋 遷移步驟

### 步驟 1：備份現有資料

如果您有使用 Google Sheets 同步功能，現有資料應該已經備份在 Google Sheets 中。

### 步驟 2：安裝新版本

```bash
# 進入新版本目錄
cd app

# 安裝依賴
uv sync
```

### 步驟 3：設定環境變數

```bash
# 複製現有的 .env 檔案（或從範例建立新的）
cp ../.env .env

# 或從範例建立
cp .env.example .env
```

確保以下環境變數已設定：
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`
- `OPENAI_API_KEY`
- `ALLOWED_EMAILS`

### 步驟 4：複製服務帳戶金鑰

```bash
# 從舊版複製 Google Service Account 金鑰
cp ../service-account-key.json ./
```

### 步驟 5：啟動新版本

```bash
# 使用啟動腳本
./start.sh

# 或手動啟動
PYTHONPATH=. uv run uvicorn app.main:app --reload --port 8080
```

### 步驟 6：驗證功能

訪問以下網址確認系統正常運作：

1. **主頁**: http://localhost:8080
2. **API 文檔**: http://localhost:8080/docs
3. **健康檢查**: http://localhost:8080/health

## 🔄 資料遷移

### 選項 1：重新開始（推薦）

如果公告數量不多，建議：
1. 啟動新系統
2. 重新發布重要公告
3. Google Sheets 會自動同步新資料

### 選項 2：從 Google Sheets 匯入

如果您有大量歷史資料需要保留：

```python
# 建立一個簡單的遷移腳本 migrate.py

from google.oauth2 import service_account
from googleapiclient.discovery import build
from app.database import SessionLocal, init_db
from app.models import Announcement, Category
from datetime import datetime
import uuid

# 初始化資料庫
init_db()

# 讀取 Google Sheets
credentials = service_account.Credentials.from_service_account_file(
    'service-account-key.json',
    scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
)

service = build('sheets', 'v4', credentials=credentials)
sheet_id = 'YOUR_SHEET_ID'

# 讀取資料
result = service.spreadsheets().values().get(
    spreadsheetId=sheet_id,
    range='A2:G'  # 跳過標題列
).execute()

values = result.get('values', [])

db = SessionLocal()

for row in values:
    if len(row) < 5:
        continue

    title, content, categories_str, date_str, poster_name = row[0:5]

    # 建立公告
    announcement = Announcement(
        id=str(uuid.uuid4()),
        title=title,
        content=content,
        poster_name=poster_name,
        created_at=datetime.fromisoformat(date_str)
    )

    # 處理分類
    if categories_str:
        category_names = [c.strip() for c in categories_str.split(',')]
        for cat_name in category_names:
            category = db.query(Category).filter(Category.name == cat_name).first()
            if not category:
                category = Category(name=cat_name)
                db.add(category)
            announcement.categories.append(category)

    db.add(announcement)

db.commit()
db.close()

print("Migration completed!")
```

執行遷移：
```bash
PYTHONPATH=. uv run python migrate.py
```

## 🔍 功能對照表

| 功能 | 舊版 | 新版 | 說明 |
|------|------|------|------|
| Google OAuth 登入 | ✅ | ✅ | 完全相容 |
| 公告發布 | ✅ | ✅ | 完全相容 |
| 分類管理 | ✅ | ✅ | 完全相容 |
| 已讀簽到 | ✅ | ✅ | 完全相容 |
| AI 測驗生成 | ✅ | ✅ | 完全相容 |
| Google Sheets 同步 | ✅ | ✅ | 完全相容 |
| 資料持久化 | ❌ | ✅ | **新功能** |
| API 文檔 | ❌ | ✅ | **新功能** |
| 管理員功能 | ✅ | ✅ | 完全相容 |

## ⚠️ 注意事項

### 1. Session 管理
- **舊版**: 記憶體 Session
- **新版**: 記憶體 Session（生產環境建議改用 Redis）

**建議**: 生產環境使用 Redis Session Store

### 2. 埠號
- 預設埠號: `8080`（與舊版相同）
- 可透過 `SERVER_PORT` 環境變數修改

### 3. 資料庫
- 預設使用 SQLite（檔案：`announcements.db`）
- 生產環境建議改用 PostgreSQL

修改 `.env` 檔案：
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## 🚀 部署建議

### 開發環境
```bash
./start.sh
```

### 生產環境

#### 選項 1：使用 Docker
```bash
docker build -t 76dollshop-announcement .
docker run -p 8080:8080 --env-file .env 76dollshop-announcement
```

#### 選項 2：使用 systemd（Linux）
建立 `/etc/systemd/system/announcement.service`：
```ini
[Unit]
Description=76DollShop Announcement System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/app
Environment="PYTHONPATH=."
ExecStart=/usr/local/bin/uv run uvicorn app.main:app --host 0.0.0.0 --port 8080
Restart=always

[Install]
WantedBy=multi-user.target
```

啟動服務：
```bash
sudo systemctl enable announcement
sudo systemctl start announcement
```

#### 選項 3：使用 Railway/Render
1. 連接 GitHub 儲存庫
2. 設定環境變數
3. 部署指令：`uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 🔧 故障排除

### 問題 1：找不到模組
```
ERROR: Could not import module "app.main"
```

**解決方案**：
```bash
export PYTHONPATH=.
uv run uvicorn app.main:app --port 8080
```

### 問題 2：資料庫連線失敗
**解決方案**：
檢查 `DATABASE_URL` 環境變數是否正確設定

### 問題 3：Google OAuth 失敗
**解決方案**：
1. 確認 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 正確
2. 確認 `GOOGLE_REDIRECT_URI` 與 Google Console 設定一致

### 問題 4：Google Sheets 同步失敗
**解決方案**：
1. 確認 `service-account-key.json` 檔案存在
2. 確認服務帳戶有 Sheets 編輯權限
3. 確認 `GOOGLE_SHEETS_ID` 正確

## 📞 技術支援

如遇到問題，請檢查：
1. API 文檔：http://localhost:8080/docs
2. 伺服器日誌
3. 資料庫連線狀態

## ✅ 遷移檢查清單

- [ ] 安裝 uv 套件管理工具
- [ ] 複製環境變數檔案
- [ ] 複製服務帳戶金鑰
- [ ] 安裝 Python 依賴
- [ ] 啟動新版本伺服器
- [ ] 測試 OAuth 登入
- [ ] 測試公告發布
- [ ] 測試 AI 測驗生成
- [ ] 驗證 Google Sheets 同步
- [ ] 確認資料持久化
- [ ] 設定生產環境部署

---

**完成遷移後，建議保留舊版本一段時間作為備份，確認新版本穩定運作後再移除。**
