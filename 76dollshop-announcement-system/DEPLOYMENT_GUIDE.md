# 🚀 76DollShop 系統部署指南

## 方案總覽

**推薦方案：Railway.app + Namecheap**
- 💰 總成本：約 $6-8 USD/月
- ⏱️ 部署時間：約 1 小時
- 👥 適合：5-20 人小團隊
- 🎯 難度：⭐⭐（簡單）

---

## 📝 部署步驟清單

### ✅ 準備工作
- [ ] 購買網域名稱
- [ ] 註冊 Railway.app 帳號
- [ ] 建立 GitHub Repository
- [ ] 準備信用卡（用於 Railway 付款）

---

## 第一步：購買網域名稱（10 分鐘）

### 選項 A：Namecheap（推薦）

1. **前往 Namecheap**
   ```
   https://www.namecheap.com/
   ```

2. **搜尋網域**
   - 輸入你想要的名稱，例如：`76dollshop`
   - 查看可用的後綴：`.com`, `.app`, `.xyz`

3. **價格參考**
   - `.com` - 首年 $0.99，續約 $13/年
   - `.app` - 首年 $1，續約 $15/年
   - `.xyz` - 首年 $1.16，續約 $13/年

4. **購買流程**
   - 加入購物車
   - 建立帳號
   - 選擇購買年限（建議 1 年）
   - 確認包含免費 WHOIS 隱私保護
   - 完成付款

5. **推薦網域名稱**
   ```
   76dollshop-team.com
   76doll-internal.app
   dollshop-system.com
   ```

### 選項 B：Cloudflare（最便宜）

1. 前往：https://dash.cloudflare.com/
2. 註冊帳號
3. 轉移或註冊網域
4. `.com` 約 $9.77/年（成本價，無加價）

---

## 第二步：建立 GitHub Repository（5 分鐘）

### 2-1. 初始化 Git

在終端機執行：

```bash
cd "/Users/bennettcheng/Desktop/vibe coding/76dollshop-announcement-system"

# 初始化 Git
git init

# 加入所有檔案（除了敏感資料）
git add .

# 建立第一個 commit
git commit -m "Initial commit: 76DollShop Internal System"
```

### 2-2. 在 GitHub 建立 Repository

1. 前往：https://github.com/new
2. 填寫資訊：
   - **Repository name**: `76dollshop-announcement-system`
   - **Description**: `76DollShop 內部公告與學習系統`
   - **Visibility**: `Private`（重要！保持私有）
3. 點擊「Create repository」

### 2-3. 推送到 GitHub

```bash
# 加入遠端 repository（替換成你的 GitHub 帳號）
git remote add origin https://github.com/你的帳號/76dollshop-announcement-system.git

# 推送
git branch -M main
git push -u origin main
```

---

## 第三步：部署到 Railway.app（20 分鐘）

### 3-1. 註冊 Railway

1. 前往：https://railway.app/
2. 點擊「Start a New Project」
3. 使用 GitHub 帳號登入
4. 授權 Railway 存取你的 GitHub

### 3-2. 建立新專案

1. 點擊「New Project」
2. 選擇「Deploy from GitHub repo」
3. 選擇 `76dollshop-announcement-system`
4. Railway 會自動偵測 Dockerfile 並開始部署

### 3-3. 設定環境變數

在 Railway 專案中：

1. 點擊你的服務
2. 切換到「Variables」分頁
3. 點擊「+ New Variable」
4. 一個一個加入以下變數：

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://你的網域.com/auth/callback
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
OPENAI_API_KEY=sk-your-openai-api-key
ALLOWED_EMAILS=user1@example.com,user2@example.com
SERVER_PORT=8080
SESSION_SECRET=your-random-secret-key
```

### 3-4. 上傳 Service Account 金鑰

**方法 A：使用 Railway Volumes（推薦）**

1. 在 Railway 專案中點擊「+ New」→「Volume」
2. 命名為 `service-account`
3. Mount Path: `/app/service-account-key.json`
4. 將 `service-account-key.json` 內容複製貼上

**方法 B：使用環境變數**

將 service-account-key.json 內容轉成 base64：

```bash
cat service-account-key.json | base64
```

在 Railway 加入變數：
```
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<base64內容>
```

然後修改程式在啟動時解碼（需要修改 source/app.d）

### 3-5. 取得 Railway 網址

1. 部署完成後，點擊「Settings」
2. 在「Domains」區塊，你會看到自動生成的網址：
   ```
   https://你的專案名稱.up.railway.app
   ```

3. 測試訪問這個網址，確認系統正常運作

---

## 第四步：連結自訂網域（10 分鐘）

### 4-1. 在 Railway 加入自訂網域

1. 在 Railway 專案的「Settings」→「Domains」
2. 點擊「+ Custom Domain」
3. 輸入你的網域：`76dollshop-team.com`
4. Railway 會提供 DNS 設定資訊

### 4-2. 在 Namecheap 設定 DNS

1. 登入 Namecheap
2. 找到你的網域 → 點擊「Manage」
3. 切換到「Advanced DNS」分頁
4. 加入以下記錄：

**A Record**:
```
Type: A Record
Host: @
Value: (Railway 提供的 IP)
TTL: Automatic
```

**CNAME Record (www)**:
```
Type: CNAME Record
Host: www
Value: (Railway 提供的網址)
TTL: Automatic
```

5. 儲存變更

### 4-3. 等待 DNS 生效（5-30 分鐘）

檢查是否生效：
```bash
dig 76dollshop-team.com
```

或訪問：https://dnschecker.org/

---

## 第五步：更新 Google OAuth 設定（5 分鐘）

### 5-1. 回到 Google Cloud Console

1. 前往：https://console.cloud.google.com/
2. 選擇你的專案：`dollshop-internal-system`
3. 進入「API 和服務」→「憑證」

### 5-2. 更新 OAuth 重新導向 URI

1. 點擊你的 OAuth 2.0 客戶端 ID
2. 在「已授權的重新導向 URI」加入：
   ```
   https://76dollshop-team.com/auth/callback
   https://你的專案名稱.up.railway.app/auth/callback
   ```
3. 點擊「儲存」

---

## 第六步：測試完整系統（10 分鐘）

### 6-1. 訪問網站

開啟瀏覽器，前往：
```
https://76dollshop-team.com
```

### 6-2. 測試功能

- [ ] Google 登入正常
- [ ] 可以建立公告
- [ ] Google Sheets 有資料寫入
- [ ] 閱讀簽到功能正常
- [ ] AI 測驗生成正常
- [ ] 測驗成績記錄正常

---

## 💰 費用總覽

| 項目 | 服務 | 費用 |
|------|------|------|
| 網域名稱 | Namecheap .com | $0.99 首年，$13/年續約 |
| 託管服務 | Railway.app | $5/月（含 $5 免費額度） |
| Google Cloud | OAuth + Sheets | 免費 |
| OpenAI API | ChatGPT API | 按使用量計費（約 $1-3/月）|
| **總計** | | **約 $6-8/月** |

---

## 🔧 維護與更新

### 更新程式碼

```bash
# 修改程式後
git add .
git commit -m "更新功能"
git push

# Railway 會自動重新部署
```

### 監控系統

1. Railway Dashboard：https://railway.app/dashboard
2. 查看 Logs：點擊專案 → 「Deployments」→ 「View Logs」

### 備份資料

定期備份 Google Sheets：
```
https://docs.google.com/spreadsheets/d/1dJqxNYt_pvFMfAHUljMoysToMJMz1myuVRoLRP9Wr9M/edit
檔案 → 下載 → Microsoft Excel (.xlsx)
```

---

## 🆘 常見問題

### Q: Railway 部署失敗？

**A**: 檢查以下項目：
1. Dockerfile 是否存在
2. 環境變數是否都設定正確
3. 查看 deployment logs 錯誤訊息

### Q: 無法登入？

**A**: 確認：
1. GOOGLE_REDIRECT_URI 設定正確
2. Google Cloud Console 的 OAuth URI 已更新
3. 你的 Email 在 ALLOWED_EMAILS 清單中

### Q: Google Sheets 無法寫入？

**A**: 確認：
1. Service Account 金鑰檔案已正確上傳
2. Service Account Email 有 Sheets 編輯權限
3. Python 套件已在 Dockerfile 中安裝

---

## 📞 技術支援

- Railway 文件：https://docs.railway.app/
- Namecheap 支援：https://www.namecheap.com/support/
- 專案問題：查看 GitHub Issues

---

**部署完成！🎉**

你的系統現在已經上線，團隊成員可以透過自訂網域訪問了！
