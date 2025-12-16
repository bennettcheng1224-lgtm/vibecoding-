# 76DollShop 內部公告與學習系統

## 專案簡介

這是一個基於 Vibe.d (D語言) 開發的內部公告與學習系統，整合 Google Sheets 資料儲存和 OpenAI ChatGPT API 自動生成測驗題目。

## 核心功能

- ✅ **Google OAuth 2.0 登入** - 僅限授權的 Email 存取
- 📢 **公告管理** - 發布、查看、分類和搜尋公告
- 📊 **Google Sheets 整合** - 自動同步公告資料到試算表
- ✅ **閱讀簽到** - 員工確認已閱讀公告
- 🎮 **AI 測驗系統** - ChatGPT 自動生成測驗題目
- 📈 **成績追蹤** - 記錄測驗分數到 Google Sheets

## 安裝步驟

### 1. 安裝 D 語言編譯器和 DUB

```bash
# macOS (使用 Homebrew)
brew install dmd

# 或下載安裝包
# https://dlang.org/download.html
```

### 2. 設定環境變數

```bash
cp .env.example .env
# 編輯 .env 填入你的 API 金鑰和設定
```

### 3. 設定 Google OAuth 2.0

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API 和 Google Sheets API
4. 建立 OAuth 2.0 客戶端 ID
5. 將 Client ID 和 Client Secret 填入 `.env`

### 4. 設定 Google Sheets

1. 建立新的 Google 試算表
2. 在第一列設定標題：`標題 | 內容 | 分類 | 發布日期 | 發布者 | 已閱讀名單 | 測驗成績`
3. 複製試算表 ID（網址中的長字串）填入 `.env`

### 5. 設定 Google Service Account (用於寫入 Sheets)

1. 在 Google Cloud Console 建立 Service Account
2. 下載 JSON 金鑰檔案並儲存為 `service-account-key.json`
3. 將 Service Account Email 加入試算表的編輯權限

### 6. 設定 OpenAI API

1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 建立 API Key
3. 填入 `.env` 的 `OPENAI_API_KEY`

## 執行專案

```bash
# 安裝依賴
dub build

# 執行開發伺服器
dub run

# 訪問網站
# http://localhost:8080
```

## 專案結構

```
76dollshop-announcement-system/
├── source/
│   └── app.d                 # 主程式
├── views/
│   ├── index.dt              # 首頁模板
│   ├── announcement.dt       # 公告詳情模板
│   └── quiz.dt               # 測驗模板
├── public/
│   ├── css/
│   │   └── style.css         # 樣式表
│   └── js/
│       └── app.js            # 前端 JavaScript
├── dub.json                  # DUB 專案設定
├── .env                      # 環境變數（不加入版控）
└── README.md                 # 說明文件
```

## API 端點

### 認證
- `GET /login` - 導向 Google OAuth 登入
- `GET /auth/callback` - OAuth 回呼處理
- `GET /logout` - 登出

### 公告
- `GET /` - 首頁（公告列表）
- `GET /api/announcements` - 取得所有公告
- `POST /api/announcements` - 建立新公告
- `POST /api/announcements/:id/read` - 標記為已讀

### 測驗
- `POST /api/quiz/generate` - 使用 ChatGPT 生成測驗
- `POST /api/announcements/:id/quiz` - 提交測驗成績

## 技術架構

- **後端框架**: Vibe.d (D語言)
- **認證**: Google OAuth 2.0
- **資料儲存**: Google Sheets API
- **AI 整合**: OpenAI ChatGPT API
- **前端**: HTML5 + CSS3 + Vanilla JavaScript

## 授權

Copyright © 2025 76DollShop. All rights reserved.
