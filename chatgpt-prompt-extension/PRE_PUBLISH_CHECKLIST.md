# ✅ 發佈前檢查清單

使用此清單確保 Extension 已準備好發佈到 Chrome Web Store。

## 📋 必備項目

### 1. 核心檔案
- [x] `manifest.json` - Extension 設定檔
- [x] `popup.html` - Popup 介面
- [x] `popup.js` - Popup 邏輯
- [x] `content.js` - 內容腳本
- [x] `background.js` - 背景服務

### 2. 圖示檔案（必須！）
- [ ] `icon16.png` - 16x16 像素
- [ ] `icon48.png` - 48x48 像素
- [ ] `icon128.png` - 128x128 像素

**提示**：參考 `ICON_GUIDE.md` 製作圖示

### 3. 商店素材
- [ ] 商店圖示 (128x128) - 與 icon128.png 相同即可
- [ ] 至少 1 張截圖 (1280x800 或 640x400)
- [ ] 宣傳圖片 (440x280) - 選用但建議

### 4. 文字內容
- [ ] Extension 名稱（中文或英文）
- [ ] 簡短描述（132 字元以內）
- [ ] 詳細描述（參考 PUBLISH_GUIDE.md）
- [ ] 權限說明
- [ ] 隱私權政策（已提供 PRIVACY.md）

## 🧪 功能測試

### 基本功能
- [ ] 可以新增提示詞
- [ ] 可以刪除提示詞
- [ ] 可以點擊提示詞插入到 ChatGPT
- [ ] Popup 會在插入後自動關閉
- [ ] 匯出功能正常運作
- [ ] 匯入功能正常運作

### 網站相容性
- [ ] 在 chat.openai.com 測試正常
- [ ] 在 chatgpt.com 測試正常
- [ ] 重新整理頁面後仍可使用
- [ ] 提示詞正確插入到輸入框

### 資料持久性
- [ ] 關閉瀏覽器後資料仍存在
- [ ] 重新載入 Extension 後資料仍存在
- [ ] 匯出的 JSON 格式正確
- [ ] 匯入 JSON 可以正確載入

### 錯誤處理
- [ ] 新增空白提示詞會顯示警告
- [ ] 新增重複提示詞會顯示警告
- [ ] 不在 ChatGPT 網站點擊提示詞會顯示提示
- [ ] 匯入錯誤格式的 JSON 會顯示錯誤

## 📦 打包準備

### 檔案清理
- [ ] 移除所有測試檔案
- [ ] 移除 .DS_Store
- [ ] 移除 .git 資料夾（如果有）
- [ ] 移除開發用的說明檔案（不需要打包進去）

### manifest.json 檢查
- [ ] 版本號正確（例如：1.0.0）
- [ ] 名稱和描述正確
- [ ] 圖示路徑正確（已加回 icons 設定）
- [ ] 權限設定正確
- [ ] 網域設定正確

### 快速打包（使用腳本）

```bash
cd "/Users/bennettcheng/Desktop/vibe coding/chatgpt-prompt-extension"
./package.sh
```

或手動打包：

```bash
zip -r chatgpt-prompt-extension.zip . \
  -x "*.DS_Store" \
  -x "*.git*" \
  -x "README.md" \
  -x "PUBLISH_GUIDE.md" \
  -x "ICON_GUIDE.md" \
  -x "QUICK_START.md" \
  -x "PRIVACY.md" \
  -x "sample-prompts.json" \
  -x ".gitignore" \
  -x "package.sh" \
  -x "PRE_PUBLISH_CHECKLIST.md"
```

## 🌐 Chrome Web Store 準備

### 開發者帳號
- [ ] 已註冊 Chrome Web Store 開發者帳號
- [ ] 已支付 $5 USD 註冊費用
- [ ] 已填寫開發者資訊

### 上傳資訊
- [ ] ZIP 檔案已準備好
- [ ] 商店描述已撰寫（中文/英文）
- [ ] 圖示和截圖已準備
- [ ] 隱私權政策已準備

### 發佈設定
- [ ] 選擇發佈範圍（建議：公開）
- [ ] 選擇發佈區域（建議：所有地區）
- [ ] 選擇分類（建議：生產力工具）
- [ ] 設定語言（繁體中文或英文）

## 📸 截圖建議

建議準備以下截圖（按順序）：

1. **Popup 主介面**
   - 顯示提示詞列表
   - 顯示新增提示詞區塊

2. **新增提示詞**
   - 展示如何新增提示詞

3. **在 ChatGPT 使用**
   - 顯示點擊後插入到 ChatGPT 的效果

4. **匯出/匯入功能**
   - 展示備份功能

5. **實際使用情境**
   - 完整的使用流程

## 🎨 圖示設計建議

如果還沒有圖示，快速製作建議：

### 方案 1：簡單文字圖示
- 背景：藍色漸層 (#4A90E2 → #5580E8)
- 文字：白色 "GPT" 或 "P"（Prompt 的縮寫）
- 風格：圓角矩形或圓形

### 方案 2：Emoji 圖示
- 使用 🧠（大腦）emoji
- 背景：深色或透明
- 加上邊框或陰影

### 方案 3：圖形圖示
- 對話框 + 閃電符號
- 或文件 + 星星符號
- 簡潔、易辨識

### 製作工具
- **Canva**：https://www.canva.com （推薦，最簡單）
- **Figma**：https://www.figma.com
- **Photopea**：https://www.photopea.com （線上 Photoshop）

## 🚀 發佈流程

1. [ ] 完成上述所有檢查項目
2. [ ] 打包 Extension（使用 package.sh）
3. [ ] 前往 https://chrome.google.com/webstore/devconsole
4. [ ] 點擊「新增項目」
5. [ ] 上傳 ZIP 檔案
6. [ ] 填寫所有商店資訊
7. [ ] 上傳圖示和截圖
8. [ ] 填寫權限說明
9. [ ] 預覽並檢查
10. [ ] 提交審核
11. [ ] 等待 1-3 個工作天
12. [ ] 審核通過後自動發佈

## 📝 最後確認

發佈前最後檢查：

- [ ] 所有功能都經過測試
- [ ] 沒有 console 錯誤
- [ ] 圖示顯示正常
- [ ] 截圖品質良好
- [ ] 描述文字沒有錯字
- [ ] 版本號正確
- [ ] 聯絡資訊正確
- [ ] 隱私權政策完整

## 🎉 完成！

當所有項目都打勾後，你就可以提交到 Chrome Web Store 了！

祝你發佈順利！🚀

---

**需要幫助？**
- 參考 `PUBLISH_GUIDE.md` 取得詳細說明
- 參考 `ICON_GUIDE.md` 製作圖示
- 參考 `PRIVACY.md` 了解隱私權政策

**聯絡資訊**
- GitHub Issues
- Email: [您的 email]
