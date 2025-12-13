// ==========================================
// ChatGPT Prompt 快捷庫 - Content Script
// 注入到 ChatGPT 頁面，負責插入提示詞
// ==========================================

console.log('🧠 ChatGPT Prompt 快捷庫已載入');

// ==========================================
// 監聽來自 popup 的訊息
// ==========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到訊息:', request);

  if (request.action === 'insertPrompt') {
    const success = insertPromptToTextarea(request.prompt);
    sendResponse({ success: success });
  }

  // 必須返回 true 以保持訊息通道開啟（異步回應）
  return true;
});

// ==========================================
// 插入提示詞到 ChatGPT 輸入框
// ==========================================
function insertPromptToTextarea(promptText) {
  try {
    // ChatGPT 的輸入框選擇器（可能會隨著版本更新而變化）
    // 這裡列出多個可能的選擇器
    const possibleSelectors = [
      '#prompt-textarea',                    // 常見的 ID
      'textarea[placeholder*="Message"]',    // 包含 "Message" 的 placeholder
      'textarea[data-id="root"]',            // 有 data-id 屬性的
      'textarea.m-0',                        // ChatGPT 常用的 class
      'div[contenteditable="true"]',         // contenteditable div
      'textarea',                            // 最後才用通用的 textarea
    ];

    let textarea = null;

    // 嘗試每個選擇器
    for (const selector of possibleSelectors) {
      textarea = document.querySelector(selector);
      if (textarea) {
        console.log('找到輸入框:', selector);
        break;
      }
    }

    // 如果找不到輸入框
    if (!textarea) {
      console.error('找不到 ChatGPT 輸入框');
      return false;
    }

    // 根據元素類型插入內容
    if (textarea.tagName === 'TEXTAREA') {
      // 如果是 textarea 元素
      insertToTextarea(textarea, promptText);
    } else if (textarea.contentEditable === 'true') {
      // 如果是 contenteditable div
      insertToContentEditable(textarea, promptText);
    }

    // 觸發輸入事件，讓 ChatGPT 偵測到內容變化
    triggerInputEvents(textarea);

    // 聚焦到輸入框
    textarea.focus();

    console.log('✅ 提示詞已插入:', promptText.substring(0, 50) + '...');
    return true;

  } catch (error) {
    console.error('插入提示詞時發生錯誤:', error);
    return false;
  }
}

// ==========================================
// 插入內容到 textarea 元素
// ==========================================
function insertToTextarea(textarea, text) {
  // 方法 1: 直接設定 value
  textarea.value = text;

  // 方法 2: 使用 setRangeText（更符合原生行為）
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  textarea.setRangeText(text, start, end, 'end');

  // 移動游標到最後
  textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
}

// ==========================================
// 插入內容到 contenteditable 元素
// ==========================================
function insertToContentEditable(element, text) {
  // 清空現有內容
  element.innerHTML = '';

  // 建立文字節點
  const textNode = document.createTextNode(text);
  element.appendChild(textNode);

  // 設定游標到最後
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false); // false = 移到最後
  selection.removeAllRanges();
  selection.addRange(range);
}

// ==========================================
// 觸發輸入事件，讓 React/Vue 等框架偵測到變化
// ==========================================
function triggerInputEvents(element) {
  // 觸發多種事件，確保各種框架都能偵測到
  const events = [
    new Event('input', { bubbles: true, cancelable: true }),
    new Event('change', { bubbles: true, cancelable: true }),
    new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }),
    new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter' }),
    new InputEvent('input', { bubbles: true, cancelable: true }),
  ];

  events.forEach(event => {
    element.dispatchEvent(event);
  });

  // 特殊處理：觸發 React 的內部事件
  try {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    ).set;

    const nativeInputValueSetterDiv = Object.getOwnPropertyDescriptor(
      window.HTMLDivElement.prototype,
      'textContent'
    ).set;

    if (element.tagName === 'TEXTAREA' && nativeInputValueSetter) {
      nativeInputValueSetter.call(element, element.value);
    } else if (nativeInputValueSetterDiv) {
      nativeInputValueSetterDiv.call(element, element.textContent);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
  } catch (err) {
    console.log('React 事件觸發失敗（這是正常的）:', err);
  }
}

// ==========================================
// 監聽 DOM 變化（如果頁面動態載入輸入框）
// ==========================================
const observer = new MutationObserver((mutations) => {
  // 這裡可以監聽 DOM 變化，確保輸入框載入後再執行操作
  // 目前先不實作，因為大部分情況下輸入框會在頁面載入時就存在
});

// 開始監聽
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// ==========================================
// 提供一個測試函數（可在 console 中手動呼叫）
// ==========================================
window.testPromptInsertion = function(text) {
  console.log('測試插入:', text);
  insertPromptToTextarea(text || '這是一個測試提示詞');
};

console.log('💡 提示：可以在 console 輸入 testPromptInsertion("測試文字") 來測試功能');
