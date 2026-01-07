#!/bin/bash

# 76DollShop 內部公告系統啟動腳本

echo "========================================"
echo "76DollShop 內部公告與學習系統"
echo "========================================"
echo ""

# 設定 OpenSSL 環境變數（macOS with Homebrew）
if [ -d "/opt/homebrew/opt/openssl@3" ]; then
    export PKG_CONFIG_PATH="/opt/homebrew/opt/openssl@3/lib/pkgconfig"
    export LIBRARY_PATH="/opt/homebrew/opt/openssl@3/lib"
    echo "✅ 已設定 OpenSSL 環境變數"
elif [ -d "/usr/local/opt/openssl@3" ]; then
    export PKG_CONFIG_PATH="/usr/local/opt/openssl@3/lib/pkgconfig"
    export LIBRARY_PATH="/usr/local/opt/openssl@3/lib"
    echo "✅ 已設定 OpenSSL 環境變數"
fi

# 檢查是否安裝 D 語言編譯器 (dmd 或 ldc2)
if ! command -v dmd &> /dev/null && ! command -v ldc2 &> /dev/null; then
    echo "❌ 錯誤：未安裝 D 語言編譯器"
    echo "請執行：brew install dmd 或 brew install ldc"
    exit 1
fi

if command -v ldc2 &> /dev/null; then
    echo "✅ 使用 LDC 編譯器"
fi

# 檢查是否安裝 dub
if ! command -v dub &> /dev/null; then
    echo "❌ 錯誤：未安裝 DUB 套件管理工具"
    exit 1
fi

# 檢查 .env 檔案
if [ ! -f .env ]; then
    echo "⚠️  警告：未找到 .env 檔案"
    echo "正在從 .env.example 建立..."
    cp .env.example .env
    echo "✅ 已建立 .env 檔案"
    echo "⚠️  請編輯 .env 檔案並填入真實的 API 金鑰和設定"
    echo ""
    read -p "按 Enter 繼續或 Ctrl+C 取消..."
fi

# 載入環境變數
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "📦 建置專案..."
dub build

if [ $? -eq 0 ]; then
    echo "✅ 建置成功！"
    echo ""
    echo "🚀 啟動伺服器..."
    echo "訊問網址：http://localhost:${SERVER_PORT:-8080}"
    echo ""
    echo "按 Ctrl+C 停止伺服器"
    echo ""
    dub run
else
    echo "❌ 建置失敗，請檢查錯誤訊息"
    exit 1
fi
