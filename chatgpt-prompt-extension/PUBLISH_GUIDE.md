# 📦 Chrome Web Store 發佈指南

完整的 Chrome Extension 發佈流程，從準備到上架。

## 📋 發佈前檢查清單

在發佈之前，請確認以下項目都已完成：

### 1️⃣ 必備檔案

- [x] `manifest.json` - 已完成
- [x] `popup.html` - 已完成
- [x] `popup.js` - 已完成
- [x] `content.js` - 已完成
- [x] `background.js` - 已完成
- [ ] `icon16.png` - **需要準備**
- [ ] `icon48.png` - **需要準備**
- [ ] `icon128.png` - **需要準備**
- [ ] 商店圖示 (128x128) - **需要準備**
- [ ] 宣傳圖片 (440x280 或更大) - **需要準備**
- [ ] 截圖 (1280x800 或 640x400) - **需要準備**

### 2️⃣ 圖示準備（重要！）

Chrome Web Store **必須**要有圖示才能上架。

#### 快速製作圖示的方法：

**方法 A：使用 Canva（推薦，簡單）**

1. 前往 https://www.canva.com（免費註冊）
2. 選擇「自訂尺寸」→ 128x128 像素
3. 設計你的圖示：
   - 背景：使用漸層（藍色→紫色）
   - 圖案：加入 🧠 emoji 或文字 "GPT"
   - 風格：簡潔、專業
4. 匯出為 PNG
5. 使用線上工具調整尺寸：
   - https://www.iloveimg.com/resize-image
   - 產生 16x16、48x48、128x128 三種尺寸

**方法 B：使用 AI 生成（快速）**

使用 DALL-E、Midjourney 或其他 AI 工具生成：
- 提示詞範例：「A simple, modern icon for a ChatGPT prompt manager Chrome extension, brain emoji, gradient blue and purple background, minimalist design, 128x128 pixels」

**方法 C：線上圖示產生器**

- https://favicon.io/favicon-generator/
- https://www.freelogodesign.org/

#### 圖示尺寸需求：

| 檔案名稱 | 尺寸 | 用途 |
|---------|------|------|
| `icon16.png` | 16x16 | 工具列小圖示 |
| `icon48.png` | 48x48 | Extension 管理頁面 |
| `icon128.png` | 128x128 | Chrome Web Store、安裝時顯示 |

### 3️⃣ 商店素材準備

#### A. 商店圖示（Store Icon）
- **尺寸**：128x128 像素
- **格式**：PNG
- **說明**：與 `icon128.png` 相同即可

#### B. 宣傳圖片（Promotional Images）- 可選但強烈建議

**小型宣傳圖（Small Promo Tile）**
- **尺寸**：440x280 像素
- **格式**：PNG 或 JPG
- **內容建議**：
  - Extension 名稱
  - 主要功能亮點
  - 簡潔的視覺設計

**範例文案**：
```
🧠 ChatGPT Prompt 快捷庫
✓ 快速管理常用提示詞
✓ 一鍵插入 ChatGPT
✓ 匯出/匯入備份
```

#### C. 截圖（Screenshots）- **必須**

至少需要 **1 張**，最多 5 張

- **尺寸**：1280x800 或 640x400 像素
- **格式**：PNG 或 JPG
- **建議截圖內容**：
  1. Popup 介面（顯示提示詞列表）
  2. 新增提示詞的畫面
  3. 在 ChatGPT 使用的實際效果
  4. 匯出/匯入功能

**如何截圖**：
1. 開啟 Extension
2. 使用 macOS：`Cmd + Shift + 4`（選取區域截圖）
3. 使用 Windows：`Win + Shift + S`
4. 或使用瀏覽器 DevTools 調整視窗大小後截圖

### 4️⃣ 更新 manifest.json

確認圖示已加回 `manifest.json`：

```json
{
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

## 🚀 發佈步驟

### 步驟 1：註冊 Chrome Web Store 開發者帳號

1. **前往開發者控制台**
   - 網址：https://chrome.google.com/webstore/devconsole

2. **登入 Google 帳號**
   - 使用你的 Google 帳號登入

3. **支付註冊費用**
   - **一次性費用**：USD $5（約 NT$ 150）
   - 支付方式：信用卡
   - 此費用終身有效，可發佈無限個 Extension

4. **填寫開發者資訊**
   - 開發者名稱
   - Email 地址
   - 網站（選填）

### 步驟 2：打包 Extension

有兩種打包方式：

#### 方法 A：直接上傳資料夾（推薦）

Chrome Web Store 支援直接上傳 ZIP 檔案。

1. **壓縮專案資料夾**

```bash
cd "/Users/bennettcheng/Desktop/vibe coding/"
zip -r chatgpt-prompt-extension.zip chatgpt-prompt-extension/ -x "*.DS_Store" "*.git*" "README.md" "PUBLISH_GUIDE.md" "ICON_GUIDE.md" "QUICK_START.md" "sample-prompts.json" ".gitignore"
```

或使用 Finder：
- 右鍵點擊資料夾
- 選擇「壓縮」
- 產生 `.zip` 檔案

2. **確認 ZIP 內容**

ZIP 檔案內應包含：
```
chatgpt-prompt-extension.zip
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── icon16.png
├── icon48.png
└── icon128.png
```

**注意**：不要包含這些檔案：
- ❌ README.md
- ❌ PUBLISH_GUIDE.md
- ❌ .git/
- ❌ .DS_Store
- ❌ node_modules/

#### 方法 B：使用 Chrome 打包（產生 .crx 檔案）

1. 前往 `chrome://extensions/`
2. 開啟「開發人員模式」
3. 點擊「打包擴充功能」
4. 選擇專案資料夾
5. 產生 `.crx` 和 `.pem` 檔案

**注意**：Chrome Web Store 目前主要接受 ZIP 檔案。

### 步驟 3：上傳到 Chrome Web Store

1. **前往開發者控制台**
   - https://chrome.google.com/webstore/devconsole

2. **點擊「新增項目」**

3. **上傳 ZIP 檔案**
   - 選擇剛才打包的 `.zip` 檔案
   - 等待上傳完成

4. **填寫商店資訊**（重要！）

### 步驟 4：填寫商店資訊

#### A. 基本資訊

**Extension 名稱**（必填）
```
ChatGPT Prompt 快捷庫
```
或英文版本：
```
ChatGPT Prompt Manager
```

**簡短描述**（必填，132 字元以內）
```
快速管理並插入常用的 ChatGPT 提示詞，提升工作效率。支援匯出/匯入備份。
```

英文版本：
```
Quickly manage and insert your frequently used ChatGPT prompts. Boost your productivity with export/import features.
```

**詳細描述**（必填）

```
🧠 ChatGPT Prompt 快捷庫

一個簡單實用的 Chrome Extension，讓你快速管理和插入常用的 ChatGPT 提示詞。

✨ 主要功能

• 📝 提示詞管理：輕鬆新增、刪除常用提示詞
• 🚀 一鍵插入：點擊即可將提示詞插入 ChatGPT 輸入框
• 💾 本地儲存：使用 localStorage 儲存，資料安全不外流
• 📤 匯出備份：可將提示詞匯出為 JSON 檔案
• 📥 匯入還原：可匯入 JSON 檔案，跨裝置同步
• 🎨 暗色主題：現代化深色介面，保護眼睛
• 🌏 中英文支援：完整支援繁體中文與英文

🎯 使用方式

1. 點擊工具列上的 Extension 圖示
2. 在輸入框中新增常用提示詞
3. 前往 ChatGPT 網站（chat.openai.com）
4. 點擊提示詞，自動插入輸入框
5. 完成！

🔒 隱私保護

• 所有資料儲存在本地瀏覽器
• 不會上傳到任何伺服器
• 不會收集任何個人資訊
• 開源程式碼，安全透明

🌐 支援網域

• https://chat.openai.com
• https://chatgpt.com

💡 適合族群

• 經常使用 ChatGPT 的工作者
• 需要重複使用特定提示詞的使用者
• 想要提升 ChatGPT 使用效率的人

📧 聯絡方式

如有問題或建議，歡迎透過 support email 聯絡我們。

---

⭐ 喜歡這個 Extension 嗎？請給我們評分和評論！
```

#### B. 分類（Category）

選擇：
- **主要**：生產力工具（Productivity）
- **次要**：開發者工具（Developer Tools）或無

#### C. 語言（Language）

- 預設語言：繁體中文（Traditional Chinese）
- 或：英文（English）

#### D. 隱私權政策

**隱私權政策說明**：

```
本 Extension 不會收集、傳輸或儲存任何個人資料到外部伺服器。

所有提示詞資料皆儲存於使用者本機的 localStorage 中，不會上傳至雲端。

本 Extension 僅存取以下權限：
- storage: 用於本地儲存提示詞
- activeTab: 用於在 ChatGPT 頁面插入提示詞
- 僅限 chat.openai.com 和 chatgpt.com 網域

我們不會追蹤使用者行為，不會收集任何分析數據。
```

**隱私權政策網址**（選填）：
- 如果你有網站，可以放上隱私權政策頁面
- 或使用 GitHub：`https://github.com/your-username/chatgpt-prompt-extension/blob/main/PRIVACY.md`

#### E. 權限說明（Justification）

Chrome Web Store 會要求你說明為什麼需要這些權限：

**storage**
```
用於在本地儲存使用者的提示詞資料，不會上傳到任何伺服器。
```

**activeTab**
```
用於取得當前分頁資訊，確認使用者是否在 ChatGPT 網站上。
```

**host_permissions (chat.openai.com, chatgpt.com)**
```
用於在 ChatGPT 網站注入內容腳本，實現自動插入提示詞功能。
```

### 步驟 5：上傳素材

1. **商店圖示**：上傳 128x128 圖示
2. **截圖**：上傳至少 1 張截圖（最多 5 張）
3. **宣傳圖片**（可選）：上傳 440x280 圖片

### 步驟 6：設定發佈選項

#### A. 定價

- 選擇：**免費**

#### B. 發佈範圍

- **公開**：所有人都可以搜尋和安裝
- **不公開**：只有你選擇的人可以安裝
- **私密**：只有你的網域內的人可以安裝

建議選擇：**公開**

#### C. 發佈區域

- 選擇：**所有地區**
- 或只選擇：台灣、香港、中國等繁體中文地區

### 步驟 7：提交審核

1. **預覽資訊**
   - 檢查所有資訊是否正確

2. **提交審核**
   - 點擊「提交審核」按鈕
   - 等待 Google 審核

3. **審核時間**
   - 通常：1-3 個工作天
   - 繁忙期：最多 1-2 週

4. **審核狀態**
   - 可在開發者控制台查看審核進度
   - 會收到 Email 通知

## ✅ 審核通過後

### 自動發佈
- 審核通過後，Extension 會自動發佈到 Chrome Web Store
- 使用者可以搜尋並安裝

### 取得 Extension 連結
- 格式：`https://chrome.google.com/webstore/detail/[extension-id]`
- 可在開發者控制台取得

### 分享連結
- 將連結分享到社群媒體
- 加入到專案 README.md

## 📊 發佈後管理

### 1. 查看統計數據
- 安裝次數
- 使用者評分
- 評論

### 2. 回覆評論
- 定期檢查評論
- 回覆使用者問題
- 改進 Extension

### 3. 更新版本

當需要更新時：

1. 修改程式碼
2. 更新 `manifest.json` 的版本號
   ```json
   "version": "1.0.1"
   ```
3. 重新打包成 ZIP
4. 前往開發者控制台
5. 上傳新版本
6. 填寫更新說明
7. 提交審核

### 4. 監控錯誤
- 查看使用者回報
- 使用 Chrome Web Store 的錯誤報告功能

## ⚠️ 常見問題

### Q1: 審核被拒絕怎麼辦？

**常見原因**：
- 缺少圖示
- 隱私權政策不完整
- 權限說明不清楚
- 功能描述不明確

**解決方法**：
- 根據 Google 的回覆修正
- 重新提交審核

### Q2: 需要準備哪些圖示？

**必須**：
- icon16.png, icon48.png, icon128.png
- 至少 1 張截圖

**建議**：
- 440x280 宣傳圖片
- 多張截圖展示功能

### Q3: 如何處理版本更新？

1. 更新 `manifest.json` 版本號
2. 重新打包
3. 上傳到開發者控制台
4. 等待審核通過
5. 自動推送給所有使用者

### Q4: 可以收費嗎？

可以，但需要：
- 設定付款資訊
- 遵守 Google 的付款政策
- 或使用訂閱制（需額外開發）

### Q5: 如何增加下載量？

- 優化商店頁面（截圖、描述）
- 分享到社群媒體
- 撰寫部落格文章
- 回覆評論，提升評分
- SEO 優化（關鍵字）

## 📝 檢查清單

發佈前最後確認：

- [ ] 所有功能都正常運作
- [ ] 已準備三種尺寸的圖示
- [ ] 已準備至少 1 張截圖
- [ ] manifest.json 版本號正確
- [ ] 已移除所有測試和開發檔案
- [ ] 商店描述已撰寫完成
- [ ] 隱私權政策已準備
- [ ] 已註冊開發者帳號並支付費用
- [ ] ZIP 檔案已正確打包
- [ ] 已測試 ZIP 檔案可正常載入

## 🎉 發佈成功！

恭喜你完成發佈！

接下來：
1. 分享你的 Extension 連結
2. 持續改進功能
3. 回覆使用者評論
4. 定期更新版本

---

**需要協助？**
- Chrome Web Store 說明中心：https://developer.chrome.com/docs/webstore/
- 開發者論壇：https://groups.google.com/a/chromium.org/g/chromium-extensions

祝你的 Extension 大受歡迎！🚀
