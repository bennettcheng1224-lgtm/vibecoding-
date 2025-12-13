// ==========================================
// ChatGPT Prompt 快捷庫 - Background Service Worker
// 處理 Extension 背景任務和訊息轉發
// ==========================================

console.log('🧠 ChatGPT Prompt 快捷庫 - Background Service Worker 已啟動');

// ==========================================
// Extension 安裝時執行
// ==========================================
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('✅ Extension 首次安裝');
    console.log('💡 提示：請開始新增你的常用提示詞！');

    // 註：Service Worker 無法直接存取 localStorage
    // localStorage 只能在 popup.js 中使用
    // 如需在 background 儲存資料，請使用 chrome.storage API

    // 開啟歡迎頁面（選用）
    // chrome.tabs.create({ url: 'https://github.com/your-repo/chatgpt-prompt-extension' });
  } else if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    console.log(`✅ Extension 已更新，從版本 ${previousVersion} 到最新版本`);
  }
});

// ==========================================
// 監聽來自 popup 或 content script 的訊息
// ==========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到訊息:', request, '來自:', sender);

  // 這裡可以處理需要背景執行的任務
  // 目前主要讓 popup 和 content script 直接溝通，所以這裡較少使用

  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
  }

  // 返回 true 表示會異步回應
  return true;
});

// ==========================================
// 監聽分頁更新（可用於偵測是否進入 ChatGPT 頁面）
// ==========================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 當頁面載入完成且是 ChatGPT 網站時
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com')) {
      console.log('✅ 偵測到 ChatGPT 頁面:', tab.url);

      // 可以在這裡注入額外的腳本或發送訊息
      // chrome.tabs.sendMessage(tabId, { action: 'chatgptDetected' });
    }
  }
});

// ==========================================
// 錯誤處理
// ==========================================
self.addEventListener('error', (event) => {
  console.error('Background script 錯誤:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('未處理的 Promise 拒絕:', event.reason);
});

console.log('🚀 Background Service Worker 初始化完成');
