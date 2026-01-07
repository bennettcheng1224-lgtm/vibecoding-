# 環境變數設定說明

本專案需要以下環境變數才能正常運作。以下列出所有必要和可選的環境變數。

## 🔐 必要環境變數

### 1. Google OAuth 認證
用於使用者登入驗證。

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.zeabur.app/auth/callback
```

**如何取得:**
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google OAuth 2.0 API
4. 建立 OAuth 2.0 憑證
5. 設定授權重定向 URI: `https://your-domain.zeabur.app/auth/callback`
6. 取得 Client ID 和 Client Secret

### 2. OpenAI API
用於自動生成測驗題目。

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

**如何取得:**
1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 登入帳號
3. 前往 API Keys 頁面
4. 建立新的 API Key

### 3. Google Sheets API
用於同步公告資料到 Google Sheets。

```env
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"..."}
```

**如何取得:**
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 啟用 Google Sheets API
3. 建立服務帳號 (Service Account)
4. 下載 JSON 金鑰檔案
5. 將整個 JSON 內容複製貼上為環境變數值

**重要:** JSON 內容必須是單行字串,不可有換行。

## ⚙️ 可選環境變數

### 4. 允許登入的 Email 列表
預設的白名單使用者 (除了管理員之外)。管理員可以透過後台動態新增更多使用者。

```env
ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com,user3@gmail.com
```

如果不設定,則只有管理員 `bennettcheng1224@gmail.com` 可以登入,其他使用者需要透過後台新增。

### 5. 伺服器端口
Zeabur 會自動設定,通常不需要手動設定。

```env
SERVER_PORT=8080
```

## 📝 Zeabur 部署步驟

### 1. 推送程式碼到 GitHub

```bash
cd /path/to/76dollshop-announcement-system
git add .
git commit -m "Deploy to Zeabur with admin features"
git push origin main
```

### 2. 在 Zeabur 建立專案

1. 登入 [Zeabur](https://zeabur.com/)
2. 建立新專案
3. 連接 GitHub repository
4. 選擇 `76dollshop-announcement-system` repository

### 3. 設定環境變數

在 Zeabur 專案設定中,新增以下環境變數:

| 變數名稱 | 說明 | 必要性 |
|---------|------|--------|
| `GOOGLE_CLIENT_ID` | Google OAuth 客戶端 ID | ✅ 必要 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 客戶端密鑰 | ✅ 必要 |
| `GOOGLE_REDIRECT_URI` | OAuth 回調網址 | ✅ 必要 |
| `OPENAI_API_KEY` | OpenAI API 金鑰 | ✅ 必要 |
| `GOOGLE_SHEETS_CREDENTIALS` | Google Sheets API 認證 JSON | ✅ 必要 |
| `ALLOWED_EMAILS` | 允許登入的 Email 列表 | ⚪ 可選 |
| `SERVER_PORT` | 伺服器端口 (通常自動設定) | ⚪ 可選 |

### 4. 設定 OAuth 回調網址

部署完成後,取得 Zeabur 提供的網域 (例如: `your-app.zeabur.app`),然後:

1. 回到 Google Cloud Console
2. 更新 OAuth 2.0 憑證的授權重定向 URI
3. 新增: `https://your-app.zeabur.app/auth/callback`
4. 更新 Zeabur 的 `GOOGLE_REDIRECT_URI` 環境變數為相同網址

### 5. 部署

Zeabur 會自動偵測 `Dockerfile` 並進行建置部署。

## 🔧 管理員功能

系統管理員: **bennettcheng1224@gmail.com**

管理員登入後可以:
- 📝 發布新公告
- ✏️ 編輯和刪除公告
- 👥 管理 Email 白名單 (新增/刪除允許登入的使用者)
- 🔧 訪問管理後台 `/admin`

## 🗄️ 資料庫

本專案使用 SQLite 資料庫,資料會儲存在 `announcements.db` 檔案中。

Zeabur 部署時,建議使用 Zeabur 提供的持久化儲存 (Persistent Storage) 來保存資料庫檔案,避免重新部署時資料遺失。

## 📚 相關文件

- [README.md](./README.md) - 專案說明
- [QUICK_START.md](../QUICK_START.md) - 快速開始指南
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - 部署指南

## ❓ 常見問題

### Q: 為什麼登入後顯示 "Access Denied"?

A: 請確認:
1. 你的 Email 是否在 `ALLOWED_EMAILS` 中
2. 或者請管理員透過後台將你的 Email 加入白名單

### Q: OAuth 回調失敗?

A: 請確認:
1. `GOOGLE_REDIRECT_URI` 環境變數設定正確
2. Google Cloud Console 的 OAuth 憑證中有設定相同的重定向 URI
3. 網址必須是 `https://` 開頭 (本地測試可用 `http://`)

### Q: 測驗生成失敗?

A: 請確認:
1. `OPENAI_API_KEY` 設定正確
2. OpenAI 帳號有足夠的配額
3. API Key 未過期

### Q: Google Sheets 同步失敗?

A: 請確認:
1. `GOOGLE_SHEETS_CREDENTIALS` 是完整的 JSON (單行)
2. 服務帳號有權限訪問目標 Google Sheets
3. 在 Google Sheets 中與服務帳號的 Email 分享編輯權限
