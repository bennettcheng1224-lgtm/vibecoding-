# Zeabur 部署指南

## 🚀 Zeabur 部署步驟

### 前置準備

1. 確保您有 Zeabur 帳號：https://zeabur.com
2. 確保專案已推送到 GitHub

### 步驟 1：推送到 GitHub

```bash
cd /Users/bennettcheng/Desktop/vibe\ coding/76dollshop-announcement-system/app

# 初始化 git（如果還沒有）
git init

# 添加所有檔案
git add .

# 提交
git commit -m "Initial commit: Python FastAPI version with SQLite"

# 連接到 GitHub（替換成您的儲存庫）
git remote add origin https://github.com/YOUR_USERNAME/76dollshop-announcement.git

# 推送
git push -u origin main
```

### 步驟 2：在 Zeabur 建立專案

1. 登入 Zeabur Dashboard: https://dash.zeabur.com
2. 點擊 "New Project"
3. 選擇 "Import from GitHub"
4. 選擇您的儲存庫 `76dollshop-announcement`
5. Zeabur 會自動偵測為 Python 專案

### 步驟 3：設定環境變數

在 Zeabur 專案的 **Environment Variables** 頁面中，添加以下環境變數：

#### 必要的環境變數

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.zeabur.app/auth/callback

# Google Sheets
GOOGLE_SHEETS_ID=your-google-sheets-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Access Control
ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com

# Server
SERVER_PORT=8080
SESSION_SECRET=請改成一個隨機的長字串

# Database
DATABASE_URL=sqlite:///./announcements.db

# Python
PYTHONPATH=.
PYTHONUNBUFFERED=1
```

⚠️ **重要提醒**：
- 部署後，需要將 `GOOGLE_REDIRECT_URI` 改成您的 Zeabur 網址
- 並在 Google Cloud Console 的 OAuth 設定中添加這個回呼網址

### 步驟 4：上傳 Service Account Key

有兩種方式處理 Google Service Account Key：

#### 方式 1：Base64 編碼（推薦）

```bash
# 在本地端執行
base64 -i service-account-key.json | pbcopy
```

然後在 Zeabur 環境變數中添加：
```env
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=貼上剛才複製的 Base64 字串
```

修改 `app/utils/google_sheets.py`：
```python
import base64
import json
import os

# 在 __init__ 方法中
if os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY_BASE64'):
    key_data = base64.b64decode(os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY_BASE64'))
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(key_data),
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
elif os.path.exists(settings.google_service_account_key_path):
    credentials = service_account.Credentials.from_service_account_file(
        settings.google_service_account_key_path,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
```

#### 方式 2：環境變數（替代方案）

將整個 JSON 內容直接放入環境變數：
```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

### 步驟 5：部署

1. Zeabur 會自動開始構建
2. 構建完成後，系統會自動部署
3. 您會獲得一個類似 `https://your-app.zeabur.app` 的網址

### 步驟 6：更新 OAuth 回呼網址

1. 前往 Google Cloud Console
2. 進入您的 OAuth 2.0 客戶端設定
3. 在「已授權的重新導向 URI」中添加：
   ```
   https://your-app.zeabur.app/auth/callback
   ```
4. 更新 Zeabur 環境變數中的 `GOOGLE_REDIRECT_URI`

### 步驟 7：測試部署

訪問以下網址確認部署成功：

- **主頁**: https://your-app.zeabur.app
- **健康檢查**: https://your-app.zeabur.app/health
- **API 文檔**: https://your-app.zeabur.app/docs

## 🗄️ 資料庫選項

### 選項 1：使用 SQLite（簡單，適合小型應用）

預設設定已經使用 SQLite，無需額外設定。

⚠️ **注意**：Zeabur 的檔案系統可能不持久，重啟後資料可能遺失。建議使用 PostgreSQL。

### 選項 2：使用 PostgreSQL（推薦生產環境）

1. 在 Zeabur 專案中添加 PostgreSQL 服務
2. Zeabur 會自動提供 `DATABASE_URL` 環境變數
3. 更新環境變數：
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

需要安裝 PostgreSQL 適配器：
```bash
uv add psycopg2-binary
```

更新 `pyproject.toml` 後，重新部署。

## 📝 部署後檢查清單

- [ ] 伺服器成功啟動（檢查 `/health` 端點）
- [ ] OAuth 登入正常運作
- [ ] 可以發布公告
- [ ] 公告顯示正確
- [ ] AI 測驗生成功能正常
- [ ] Google Sheets 同步正常
- [ ] 資料庫持久化正常

## 🔧 常見問題排除

### 問題 1：無法啟動（Module not found）

**解決方案**：確認 `PYTHONPATH=.` 環境變數已設定

### 問題 2：OAuth 失敗（Redirect URI mismatch）

**解決方案**：
1. 檢查 Google Cloud Console 的 OAuth 設定
2. 確認回呼網址完全一致（包括 https://）

### 問題 3：資料庫連線失敗

**解決方案**：
- 如果使用 SQLite，確認檔案權限正確
- 如果使用 PostgreSQL，確認 `DATABASE_URL` 正確

### 問題 4：Google Sheets 同步失敗

**解決方案**：
1. 確認 Service Account Key 已正確上傳
2. 確認服務帳戶有 Sheets 編輯權限
3. 檢查 `GOOGLE_SHEETS_ID` 是否正確

### 問題 5：OpenAI API 失敗

**解決方案**：
- 確認 `OPENAI_API_KEY` 正確
- 確認 API 配額充足

## 📊 監控與日誌

### 查看日誌

在 Zeabur Dashboard 中：
1. 進入您的專案
2. 點擊 "Logs" 標籤
3. 即時查看應用程式日誌

### 性能監控

Zeabur 提供基本的性能指標：
- CPU 使用率
- 記憶體使用率
- 網路流量

## 🔄 自動部署

設定完成後，每次推送到 GitHub main 分支，Zeabur 會自動：
1. 拉取最新代碼
2. 重新構建
3. 自動部署

## 💰 費用估算

Zeabur 定價：
- **免費方案**: 有限制但足夠測試
- **付費方案**: 根據資源使用量計費

建議從免費方案開始，根據實際使用情況升級。

## 🎉 完成！

您的 76DollShop 內部公告系統現在已經部署在 Zeabur 上了！

如有任何問題，請參考：
- Zeabur 官方文檔: https://zeabur.com/docs
- 專案 README.md
- MIGRATION_GUIDE.md
