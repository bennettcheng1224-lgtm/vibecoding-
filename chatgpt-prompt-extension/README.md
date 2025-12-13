# 🧠 ChatGPT Prompt 快捷庫

一個簡單實用的 Chrome Extension，讓你快速管理和插入常用的 ChatGPT 提示詞，大幅提升工作效率！

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)

## ✨ 功能特色

- 📝 **提示詞管理**：輕鬆新增、刪除常用提示詞
- 🚀 **一鍵插入**：點擊即可將提示詞插入 ChatGPT 輸入框
- 💾 **本地儲存**：使用 localStorage 儲存，資料安全不外流
- 🌐 **跨域支援**：支援 `chat.openai.com` 和 `chatgpt.com`
- 📤 **匯出備份**：可將提示詞匯出為 JSON 檔案
- 📥 **匯入還原**：可匯入 JSON 檔案，跨裝置同步
- 🎨 **暗色主題**：現代化深色介面，保護眼睛
- 🌏 **中英文支援**：完整支援繁體中文與英文

## 📦 安裝方式

### 方法一：本地安裝（開發者模式）

1. **下載或複製所有檔案**
   ```bash
   chatgpt-prompt-extension/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   ├── content.js
   ├── background.js
   └── README.md
   ```

2. **準備圖示檔案**（選用，或使用預設）
   - 需要準備 `icon16.png`、`icon48.png`、`icon128.png`
   - 如果沒有圖示，可以暫時移除 manifest.json 中的 icons 相關設定

3. **開啟 Chrome 擴充功能頁面**
   - 在網址列輸入：`chrome://extensions/`
   - 或點選「選單」→「更多工具」→「擴充功能」

4. **啟用開發者模式**
   - 點擊右上角的「開發人員模式」開關

5. **載入擴充功能**
   - 點擊「載入未封裝項目」
   - 選擇包含所有檔案的資料夾
   - 完成！Extension 圖示應該會出現在工具列

### 方法二：Chrome Web Store 安裝（未來計畫）

目前尚未上架 Chrome Web Store，敬請期待！

## 🚀 使用方法

### 1️⃣ 新增提示詞

1. 點擊工具列上的 Extension 圖示
2. 在「新增提示詞」輸入框中輸入常用的提示詞
3. 點擊「儲存提示詞」按鈕
4. 提示詞會立即出現在列表中

**小技巧**：按下 `Ctrl+Enter`（Mac 用 `Cmd+Enter`）可快速儲存！

### 2️⃣ 使用提示詞

1. 開啟 [ChatGPT](https://chat.openai.com) 或 [ChatGPT.com](https://chatgpt.com)
2. 點擊工具列上的 Extension 圖示
3. 點擊想要使用的提示詞
4. 提示詞會自動插入 ChatGPT 輸入框
5. Popup 會自動關閉，可立即送出訊息

### 3️⃣ 刪除提示詞

1. 點擊提示詞右側的 🗑️ 按鈕
2. 確認刪除即可

### 4️⃣ 匯出提示詞（備份）

1. 點擊「📤 匯出」按鈕
2. 系統會自動下載 JSON 檔案
3. 檔名格式：`chatgpt-prompts-YYYY-MM-DD.json`

### 5️⃣ 匯入提示詞（還原）

1. 點擊「📥 匯入」按鈕
2. 選擇之前匯出的 JSON 檔案
3. 選擇「合併」或「覆蓋」現有提示詞
   - **合併**：保留現有 + 新增匯入的
   - **覆蓋**：刪除現有，只保留匯入的

## 📁 檔案結構

```
chatgpt-prompt-extension/
│
├── manifest.json       # Extension 設定檔（Manifest V3）
├── popup.html          # Popup 介面（HTML + CSS）
├── popup.js            # Popup 邏輯（管理提示詞、匯出匯入）
├── content.js          # 內容腳本（注入 ChatGPT 頁面）
├── background.js       # 背景服務（處理訊息轉發）
├── icon16.png          # 16x16 圖示（選用）
├── icon48.png          # 48x48 圖示（選用）
├── icon128.png         # 128x128 圖示（選用）
└── README.md           # 說明文件（本檔案）
```

## 🛠️ 技術細節

### 使用技術

- **Manifest V3**：最新的 Chrome Extension 規格
- **Vanilla JavaScript**：純 JS，無需任何框架
- **localStorage**：本地儲存，資料不上傳雲端
- **Content Script**：注入 ChatGPT 頁面，操作 DOM
- **Chrome APIs**：使用 `chrome.tabs`、`chrome.runtime` 等 API

### 相容性

- ✅ Chrome 瀏覽器（建議版本 88+）
- ✅ Edge 瀏覽器（Chromium 核心）
- ✅ 其他 Chromium 核心瀏覽器
- ❌ Firefox（需修改為 WebExtensions API）
- ❌ Safari（需重新打包）

### 支援的 ChatGPT 網域

- `https://chat.openai.com/*`
- `https://chatgpt.com/*`

## ⚠️ 注意事項

1. **圖示檔案**：如果沒有準備圖示，請在 `manifest.json` 中移除 `icons` 和 `action.default_icon` 相關設定
2. **輸入框變化**：ChatGPT 網站結構可能會更新，如果插入功能失效，請檢查 `content.js` 中的選擇器
3. **資料安全**：所有資料儲存在本地瀏覽器，不會上傳到任何伺服器
4. **權限說明**：
   - `storage`：用於儲存提示詞
   - `activeTab`：用於取得當前分頁資訊
   - `scripting`：用於注入內容腳本
   - `host_permissions`：僅限 ChatGPT 網域

## 🐛 疑難排解

### 問題：點擊提示詞後無法插入

**解決方法**：
1. 重新整理 ChatGPT 頁面
2. 確認網址是 `chat.openai.com` 或 `chatgpt.com`
3. 檢查 Console 是否有錯誤訊息（按 F12 開啟開發者工具）

### 問題：Extension 圖示不顯示

**解決方法**：
1. 準備三個尺寸的 PNG 圖示檔案（16x16、48x48、128x128）
2. 或在 `manifest.json` 中移除 `icons` 設定

### 問題：提示詞消失

**解決方法**：
- 資料儲存在 localStorage，清除瀏覽器資料會遺失
- 建議定期使用「匯出」功能備份

## 📝 更新日誌

### v1.0.0（2024-12-09）

- 🎉 首次發布
- ✅ 提示詞新增、刪除功能
- ✅ 一鍵插入到 ChatGPT
- ✅ 匯出 / 匯入 JSON 備份
- ✅ 暗色主題介面
- ✅ 支援中英文

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📄 授權

本專案採用 MIT 授權條款。

## 💡 提示詞範例

以下是一些常用的提示詞範例，可以匯入使用：

```json
[
  "請用繁體中文回答",
  "請用簡單易懂的方式解釋",
  "請提供程式碼範例",
  "請幫我檢查這段程式碼有沒有錯誤",
  "請幫我優化這段程式碼的效能",
  "請以表格形式整理這些資訊",
  "請用 Markdown 格式回答",
  "請提供詳細的步驟說明",
  "請舉一個實際的例子",
  "請繼續上一個回答"
]
```

## 📮 聯絡方式

如有任何問題或建議，歡迎聯絡：

- GitHub Issues
- Email: your-email@example.com

---

**喜歡這個專案嗎？請給一個 ⭐ Star！**
