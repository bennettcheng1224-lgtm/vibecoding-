# 76DollShop 內部公告系統 - 專案摘要

## 🎯 專案概述

這是一個為 76DollShop 量身打造的內部公告與學習管理系統，使用 **Vibe.d (D語言)** 開發，整合了 Google OAuth、Google Sheets 和 OpenAI ChatGPT API。

---

## ✨ 核心功能

### 1. 🔐 安全認證系統
- **Google OAuth 2.0** 單一登入
- 基於 Email 白名單的存取控制
- 只有授權員工才能存取系統

### 2. 📢 公告管理
- **發布公告**：員工可輸入標題、內容、分類
- **分類系統**：新品資訊、行政通知、維護保養、學習教材等
- **自動記錄**：發布者姓名、日期自動記錄

### 3. 📊 Google Sheets 整合
- 所有公告自動同步到 Google 試算表
- 便於後續資料分析與匯出
- 資料結構：標題、內容、分類、日期、發布者、已讀名單、測驗成績

### 4. ✅ 閱讀簽到功能
- 員工可標記「我已閱讀並理解」
- 系統記錄所有已讀者的 Email
- 即時顯示已讀人數

### 5. 🎮 AI 智慧測驗系統
- **自動生成題目**：使用 ChatGPT 根據公告內容生成 10-15 題測驗
- **互動式測驗**：單選題形式，即時回饋
- **成績追蹤**：自動計算分數並儲存到 Google Sheets
- **遊戲化設計**：根據成績顯示不同的 emoji 和鼓勵訊息

### 6. 🔍 搜尋與篩選
- **分類篩選**：快速查看特定分類的公告
- **關鍵字搜尋**：模糊搜尋標題和內容
- 即時更新結果

---

## 🏗️ 技術架構

### 後端技術棧
- **語言**: D Language (DMD/LDC)
- **框架**: Vibe.d 0.9.7+
- **HTTP Server**: Vibe.d 異步 HTTP 伺服器
- **Session 管理**: 記憶體 Session（可擴展至 Redis）

### 前端技術棧
- **模板引擎**: Diet Templates (.dt 檔案)
- **樣式**: 自訂 CSS（現代化設計）
- **JavaScript**: Vanilla JS（無框架依賴）
- **設計風格**: 響應式設計、卡片式佈局

### 外部服務整合
1. **Google OAuth 2.0**: 使用者認證
2. **Google Sheets API**: 資料儲存與同步
3. **OpenAI ChatGPT API**: 智慧題目生成（gpt-3.5-turbo）

---

## 📁 專案結構

```
76dollshop-announcement-system/
├── source/
│   └── app.d                      # 主程式（路由、API、業務邏輯）
├── views/
│   └── index.dt                   # 首頁模板（Diet Template）
├── public/
│   ├── css/
│   │   └── style.css              # 樣式表
│   └── js/
│       └── app.js                 # 前端 JavaScript
├── dub.json                       # DUB 專案設定
├── .env.example                   # 環境變數範例
├── .gitignore                     # Git 忽略清單
├── README.md                      # 專案說明
├── SETUP_GUIDE.md                 # 詳細安裝指南
└── PROJECT_SUMMARY.md             # 本檔案
```

---

## 🔌 API 端點說明

### 認證相關
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/login` | 導向 Google OAuth 登入頁面 |
| GET | `/auth/callback` | OAuth 回呼處理 |
| GET | `/logout` | 登出並清除 Session |

### 公告相關
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/` | 首頁（公告列表頁面） |
| GET | `/api/announcements` | 取得公告列表（支援篩選和搜尋） |
| POST | `/api/announcements` | 建立新公告 |
| POST | `/api/announcements/:id/read` | 標記公告為已讀 |

### 測驗相關
| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/api/quiz/generate` | 使用 ChatGPT 生成測驗題目 |
| POST | `/api/announcements/:id/quiz` | 提交測驗成績 |

---

## 🔧 環境變數配置

系統需要以下環境變數（詳見 `.env.example`）：

```env
# Google OAuth
GOOGLE_CLIENT_ID              # Google OAuth 客戶端 ID
GOOGLE_CLIENT_SECRET          # Google OAuth 客戶端密鑰
GOOGLE_REDIRECT_URI           # OAuth 回呼網址

# Google Sheets
GOOGLE_SHEETS_ID              # 試算表 ID
GOOGLE_SERVICE_ACCOUNT_EMAIL  # 服務帳戶 Email
GOOGLE_SERVICE_ACCOUNT_KEY_PATH  # 服務帳戶金鑰檔案路徑

# OpenAI
OPENAI_API_KEY                # OpenAI API 金鑰

# 存取控制
ALLOWED_EMAILS                # 允許存取的 Email 清單（逗號分隔）

# 伺服器
SERVER_PORT                   # 伺服器埠號（預設 8080）
SESSION_SECRET                # Session 加密金鑰
```

---

## 🚀 快速啟動

### 1. 安裝依賴
```bash
dub build
```

### 2. 設定環境變數
```bash
cp .env.example .env
# 編輯 .env 填入真實資料
```

### 3. 啟動伺服器
```bash
dub run
```

### 4. 訪問系統
開啟瀏覽器：http://localhost:8080

---

## 📊 資料流程圖

### 公告發布流程
```
員工輸入公告 → 前端驗證 → POST /api/announcements
    ↓
後端處理（app.d）
    ↓
1. 儲存到記憶體陣列
2. 同步寫入 Google Sheets
    ↓
回傳成功訊息 → 前端更新列表
```

### 測驗流程
```
點擊「開始測驗」→ POST /api/quiz/generate
    ↓
後端呼叫 ChatGPT API（帶入公告標題和內容）
    ↓
ChatGPT 生成 10-15 題選擇題（JSON 格式）
    ↓
前端渲染測驗介面
    ↓
員工作答 → 點擊提交 → 計算分數
    ↓
POST /api/announcements/:id/quiz（提交成績）
    ↓
後端儲存成績到記憶體和 Google Sheets
    ↓
前端顯示成績和鼓勵訊息
```

---

## ⚠️ 已知限制與待改進項目

### 目前限制
1. **資料持久化**：公告資料儲存在記憶體中，伺服器重啟後會遺失
   - **建議**：整合 MongoDB、PostgreSQL 或其他資料庫

2. **JWT 簽署**：Google Sheets API 的 Service Account 認證尚未完整實作
   - **建議**：使用 D 語言的 JWT 函式庫或外部腳本

3. **Session 管理**：使用簡易的記憶體 Session
   - **建議**：正式環境使用 Redis Session Store

4. **錯誤處理**：部分 API 呼叫的錯誤處理可以更完善
   - **建議**：加入重試機制、詳細錯誤日誌

5. **檔案上傳**：目前不支援上傳圖片或附件
   - **建議**：整合 Google Drive API 或本地檔案儲存

### 安全性考量
- ✅ Google OAuth 認證
- ✅ Email 白名單存取控制
- ✅ Session Cookie（建議正式環境啟用 HTTPS）
- ⚠️ CSRF 防護（建議加入）
- ⚠️ Rate Limiting（建議加入，特別是 ChatGPT API 呼叫）

---

## 🔮 未來擴展方向

### 功能擴展
1. **通知系統**
   - Email 通知新公告
   - 整合 Slack/Discord webhook

2. **進階測驗功能**
   - 是非題、多選題、填空題
   - 測驗時間限制
   - 排行榜系統

3. **統計分析**
   - 公告閱讀率統計
   - 測驗通過率分析
   - 員工學習進度追蹤

4. **行動應用**
   - 開發 iOS/Android App
   - 推播通知

### 技術優化
1. **前端框架升級**
   - 考慮使用 Vue.js 或 React
   - 提升使用者互動體驗

2. **Real-time 更新**
   - WebSocket 即時同步
   - 新公告即時推送

3. **國際化**
   - 多語言支援
   - 時區處理

---

## 📝 開發筆記

### 為什麼選擇 Vibe.d？
- **高效能**：異步 I/O，適合處理大量併發連線
- **類型安全**：D 語言的強類型系統減少執行期錯誤
- **內建模板引擎**：Diet Templates 簡潔易用
- **豐富的函式庫**：HTTP client、JSON 處理、加密等

### 關鍵設計決策
1. **Diet Templates 而非前端框架**
   - 簡化部署，無需 Node.js
   - 適合中小型專案
   - 未來可輕鬆遷移到 SPA

2. **Google Sheets 作為資料源**
   - 員工熟悉的介面
   - 方便匯出和分析
   - 零額外資料庫成本

3. **ChatGPT 自動生成測驗**
   - 減少人工出題負擔
   - 題目品質穩定
   - 可根據不同公告彈性調整

---

## 👥 團隊協作建議

### Git 工作流程
```bash
# 功能開發
git checkout -b feature/new-feature
git add .
git commit -m "Add: 新功能說明"
git push origin feature/new-feature

# 建議使用 Pull Request 進行 Code Review
```

### 分支策略
- `main`: 穩定版本
- `develop`: 開發版本
- `feature/*`: 功能分支
- `hotfix/*`: 緊急修復

---

## 📞 聯絡資訊

**專案負責人**: 76DollShop IT 團隊
**技術支援**: 請參考 `SETUP_GUIDE.md`
**問題回報**: 建立 GitHub Issue 或內部工單

---

**版本**: v1.0.0
**建立日期**: 2025-12-15
**最後更新**: 2025-12-15
