# 使用官方 D 語言映像檔
FROM dlang2/ldc-ubuntu:latest

# 安裝必要套件
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 安裝 Python 依賴
RUN pip3 install --no-cache-dir \
    google-auth \
    google-auth-oauthlib \
    google-auth-httplib2 \
    google-api-python-client

# 設定工作目錄
WORKDIR /app

# 複製專案檔案
COPY . .

# 編譯專案
RUN dub build --build=release

# 暴露端口
EXPOSE 8080

# 啟動應用
CMD ["./76dollshop-announcement-system"]
