# 圖示檔案說明

本 Extension 需要三個尺寸的圖示檔案：

- `icon16.png` - 16x16 像素
- `icon48.png` - 48x48 像素
- `icon128.png` - 128x128 像素

## 方法一：暫時移除圖示設定（快速測試）

如果你只是想快速測試 Extension，可以暫時移除圖示設定：

1. 開啟 `manifest.json`
2. 刪除或註解以下兩個區塊：

```json
// 刪除這個區塊
"action": {
  "default_popup": "popup.html",
  "default_icon": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
},

// 改成
"action": {
  "default_popup": "popup.html"
},

// 刪除這個區塊
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```

## 方法二：使用線上工具生成圖示

### 推薦工具

1. **Canva**（免費）
   - 網址：https://www.canva.com
   - 選擇「自訂尺寸」
   - 設計一個簡單的圖示（例如：🧠 emoji + 背景色）
   - 匯出為 PNG

2. **Figma**（免費）
   - 網址：https://www.figma.com
   - 建立新檔案，設定畫布尺寸
   - 設計圖示並匯出為 PNG

3. **Photopea**（免費線上 Photoshop）
   - 網址：https://www.photopea.com
   - 類似 Photoshop 的介面
   - 新增圖片，設定尺寸，匯出為 PNG

### 簡易圖示設計建議

- **背景色**：使用漸層或純色（例如：藍色、紫色）
- **圖案**：
  - 使用 🧠 emoji（大腦）
  - 或使用文字「GPT」
  - 或使用閃電 ⚡ 符號
- **簡潔為主**：圖示小，不要太複雜

## 方法三：使用命令列工具（進階）

如果你有安裝 ImageMagick，可以用命令列快速生成：

```bash
# 安裝 ImageMagick（macOS）
brew install imagemagick

# 生成簡單的圖示（藍色背景 + 白色文字）
convert -size 128x128 xc:#4A90E2 -gravity center -pointsize 60 -fill white -annotate +0+0 "GPT" icon128.png
convert -size 48x48 xc:#4A90E2 -gravity center -pointsize 24 -fill white -annotate +0+0 "GPT" icon48.png
convert -size 16x16 xc:#4A90E2 -gravity center -pointsize 10 -fill white -annotate +0+0 "G" icon16.png
```

## 方法四：從其他專案複製

可以從其他 Chrome Extension 專案中借用圖示（確認授權）。

## 方法五：直接使用 Emoji

最簡單的方式是在瀏覽器中截圖一個 emoji：

1. 開啟網頁：https://emojipedia.org/brain/
2. 截圖 🧠 emoji
3. 使用圖片編輯軟體調整尺寸為 16x16、48x48、128x128

---

**注意**：圖示檔案必須是 PNG 格式，放在專案根目錄。
