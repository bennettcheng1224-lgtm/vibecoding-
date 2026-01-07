# 76DollShop 內部公告系統 - 部署檢查清單

## 📋 開發環境設定

### 1. 安裝必要工具
- [ ] 安裝 D 語言編譯器 (DMD 或 LDC)
  ```bash
  brew install dmd  # macOS
  ```
- [ ] 驗證 dub 已安裝
  ```bash
  dub --version
  ```

### 2. Google Cloud Platform 設定

#### OAuth 2.0 設定
- [ ] 建立 Google Cloud 專案
- [ ] 啟用 Google+ API
- [ ] 建立 OAuth 2.0 客戶端 ID
- [ ] 設定授權重新導向 URI: `http://localhost:8080/auth/callback`
- [ ] 記錄 Client ID 和 Client Secret

#### Google Sheets API 設定
- [ ] 啟用 Google Sheets API
- [ ] 建立 Service Account
- [ ] 下載 Service Account JSON 金鑰
- [ ] 將金鑰檔案命名為 `service-account-key.json`
- [ ] 將金鑰檔案放置於專案根目錄
- [ ] 建立 Google Sheets 試算表
- [ ] 設定試算表第一列標題：
  ```
  標題 | 內容 | 分類 | 發布日期 | 發布者 | 已閱讀名單 | 測驗成績
  ```
- [ ] 將 Service Account Email 加入試算表編輯權限
- [ ] 記錄試算表 ID

### 3. OpenAI API 設定
- [ ] 註冊 OpenAI 帳號
- [ ] 建立 API Key
- [ ] 記錄 API Key
- [ ] 確認帳號有可用額度（建議至少 $5 USD）

### 4. 環境變數設定
- [ ] 複製 `.env.example` 為 `.env`
  ```bash
  cp .env.example .env
  ```
- [ ] 填入 `GOOGLE_CLIENT_ID`
- [ ] 填入 `GOOGLE_CLIENT_SECRET`
- [ ] 填入 `GOOGLE_REDIRECT_URI`
- [ ] 填入 `GOOGLE_SHEETS_ID`
- [ ] 填入 `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] 確認 `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` 路徑正確
- [ ] 填入 `OPENAI_API_KEY`
- [ ] 設定 `ALLOWED_EMAILS`（允許存取的 Email 清單）
- [ ] 生成並填入安全的 `SESSION_SECRET`
  ```bash
  openssl rand -hex 32
  ```

## 🔧 專案建置與測試

### 5. 建置專案
- [ ] 安裝專案依賴
  ```bash
  dub build
  ```
- [ ] 確認建置成功，無錯誤訊息

### 6. 啟動開發伺服器
- [ ] 執行啟動腳本
  ```bash
  ./start.sh
  ```
  或
  ```bash
  dub run
  ```
- [ ] 確認看到啟動訊息：
  ```
  76DollShop 內部公告與學習系統
  伺服器運行於 http://localhost:8080
  ```

### 7. 功能測試

#### 認證功能
- [ ] 訪問 `http://localhost:8080`
- [ ] 自動導向 Google 登入頁面
- [ ] 使用允許的 Email 登入
- [ ] 成功進入系統主頁
- [ ] 測試使用未授權 Email 登入（應顯示拒絕訊息）
- [ ] 測試登出功能

#### 公告功能
- [ ] 建立新公告
  - [ ] 填寫發布者姓名
  - [ ] 填寫標題
  - [ ] 填寫內容
  - [ ] 選擇分類
  - [ ] 提交公告
  - [ ] 確認公告出現在列表中
- [ ] 確認公告資料寫入 Google Sheets
- [ ] 測試分類篩選功能
- [ ] 測試關鍵字搜尋功能

#### 閱讀簽到功能
- [ ] 點擊「我已閱讀並理解」按鈕
- [ ] 確認已讀人數增加
- [ ] 確認資料更新（目前儲存在記憶體）

#### 測驗功能
- [ ] 點擊「開始學習測驗」按鈕
- [ ] 確認 ChatGPT 成功生成測驗題目
- [ ] 檢查題目品質和相關性
- [ ] 完成測驗並提交
- [ ] 確認顯示成績和回饋訊息
- [ ] 確認成績資料儲存（目前在記憶體）

## ⚙️ 進階設定（可選）

### 8. 資料庫整合（建議）
- [ ] 選擇資料庫系統（MongoDB / PostgreSQL / MySQL）
- [ ] 安裝對應的 D 語言驅動程式
- [ ] 設計資料庫 Schema
- [ ] 修改 `source/app.d` 整合資料庫操作
- [ ] 移除記憶體儲存，改用資料庫

### 9. JWT 簽署實作（必要）
- [ ] 安裝 JWT 函式庫
  ```bash
  # 在 dub.json 中加入
  "jwt": "~>0.3.0"
  ```
- [ ] 實作 `getGoogleSheetsAccessToken()` 函式
- [ ] 使用 Service Account 金鑰生成 JWT
- [ ] 測試 Google Sheets API 寫入功能

### 10. Session 管理優化
- [ ] 安裝 Redis
- [ ] 整合 Redis Session Store
- [ ] 修改 Session 儲存邏輯

### 11. 安全性加強
- [ ] 實作 CSRF Token 保護
- [ ] 加入 Rate Limiting
- [ ] 設定 CORS 政策
- [ ] 啟用 HTTPS（正式環境）
- [ ] 定期更新 Session Secret

## 🚀 正式環境部署

### 12. 正式環境準備
- [ ] 申請網域名稱
- [ ] 設定 DNS 記錄
- [ ] 申請 SSL 憑證（Let's Encrypt 或購買）
- [ ] 更新 `.env` 中的 `GOOGLE_REDIRECT_URI` 為正式網域
- [ ] 在 Google Cloud Console 更新 OAuth 重新導向 URI

### 13. 伺服器設定
- [ ] 租用 VPS 或雲端主機（AWS / GCP / DigitalOcean）
- [ ] 安裝 D 語言編譯器
- [ ] 克隆專案到伺服器
- [ ] 設定環境變數
- [ ] 建置專案
- [ ] 設定 Nginx 反向代理
  ```nginx
  server {
      listen 80;
      server_name your-domain.com;

      location / {
          proxy_pass http://localhost:8080;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }
  ```
- [ ] 設定 SSL (certbot)
- [ ] 設定防火牆規則
- [ ] 設定自動重啟（systemd service）

### 14. 監控與維護
- [ ] 設定日誌記錄
- [ ] 設定錯誤監控（Sentry / Rollbar）
- [ ] 設定效能監控
- [ ] 設定自動備份（資料庫和設定檔）
- [ ] 建立災難復原計畫

## 📝 文件與培訓

### 15. 文件準備
- [ ] 準備使用者操作手冊
- [ ] 準備管理員手冊
- [ ] 準備 API 文件
- [ ] 準備故障排除指南

### 16. 員工培訓
- [ ] 舉辦系統使用說明會
- [ ] 準備教學影片
- [ ] 建立常見問題 FAQ
- [ ] 指定系統管理員

## ✅ 上線檢查

### 17. 最終檢查
- [ ] 所有功能測試通過
- [ ] 效能測試通過（負載測試）
- [ ] 安全性掃描通過
- [ ] 備份機制運作正常
- [ ] 監控系統正常運作
- [ ] 員工已完成培訓
- [ ] 緊急聯絡人清單已建立

### 18. 上線
- [ ] 選擇低流量時段上線
- [ ] 通知所有員工系統上線
- [ ] 密切監控系統狀態
- [ ] 收集使用者回饋
- [ ] 快速修復發現的問題

## 📊 上線後追蹤

### 19. 持續改進
- [ ] 每週檢視系統使用率
- [ ] 收集功能需求
- [ ] 規劃版本更新
- [ ] 定期安全性審核
- [ ] 效能優化

---

## 🆘 緊急聯絡

- **系統管理員**: _______________
- **技術支援**: _______________
- **Google Cloud 支援**: https://cloud.google.com/support
- **OpenAI 支援**: https://help.openai.com

---

**檢查清單版本**: v1.0.0
**最後更新**: 2025-12-15

---

## 備註

- 打勾 `[x]` 表示已完成
- 星號 `*` 表示可選項目
- 驚嘆號 `!` 表示重要項目
