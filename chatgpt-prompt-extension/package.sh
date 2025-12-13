#!/bin/bash

# ==========================================
# ChatGPT Prompt Extension 打包腳本
# ==========================================

echo "🚀 開始打包 Chrome Extension..."

# 設定變數
EXTENSION_NAME="chatgpt-prompt-extension"
OUTPUT_FILE="${EXTENSION_NAME}.zip"
EXCLUDE_FILES=(
  "*.DS_Store"
  "*.git*"
  "README.md"
  "PUBLISH_GUIDE.md"
  "ICON_GUIDE.md"
  "QUICK_START.md"
  "PRIVACY.md"
  "sample-prompts.json"
  ".gitignore"
  "package.sh"
  "${OUTPUT_FILE}"
)

# 刪除舊的 ZIP 檔案
if [ -f "$OUTPUT_FILE" ]; then
  echo "🗑️  刪除舊的 ZIP 檔案..."
  rm "$OUTPUT_FILE"
fi

# 建立排除參數
EXCLUDE_ARGS=""
for file in "${EXCLUDE_FILES[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS -x $file"
done

# 打包
echo "📦 打包中..."
zip -r "$OUTPUT_FILE" . $EXCLUDE_ARGS

# 檢查是否成功
if [ -f "$OUTPUT_FILE" ]; then
  FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
  echo "✅ 打包完成！"
  echo "📄 檔案：$OUTPUT_FILE"
  echo "📊 大小：$FILE_SIZE"
  echo ""
  echo "🎯 下一步："
  echo "1. 前往 https://chrome.google.com/webstore/devconsole"
  echo "2. 點擊「新增項目」"
  echo "3. 上傳 $OUTPUT_FILE"
  echo ""
  echo "📝 記得先準備好圖示檔案："
  echo "   - icon16.png"
  echo "   - icon48.png"
  echo "   - icon128.png"
else
  echo "❌ 打包失敗！"
  exit 1
fi
