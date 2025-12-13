# 🚀 快速開始指南

## 5 分鐘快速安裝

### 步驟 1：準備檔案

確認你有以下檔案：

```
✅ manifest.json
✅ popup.html
✅ popup.js
✅ content.js
✅ background.js
✅ README.md
⚠️ icon16.png (可選)
⚠️ icon48.png (可選)
⚠️ icon128.png (可選)
```

### 步驟 2：處理圖示（二選一）

**選項 A：暫時移除圖示（最快）**

開啟 `manifest.json`，找到這兩個區塊並修改：

```json
"action": {
  "default_popup": "popup.html"
},
```

刪除 `icons` 整個區塊：
```json
刪除這段 →  "icons": {
              "16": "icon16.png",
              "48": "icon48.png",
              "128": "icon128.png"
            }
```

**選項 B：準備圖示檔案**

參考 `ICON_GUIDE.md` 生成三個尺寸的圖示。

### 步驟 3：載入到 Chrome

1. 開啟 Chrome 瀏覽器
2. 在網址列輸入：`chrome://extensions/`
3. 開啟右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇包含所有檔案的資料夾
6. 完成！🎉

### 步驟 4：測試功能

1. 開啟 [ChatGPT](https://chat.openai.com)
2. 點擊工具列上的 Extension 圖示（如果沒有圖示，會顯示 puzzle 🧩 圖示）
3. 在輸入框中新增一個測試提示詞：「請用繁體中文回答」
4. 點擊「儲存提示詞」
5. 點擊剛才新增的提示詞
6. 檢查 ChatGPT 輸入框是否有內容出現

### 步驟 5：匯入範例提示詞（選用）

1. 點擊 Extension 的「📥 匯入」按鈕
2. 選擇 `sample-prompts.json` 檔案
3. 選擇「合併」
4. 完成！現在你有 20 個常用提示詞了

## 🐛 遇到問題？

### 問題 1：找不到 Extension 圖示

**解決**：點擊工具列上的 puzzle 🧩 圖示，找到「ChatGPT Prompt 快捷庫」，點擊釘選 📌。

### 問題 2：點擊提示詞後沒反應

**解決**：
1. 確認你在 `chat.openai.com` 或 `chatgpt.com` 網站上
2. 重新整理 ChatGPT 頁面
3. 按 F12 開啟 Console，看看有沒有錯誤訊息

### 問題 3：載入 Extension 時出現錯誤

**解決**：
1. 確認所有檔案都在同一個資料夾
2. 確認 `manifest.json` 格式正確（沒有多餘的逗號）
3. 如果有圖示錯誤，參考「步驟 2 選項 A」移除圖示設定

## 📝 下一步

- 閱讀完整的 `README.md` 了解所有功能
- 自訂你自己的常用提示詞
- 使用「匯出」功能定期備份

---

**需要幫助？** 查看 `README.md` 的「疑難排解」章節。
