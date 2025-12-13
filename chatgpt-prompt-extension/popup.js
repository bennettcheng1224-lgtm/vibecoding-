// ==========================================
// ChatGPT Prompt 快捷庫 v2.0 - Popup 邏輯
// 支援標題、分類和搜尋功能
// ==========================================

// 儲存提示詞的 localStorage 鍵值
const STORAGE_KEY = 'chatgpt_prompts';
const STORAGE_VERSION_KEY = 'chatgpt_prompts_version';
const CURRENT_VERSION = '2.0';

// DOM 元素
const newPromptTitle = document.getElementById('newPromptTitle');
const newPromptCategory = document.getElementById('newPromptCategory');
const newPromptContent = document.getElementById('newPromptContent');
const categoryDatalist = document.getElementById('categoryDatalist');
const addPromptBtn = document.getElementById('addPromptBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const promptList = document.getElementById('promptList');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');

// 狀態
let collapsedCategories = new Set(); // 記錄哪些分類是折疊的

// ==========================================
// 初始化：頁面載入時執行
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  migrateOldData(); // 遷移舊版本資料
  renderPrompts(); // 渲染所有提示詞
  updateCategoryDatalist(); // 更新分類選項
  updateCategoryFilter(); // 更新分類篩選器
  setupEventListeners(); // 設定事件監聽器
});

// ==========================================
// 設定所有事件監聽器
// ==========================================
function setupEventListeners() {
  // 新增提示詞按鈕
  addPromptBtn.addEventListener('click', addPrompt);

  // Enter 鍵快速新增（在內容框按 Ctrl+Enter）
  newPromptContent.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      addPrompt();
    }
  });

  // 搜尋輸入
  searchInput.addEventListener('input', renderPrompts);

  // 分類篩選
  categoryFilter.addEventListener('change', renderPrompts);

  // 匯出按鈕
  exportBtn.addEventListener('click', exportPrompts);

  // 匯入按鈕
  importBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  // 匯入檔案選擇
  importFileInput.addEventListener('change', importPrompts);
}

// ==========================================
// 資料遷移：從舊版本遷移到新版本
// ==========================================
function migrateOldData() {
  const version = localStorage.getItem(STORAGE_VERSION_KEY);

  // 如果是第一次使用新版本
  if (!version || version !== CURRENT_VERSION) {
    const oldData = localStorage.getItem(STORAGE_KEY);

    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);

        // 如果是舊版本的字串陣列格式
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          console.log('偵測到舊版本資料，開始遷移...');

          // 轉換成新格式
          const newData = parsed.map((content, index) => ({
            id: generateId(),
            title: `提示詞 ${index + 1}`, // 自動生成標題
            content: content,
            category: '未分類', // 預設分類
            createdAt: Date.now() - (parsed.length - index) * 1000 // 模擬建立時間
          }));

          savePrompts(newData);
          localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);

          showToast('✅ 已自動升級到新版本！');
          console.log('資料遷移完成');
        }
      } catch (error) {
        console.error('資料遷移失敗:', error);
      }
    } else {
      // 沒有舊資料，直接設定版本號
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    }
  }
}

// ==========================================
// 生成唯一 ID
// ==========================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==========================================
// 從 localStorage 取得所有提示詞
// ==========================================
function getPrompts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const prompts = JSON.parse(stored);
    // 確保是新格式的物件陣列
    if (Array.isArray(prompts) && prompts.length > 0 && typeof prompts[0] === 'object') {
      return prompts;
    }
    return [];
  } catch (error) {
    console.error('讀取提示詞失敗:', error);
    return [];
  }
}

// ==========================================
// 儲存提示詞到 localStorage
// ==========================================
function savePrompts(prompts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

// ==========================================
// 更新分類下拉選項（datalist）
// ==========================================
function updateCategoryDatalist() {
  const prompts = getPrompts();
  const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))];

  categoryDatalist.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    categoryDatalist.appendChild(option);
  });
}

// ==========================================
// 更新分類篩選器（select）
// ==========================================
function updateCategoryFilter() {
  const prompts = getPrompts();
  const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))].sort();

  // 保留目前選擇的值
  const currentValue = categoryFilter.value;

  // 清空並重建選項
  categoryFilter.innerHTML = '<option value="">🏷️ 所有分類</option>';

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // 恢復選擇
  if (currentValue && categories.includes(currentValue)) {
    categoryFilter.value = currentValue;
  }
}

// ==========================================
// 新增提示詞
// ==========================================
function addPrompt() {
  const title = newPromptTitle.value.trim();
  const content = newPromptContent.value.trim();
  const category = newPromptCategory.value.trim() || '未分類';

  // 檢查必填欄位
  if (!title) {
    alert('⚠️ 請輸入標題！');
    newPromptTitle.focus();
    return;
  }

  if (!content) {
    alert('⚠️ 請輸入內容！');
    newPromptContent.focus();
    return;
  }

  // 取得現有提示詞
  const prompts = getPrompts();

  // 檢查是否有重複的標題
  if (prompts.some(p => p.title === title)) {
    const confirm = window.confirm('⚠️ 已有相同標題的提示詞，是否仍要新增？');
    if (!confirm) return;
  }

  // 建立新提示詞
  const newPrompt = {
    id: generateId(),
    title: title,
    content: content,
    category: category,
    createdAt: Date.now()
  };

  // 新增到陣列（最新的在最前面）
  prompts.unshift(newPrompt);
  savePrompts(prompts);

  // 清空輸入框
  newPromptTitle.value = '';
  newPromptContent.value = '';
  newPromptCategory.value = '';

  // 重新渲染
  updateCategoryDatalist();
  updateCategoryFilter();
  renderPrompts();

  // 顯示成功訊息
  showToast('✅ 提示詞已儲存！');

  // 聚焦到標題輸入框，方便連續新增
  newPromptTitle.focus();
}

// ==========================================
// 刪除提示詞
// ==========================================
function deletePrompt(id) {
  const prompts = getPrompts();
  const prompt = prompts.find(p => p.id === id);

  if (!confirm(`確定要刪除「${prompt.title}」嗎？`)) {
    return;
  }

  const filtered = prompts.filter(p => p.id !== id);
  savePrompts(filtered);

  updateCategoryDatalist();
  updateCategoryFilter();
  renderPrompts();

  showToast('🗑️ 提示詞已刪除！');
}

// ==========================================
// 渲染提示詞列表（按分類分組）
// ==========================================
function renderPrompts() {
  let prompts = getPrompts();

  // 搜尋過濾
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    prompts = prompts.filter(p =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.content.toLowerCase().includes(searchTerm) ||
      (p.category && p.category.toLowerCase().includes(searchTerm))
    );
  }

  // 分類過濾
  const selectedCategory = categoryFilter.value;
  if (selectedCategory) {
    prompts = prompts.filter(p => p.category === selectedCategory);
  }

  // 如果沒有提示詞
  if (prompts.length === 0) {
    const message = searchTerm || selectedCategory
      ? '🔍 找不到符合條件的提示詞'
      : '📭 目前沒有儲存任何提示詞<br><small>請在上方新增你的常用提示詞</small>';

    promptList.innerHTML = `<div class="empty-message">${message}</div>`;
    return;
  }

  // 按分類分組
  const groupedByCategory = {};
  prompts.forEach(prompt => {
    const cat = prompt.category || '未分類';
    if (!groupedByCategory[cat]) {
      groupedByCategory[cat] = [];
    }
    groupedByCategory[cat].push(prompt);
  });

  // 排序分類（按字母順序）
  const sortedCategories = Object.keys(groupedByCategory).sort();

  // 清空列表
  promptList.innerHTML = '';

  // 渲染每個分類
  sortedCategories.forEach(category => {
    const categoryPrompts = groupedByCategory[category];
    const isCollapsed = collapsedCategories.has(category);

    // 建立分類群組
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'category-group';

    // 分類標題
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `
      <span class="category-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
      <span class="category-name">${category}</span>
      <span class="category-count">${categoryPrompts.length}</span>
    `;

    // 點擊分類標題切換展開/折疊
    categoryHeader.addEventListener('click', () => {
      if (collapsedCategories.has(category)) {
        collapsedCategories.delete(category);
      } else {
        collapsedCategories.add(category);
      }
      renderPrompts();
    });

    // 分類內容
    const categoryItems = document.createElement('div');
    categoryItems.className = `category-items ${isCollapsed ? 'collapsed' : ''}`;

    // 渲染每個提示詞
    categoryPrompts.forEach(prompt => {
      const item = createPromptItem(prompt);
      categoryItems.appendChild(item);
    });

    categoryGroup.appendChild(categoryHeader);
    categoryGroup.appendChild(categoryItems);
    promptList.appendChild(categoryGroup);
  });
}

// ==========================================
// 建立單個提示詞項目
// ==========================================
function createPromptItem(prompt) {
  const item = document.createElement('div');
  item.className = 'prompt-item';
  item.dataset.id = prompt.id;

  // 標題和刪除按鈕
  const header = document.createElement('div');
  header.className = 'prompt-header';

  const title = document.createElement('div');
  title.className = 'prompt-title';
  title.textContent = prompt.title;
  title.title = '點擊插入到 ChatGPT';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = '刪除此提示詞';

  header.appendChild(title);
  header.appendChild(deleteBtn);

  // 內容
  const content = document.createElement('div');
  content.className = 'prompt-content';
  content.textContent = prompt.content;

  // 點擊標題或內容插入提示詞
  title.addEventListener('click', () => insertPromptToChatGPT(prompt.content));
  content.addEventListener('click', () => insertPromptToChatGPT(prompt.content));

  // 點擊刪除按鈕
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deletePrompt(prompt.id);
  });

  item.appendChild(header);
  item.appendChild(content);

  return item;
}

// ==========================================
// 插入提示詞到 ChatGPT 輸入框
// ==========================================
async function insertPromptToChatGPT(promptText) {
  try {
    // 取得當前活動的分頁
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 檢查是否在 ChatGPT 網站
    if (!tab.url.includes('chat.openai.com') && !tab.url.includes('chatgpt.com')) {
      alert('⚠️ 請在 ChatGPT 網站上使用此功能！');
      return;
    }

    // 傳送訊息到 content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'insertPrompt',
      prompt: promptText
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('傳送訊息錯誤:', chrome.runtime.lastError);
        alert('❌ 無法插入提示詞，請重新整理 ChatGPT 頁面後再試。');
        return;
      }

      if (response && response.success) {
        showToast('✅ 已插入提示詞！');
        // 關閉 popup
        setTimeout(() => window.close(), 500);
      } else {
        alert('❌ 插入失敗，請確認 ChatGPT 頁面已完全載入。');
      }
    });
  } catch (error) {
    console.error('插入提示詞時發生錯誤:', error);
    alert('❌ 發生錯誤，請稍後再試。');
  }
}

// ==========================================
// 匯出提示詞為 JSON 檔案
// ==========================================
function exportPrompts() {
  const prompts = getPrompts();

  if (prompts.length === 0) {
    alert('⚠️ 目前沒有提示詞可以匯出！');
    return;
  }

  // 建立 JSON 資料
  const exportData = {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    prompts: prompts
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  // 建立下載連結
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chatgpt-prompts-v2-${new Date().toISOString().split('T')[0]}.json`;

  // 觸發下載
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 釋放 URL
  URL.revokeObjectURL(url);

  showToast(`📤 已匯出 ${prompts.length} 個提示詞！`);
}

// ==========================================
// 匯入提示詞從 JSON 檔案
// ==========================================
function importPrompts(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // 檢查檔案類型
  if (!file.name.endsWith('.json')) {
    alert('⚠️ 請選擇 JSON 檔案！');
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      let importedPrompts = [];

      // 支援新舊版本格式
      if (imported.version && imported.prompts) {
        // 新版本格式
        importedPrompts = imported.prompts;
      } else if (Array.isArray(imported)) {
        if (imported.length > 0 && typeof imported[0] === 'object' && imported[0].id) {
          // 新版本格式（直接是陣列）
          importedPrompts = imported;
        } else if (imported.length > 0 && typeof imported[0] === 'string') {
          // 舊版本格式（字串陣列）
          importedPrompts = imported.map((content, index) => ({
            id: generateId(),
            title: `匯入的提示詞 ${index + 1}`,
            content: content,
            category: '匯入',
            createdAt: Date.now()
          }));
        }
      }

      if (importedPrompts.length === 0) {
        throw new Error('找不到有效的提示詞資料');
      }

      // 詢問是否要覆蓋或合併
      const currentPrompts = getPrompts();
      let finalPrompts = [];

      if (currentPrompts.length > 0) {
        const choice = confirm(
          `偵測到 ${importedPrompts.length} 個提示詞\n\n` +
          '✅ 確定 = 合併（保留現有 + 新增匯入）\n' +
          '❌ 取消 = 覆蓋（只保留匯入的）'
        );

        if (choice) {
          // 合併（避免 ID 重複）
          const existingIds = new Set(currentPrompts.map(p => p.id));
          importedPrompts.forEach(p => {
            if (existingIds.has(p.id)) {
              p.id = generateId(); // 重新生成 ID
            }
          });
          finalPrompts = [...currentPrompts, ...importedPrompts];
        } else {
          finalPrompts = importedPrompts;
        }
      } else {
        finalPrompts = importedPrompts;
      }

      // 儲存並重新渲染
      savePrompts(finalPrompts);
      updateCategoryDatalist();
      updateCategoryFilter();
      renderPrompts();

      showToast(`📥 成功匯入 ${importedPrompts.length} 個提示詞！`);

    } catch (error) {
      console.error('匯入錯誤:', error);
      alert(`❌ 匯入失敗！\n\n錯誤訊息：${error.message}\n\n請確認 JSON 檔案格式正確。`);
    }
  };

  reader.readAsText(file);

  // 清空 input，允許重複選擇同一檔案
  event.target.value = '';
}

// ==========================================
// 顯示臨時提示訊息
// ==========================================
function showToast(message) {
  // 建立 toast 元素
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 10000;
    animation: fadeInOut 2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;

  document.body.appendChild(toast);

  // 2.5 秒後移除
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// 新增 CSS 動畫
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  }
`;
document.head.appendChild(style);
