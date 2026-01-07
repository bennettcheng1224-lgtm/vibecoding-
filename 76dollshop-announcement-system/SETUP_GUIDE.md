# 76DollShop 內部公告系統 - 安裝設定指南

## 📋 目錄

1. [系統需求](#系統需求)
2. [快速開始](#快速開始)
3. [Google OAuth 設定](#google-oauth-設定)
4. [Google Sheets 設定](#google-sheets-設定)
5. [OpenAI API 設定](#openai-api-設定)
6. [環境變數設定](#環境變數設定)
7. [執行專案](#執行專案)
8. [常見問題](#常見問題)

---

## 系統需求

- **D 語言編譯器**: DMD 2.100+ 或 LDC 1.30+
- **DUB**: D 語言套件管理工具（通常隨 DMD 安裝）
- **Google Cloud 帳號**: 用於 OAuth 和 Sheets API
- **OpenAI 帳號**: 用於 ChatGPT API

---

## 快速開始

### 1. 安裝 D 語言編譯器

#### macOS (使用 Homebrew)
```bash
brew install dmd
```

#### Linux
```bash
curl -fsS https://dlang.org/install.sh | bash -s dmd
```

#### Windows
下載安裝檔：https://dlang.org/download.html

### 2. 驗證安裝
```bash
dmd --version
dub --version
```

---

## Google OAuth 設定

### 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊「建立專案」
3. 輸入專案名稱：`76DollShop-Internal-System`
4. 點擊「建立」

### 步驟 2：啟用 API

1. 在左側選單選擇「API 和服務」→「程式庫」
2. 搜尋並啟用以下 API：
   - **Google+ API** (用於使用者資訊)
   - **Google Sheets API** (用於資料儲存)

### 步驟 3：設定 OAuth 同意畫面

1. 選擇「API 和服務」→「OAuth 同意畫面」
2. 選擇「內部」（如果是 Google Workspace 組織）或「外部」
3. 填寫應用程式資訊：
   - 應用程式名稱：`76DollShop 內部系統`
   - 使用者支援電子郵件：你的 Email
   - 授權網域：如果有的話（本機開發可略過）
4. 儲存並繼續

### 步驟 4：建立 OAuth 2.0 客戶端 ID

1. 選擇「API 和服務」→「憑證」
2. 點擊「建立憑證」→「OAuth 客戶端 ID」
3. 選擇應用程式類型：**網頁應用程式**
4. 設定名稱：`76DollShop Web Client`
5. 已授權的重新導向 URI：
   ```
   http://localhost:8080/auth/callback
   ```
6. 點擊「建立」
7. **重要**：複製並儲存 **Client ID** 和 **Client Secret**

---

## Google Sheets 設定

### 步驟 1：建立試算表

1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新的試算表
3. 命名為：`76DollShop-公告系統資料`
4. 在第一列設定標題（A1 到 G1）：
   ```
   標題 | 內容 | 分類 | 發布日期 | 發布者 | 已閱讀名單 | 測驗成績
   ```
5. 複製試算表 ID（網址中的長字串）
   - 範例：`https://docs.google.com/spreadsheets/d/【這串就是ID】/edit`

### 步驟 2：建立 Service Account

1. 回到 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇「IAM 與管理」→「服務帳戶」
3. 點擊「建立服務帳戶」
4. 設定名稱：`sheets-api-service`
5. 點擊「建立並繼續」
6. 授予角色：**編輯者** (Editor)
7. 點擊「完成」

### 步驟 3：下載 Service Account 金鑰

1. 點擊剛建立的服務帳戶
2. 切換到「金鑰」分頁
3. 點擊「新增金鑰」→「建立新金鑰」
4. 選擇「JSON」格式
5. 下載 JSON 檔案
6. **重要**：將檔案重新命名為 `service-account-key.json`
7. 移動到專案根目錄：
   ```bash
   mv ~/Downloads/your-project-xxxxx.json ./service-account-key.json
   ```

### 步驟 4：授予 Service Account 存取權限

1. 打開剛建立的 Google Sheets
2. 點擊右上角「共用」
3. 貼上 Service Account 的 Email（類似 `sheets-api-service@project-id.iam.gserviceaccount.com`）
4. 設定權限為「編輯者」
5. 取消勾選「通知使用者」
6. 點擊「共用」

---

## OpenAI API 設定

### 步驟 1：註冊 OpenAI 帳號

1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 註冊或登入帳號

### 步驟 2：取得 API Key

1. 點擊右上角頭像 → 「View API keys」
2. 點擊「Create new secret key」
3. 複製 API Key（只會顯示一次！）
4. 儲存到安全的地方

### 步驟 3：確認額度

1. 檢查「Billing」確認有可用額度
2. 建議至少儲值 $5 USD 用於測試

---

## 環境變數設定

### 步驟 1：複製範例檔案

```bash
cd 76dollshop-announcement-system
cp .env.example .env
```

### 步驟 2：編輯 .env 檔案

使用文字編輯器開啟 `.env`：

```bash
nano .env
# 或
code .env
```

### 步驟 3：填入真實資料

```env
# Google OAuth 設定
GOOGLE_CLIENT_ID=你的客戶端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的客戶端密鑰
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback

# Google Sheets 設定
GOOGLE_SHEETS_ID=你的試算表ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=你的服務帳戶Email
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json

# OpenAI ChatGPT API 設定
OPENAI_API_KEY=sk-你的OpenAI-API金鑰

# 允許存取的使用者 Email（逗號分隔，不要有空格）
ALLOWED_EMAILS=user1@76dollshop.com,user2@76dollshop.com,admin@76dollshop.com

# 伺服器設定
SERVER_PORT=8080
SESSION_SECRET=請改成一個隨機的長字串
```

### 步驟 4：生成安全的 Session Secret

```bash
# macOS/Linux
openssl rand -hex 32

# 將輸出的字串填入 SESSION_SECRET
```

---

## 執行專案

### 步驟 1：安裝依賴套件

```bash
cd 76dollshop-announcement-system
dub build
```

第一次執行會自動下載並編譯 Vibe.d 和相關依賴，需要幾分鐘時間。

### 步驟 2：啟動伺服器

```bash
dub run
```

看到以下訊息表示成功：
```
======================================================
76DollShop 內部公告與學習系統
伺服器運行於 http://localhost:8080
======================================================
```

### 步驟 3：開啟瀏覽器

訪問：http://localhost:8080

系統會自動導向 Google 登入頁面。

---

## 常見問題

### Q1: 編譯時出現 "vibe.d not found"

**解決方法**：
```bash
dub clean
dub build --force
```

### Q2: Google OAuth 登入後出現 "redirect_uri_mismatch" 錯誤

**解決方法**：
- 檢查 Google Cloud Console 中的「已授權的重新導向 URI」是否正確
- 確認 `.env` 中的 `GOOGLE_REDIRECT_URI` 與 Google Cloud 設定一致

### Q3: 無法寫入 Google Sheets

**解決方法**：
- 確認 Service Account Email 已加入 Sheets 的編輯權限
- 檢查 `service-account-key.json` 檔案路徑是否正確
- **注意**：目前程式碼中 JWT 簽署功能尚未完整實作，需要額外實作或使用第三方函式庫

### Q4: ChatGPT API 呼叫失敗

**解決方法**：
- 確認 API Key 正確且有效
- 檢查 OpenAI 帳號是否有足夠額度
- 查看伺服器 log 中的錯誤訊息

### Q5: "Access Denied: You don't have permission"

**解決方法**：
- 確認登入的 Email 已加入 `.env` 的 `ALLOWED_EMAILS` 清單
- Email 之間用逗號分隔，不要有空格
- 修改 `.env` 後需要重新啟動伺服器

### Q6: 如何新增允許的使用者？

**解決方法**：
1. 編輯 `.env` 檔案
2. 在 `ALLOWED_EMAILS` 中加入新的 Email（用逗號分隔）
3. 重新啟動伺服器：`Ctrl+C` 然後 `dub run`

---

## 進階設定

### 使用外部資料庫

目前公告資料儲存在記憶體中，伺服器重啟後會遺失。建議整合：
- **MongoDB**: 使用 `vibe-d:mongodb`
- **PostgreSQL**: 使用 `dpq2`
- **MySQL**: 使用 `mysql-native`

### JWT 簽署實作

為了完整支援 Google Sheets API，需要實作 JWT 簽署：
- 使用 D 語言的 JWT 函式庫（如 `jwt`）
- 或呼叫外部 Python/Node.js 腳本生成 JWT token

### 部署到正式環境

1. 更改 `GOOGLE_REDIRECT_URI` 為正式網域
2. 在 Google Cloud Console 更新 OAuth 重新導向 URI
3. 使用 HTTPS（建議使用 Nginx 反向代理）
4. 更改 `SESSION_SECRET` 為更安全的隨機字串
5. 設定適當的防火牆規則

---

## 支援

如有問題，請聯繫 76DollShop IT 部門。

**專案版本**: 1.0.0
**最後更新**: 2025-12-15
