# 🚀 76DollShop 內部公告系統 - 快速開始

## 5 分鐘快速啟動指南

### 步驟 1：安裝 D 語言 (2 分鐘)

```bash
# macOS
brew install dmd

# 驗證安裝
dmd --version
dub --version
```

### 步驟 2：設定環境變數 (2 分鐘)

```bash
# 複製範例檔案
cp .env.example .env

# 編輯 .env（使用你喜歡的編輯器）
nano .env
```

**最少需要填入的欄位**（快速測試用）：
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
ALLOWED_EMAILS=your-email@gmail.com
OPENAI_API_KEY=sk-your-key
SESSION_SECRET=random-secret-key
```

### 步驟 3：啟動系統 (1 分鐘)

```bash
# 執行啟動腳本
./start.sh

# 或手動執行
dub build && dub run
```

### 步驟 4：開啟瀏覽器

訪問：**http://localhost:8080**

---

## 📖 詳細文件

如需完整設定指南，請參考：

1. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - 詳細安裝與設定教學
2. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 專案架構與功能說明
3. **[CHECKLIST.md](CHECKLIST.md)** - 部署檢查清單
4. **[README.md](README.md)** - 專案簡介

---

## ⚡ 快速指令參考

### 開發指令

```bash
# 建置專案
dub build

# 執行開發伺服器
dub run

# 清理建置快取
dub clean

# 強制重新建置
dub build --force

# 編譯最佳化版本
dub build --build=release
```

### Git 指令

```bash
# 初始化 Git 儲存庫
git init
git add .
git commit -m "Initial commit: 76DollShop announcement system"

# 推送到遠端
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 🎯 核心功能速覽

### 1. 發布公告
1. 登入系統
2. 填寫「發布新公告」表單
3. 選擇分類
4. 點擊「發布公告」

### 2. 閱讀簽到
1. 瀏覽公告列表
2. 點擊公告卡片
3. 點擊「我已閱讀並理解」

### 3. 學習測驗
1. 找到感興趣的公告
2. 點擊「開始學習測驗」
3. 等待 AI 生成題目
4. 回答所有問題
5. 提交查看成績

### 4. 搜尋與篩選
1. 使用分類下拉選單篩選
2. 或輸入關鍵字搜尋
3. 點擊「搜尋」按鈕

---

## 🔑 API 金鑰取得連結

快速跳轉到各服務的金鑰設定頁面：

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Google Sheets**: https://sheets.google.com
- **OpenAI API Keys**: https://platform.openai.com/api-keys

---

## ❓ 常見問題快速解答

### Q: 無法登入？
**A**: 確認你的 Email 已加入 `.env` 的 `ALLOWED_EMAILS` 清單

### Q: ChatGPT 不回應？
**A**:
1. 檢查 `OPENAI_API_KEY` 是否正確
2. 確認 OpenAI 帳號有可用額度

### Q: 建置失敗？
**A**: 執行 `dub clean && dub build --force`

### Q: 修改 .env 後沒生效？
**A**: 需要重新啟動伺服器（Ctrl+C 後再 `dub run`）

---

## 🛠️ 故障排除速查

| 錯誤訊息 | 解決方法 |
|---------|---------|
| `dmd: command not found` | 安裝 D 語言編譯器 |
| `redirect_uri_mismatch` | 檢查 Google Cloud OAuth 設定 |
| `Access Denied` | 檢查 ALLOWED_EMAILS 清單 |
| `OpenAI API error` | 檢查 API Key 和帳號額度 |
| `Port 8080 already in use` | 關閉占用的程式或更改 SERVER_PORT |

---

## 📞 需要幫助？

1. 查看 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** 詳細說明
2. 檢查系統日誌訊息
3. 聯繫 76DollShop IT 部門

---

**提示**: 第一次設定建議預留 30-60 分鐘完整設定所有 API 金鑰
