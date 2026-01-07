# 📋 Release Notes - 76DollShop 公告系統

## 🎉 Version 2.0.0 (2026-01-07)

### ✨ 新增功能

#### 團隊管理系統
- **Email 白名單團隊分配**
  - 管理員可在後台為每位員工指定所屬團隊
  - 支援團隊：業務團隊、行銷團隊、技術團隊、客服團隊、管理團隊、所有團隊
  - 團隊資訊以 🏢 圖示標示，清楚辨識

#### 目標團隊公告
- **發布公告時可指定目標團隊**
  - 支援多選：可同時選擇多個團隊
  - 彈性設定：不選擇團隊則對所有人可見
  - 視覺化呈現：公告卡片上顯示綠色團隊標籤

#### 進階篩選功能
- **團隊篩選**
  - 使用者可依團隊快速篩選相關公告
  - 未設定目標團隊的公告對所有人可見

- **已讀/未讀狀態篩選**（僅限一般使用者）
  - 三種狀態：全部、未讀、已讀
  - 快速找出尚未閱讀的重要公告
  - 管理員不受此限制，可查看所有公告

#### 人性化顯示
- **員工姓名顯示**
  - 已閱讀列表顯示員工姓名（而非 Email）
  - 測驗通過列表顯示員工姓名
  - 留言區顯示員工姓名
  - 若無姓名則回退顯示 Email

#### 留言系統優化
- **現代化留言介面**
  - 使用 Web GUI 取代瀏覽器原生提示框
  - 支援多行文字輸入
  - 優雅的彈出式視窗設計
  - ESC 鍵或點擊背景即可關閉

### 🔧 技術改進

#### 資料庫結構更新
- `announcements` 表新增 `target_teams` 欄位
- `read_statuses` 表新增 `user_name` 欄位
- `allowed_emails` 表新增 `team` 欄位

#### API 增強
- `POST /api/announcements` 支援 `targetTeams` 參數
- `POST /admin/api/allowed-emails` 支援 `team` 參數
- `POST /api/announcements/{id}/read` 自動填充 `user_name`
- `POST /api/announcements/{id}/quiz` 自動填充 `user_name`
- `POST /api/announcements/{id}/comments` 自動填充 `user_name`

#### 前端改進
- 客戶端即時篩選，反應迅速
- 多重篩選條件可同時運作
- 自動化事件監聽，使用體驗流暢

### 📦 資料庫遷移

提供自動化遷移腳本 `scripts/migrate_database.py`：
- 非破壞性更新，保留所有現有資料
- 自動回填現有記錄的員工姓名
- 錯誤處理完善，支援重複執行

執行方式：
```bash
python3 scripts/migrate_database.py
```

### 🎨 UI/UX 改進

#### 視覺元素
- 新增綠色團隊標籤 (🏢)，與藍色分類標籤形成對比
- 篩選區域重新排版，更直觀易用
- 留言彈窗採用現代化設計風格

#### 使用體驗
- 所有篩選器支援即時觸發
- 管理員與一般使用者介面差異化
- 表單驗證與錯誤提示更友善

---

## 📝 Version 1.0.0 (2026-01-06)

### 初始功能
- 公告發布與管理系統
- Google OAuth 2.0 登入
- Email 白名單管理
- 分類管理與篩選
- 已閱讀追蹤
- 學習測驗功能
- 留言討論功能
- Google Sheets 自動備份
- 管理員後台
- 響應式設計

---

## 🔄 升級指南

### 從 v1.0.0 升級到 v2.0.0

1. **備份資料庫**
   ```bash
   cp announcements.db announcements.db.backup
   ```

2. **執行資料庫遷移**
   ```bash
   python3 scripts/migrate_database.py
   ```

3. **重啟應用程式**
   ```bash
   # 如果使用 uvicorn
   pkill -f uvicorn
   PYTHONPATH=. uv run uvicorn app.main:app --reload --port 8080
   ```

4. **驗證升級**
   - 登入管理後台
   - 檢查 Email 白名單是否正常顯示
   - 測試發布新公告並選擇目標團隊
   - 測試團隊篩選功能
   - 測試已讀/未讀篩選功能

### 注意事項
- 現有公告會自動顯示給所有團隊（因 `target_teams` 為 NULL）
- 現有員工需要管理員手動分配團隊
- 舊的已閱讀記錄會自動回填員工姓名（如果 Email 在白名單中）

---

## 🐛 已知問題

目前版本無已知嚴重問題。

如發現任何問題，請回報至專案維護人員。

---

## 📚 相關文件

- [快速開始指南](QUICK_START.md)
- [設定指南](SETUP_GUIDE.md)
- [專案架構](PROJECT_STRUCTURE.txt)
- [專案總覽](PROJECT_SUMMARY.md)
- [檢查清單](CHECKLIST.md)

---

## 👥 貢獻者

- Bennett Cheng - 系統架構與開發
- Claude AI - 程式開發協助

---

## 📄 授權

本專案為 76DollShop 內部使用系統。

---

**發布日期：** 2026年1月7日
**版本號：** v2.0.0
**代號：** Team Edition
