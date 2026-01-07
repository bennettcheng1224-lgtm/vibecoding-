// ============================================================================
// 全域變數
// ============================================================================

let currentAnnouncements = [];
let currentQuiz = null;
let currentAnnouncementId = null;
let userAnswers = [];
let currentUserEmail = ''; // 儲存當前使用者 Email
let isAdmin = false; // 是否為管理員
let currentUserName = ''; // 儲存測驗者姓名

// 預設分類列表（可動態管理）
let defaultCategories = [
    '新品資訊',
    '行政通知',
    '維護保養',
    '學習教材',
    '其他'
];

// 從 localStorage 載入分類
function loadCategories() {
    const saved = localStorage.getItem('categoryOptions');
    if (saved) {
        try {
            defaultCategories = JSON.parse(saved);
        } catch (e) {
            console.error('載入分類失敗:', e);
        }
    }
}

// 儲存分類到 localStorage
function saveCategories() {
    localStorage.setItem('categoryOptions', JSON.stringify(defaultCategories));
}

// ============================================================================
// DOM 載入完成後執行
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 從頁面取得使用者資訊
    const userEmailElement = document.querySelector('.user-info span');
    if (userEmailElement) {
        // 嘗試多種方式提取 email
        let emailText = userEmailElement.textContent;

        // 方法1: 匹配 email 格式
        const emailMatch = emailText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        if (emailMatch) {
            currentUserEmail = emailMatch[0].trim();
        } else {
            // 方法2: 移除 "歡迎，" 等前綴
            currentUserEmail = emailText.replace(/^歡迎[,，\s]*/, '').trim();
        }

        // 檢查是否為管理員
        isAdmin = (currentUserEmail === 'bennettcheng1224@gmail.com');

        console.log('Current User Email:', currentUserEmail);
        console.log('Is Admin:', isAdmin);
    }

    // 載入分類選項
    loadCategories();
    renderCategoryOptions();

    // 載入公告
    loadAnnouncements();

    // 綁定事件監聽器
    bindEventListeners();
}

// ============================================================================
// 事件監聽器
// ============================================================================

function bindEventListeners() {
    // 發布公告表單
    const createForm = document.getElementById('create-form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateAnnouncement);
    }

    // 加入預設分類按鈕
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', handleAddCategory);
    }

    // 搜尋按鈕
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Enter 鍵搜尋
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // 分類篩選
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleSearch);
    }

    // 關閉測驗 Modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', closeQuizModal);
    }

    // 點擊測驗 Modal 外部關閉
    const modal = document.getElementById('quiz-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeQuizModal();
            }
        });
    }

    // 關閉公告詳細 Modal
    const closeDetailModal = document.querySelector('.close-detail-modal');
    if (closeDetailModal) {
        closeDetailModal.addEventListener('click', closeAnnouncementDetailModal);
    }

    // 點擊公告詳細 Modal 外部關閉
    const detailModal = document.getElementById('announcement-detail-modal');
    if (detailModal) {
        detailModal.addEventListener('click', function(e) {
            if (e.target === detailModal) {
                closeAnnouncementDetailModal();
            }
        });
    }
}

// ============================================================================
// 分類選項管理
// ============================================================================

function renderCategoryOptions() {
    const container = document.getElementById('category-checkboxes');
    if (!container) return;

    container.innerHTML = '';

    defaultCategories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'category-option-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'category';
        checkbox.value = category;

        const span = document.createElement('span');
        span.textContent = category;

        label.appendChild(checkbox);
        label.appendChild(span);

        // 只有 admin 可以看到刪除按鈕
        if (isAdmin) {
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'category-option-delete';
            deleteBtn.textContent = '×';
            deleteBtn.title = '刪除此分類選項';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleRemoveCategory(category);
            });
            label.appendChild(deleteBtn);
        }

        container.appendChild(label);
    });

    // 同時更新篩選器
    updateCategoryFilter();
}

function handleAddCategory() {
    const input = document.getElementById('custom-category');
    const newCategory = input.value.trim();

    if (!newCategory) {
        showError('請輸入分類名稱');
        return;
    }

    if (defaultCategories.includes(newCategory)) {
        showError('此分類已存在');
        return;
    }

    defaultCategories.push(newCategory);
    saveCategories();
    renderCategoryOptions();
    input.value = '';
    showSuccess(`分類「${newCategory}」已加入預設選項`);
}

function handleRemoveCategory(category) {
    if (!confirm(`確定要刪除分類選項「${category}」嗎？\n刪除後，此選項將不再出現在預設清單中。`)) {
        return;
    }

    const index = defaultCategories.indexOf(category);
    if (index > -1) {
        defaultCategories.splice(index, 1);
        saveCategories();
        renderCategoryOptions();
        showSuccess(`分類「${category}」已刪除`);
    }
}

function updateCategoryFilter() {
    const filter = document.getElementById('category-filter');
    if (!filter) return;

    // 保存當前選擇的值
    const currentValue = filter.value;

    // 清空並重建選項
    filter.innerHTML = '<option value="">全部分類</option>';

    // 收集所有已使用的分類（從公告中）
    const usedCategories = new Set();
    currentAnnouncements.forEach(ann => {
        if (ann.categories) {
            ann.categories.forEach(cat => usedCategories.add(cat));
        }
    });

    // 合併預設分類和已使用的分類
    const allCategories = new Set([...defaultCategories, ...usedCategories]);

    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });

    // 恢復之前的選擇
    if (currentValue && allCategories.has(currentValue)) {
        filter.value = currentValue;
    }
}

// ============================================================================
// 載入公告
// ============================================================================

async function loadAnnouncements(category = '', search = '') {
    try {
        let url = '/api/announcements';
        const params = new URLSearchParams();

        if (category) params.append('category', category);
        if (search) params.append('search', search);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        const announcements = await response.json();

        currentAnnouncements = announcements;
        renderAnnouncements(announcements);
    } catch (error) {
        console.error('載入公告失敗:', error);
        showError('載入公告失敗，請重新整理頁面');
    }
}

// ============================================================================
// 渲染公告列表
// ============================================================================

function renderAnnouncements(announcements) {
    const container = document.getElementById('announcements-list');

    if (!announcements || announcements.length === 0) {
        container.innerHTML = '<p class="loading">目前沒有公告</p>';
        return;
    }

    container.innerHTML = '';

    announcements.forEach(announcement => {
        const card = createAnnouncementCard(announcement);
        container.appendChild(card);
    });

    // 更新分類篩選器（顯示所有已使用的分類）
    updateCategoryFilter();
}

function createAnnouncementCard(announcement) {
    const card = document.createElement('div');
    card.className = 'announcement-card';
    card.style.cursor = 'pointer';
    card.title = '點擊查看完整內容';

    // 為分類標籤添加刪除按鈕（僅限 admin）
    const categoriesHtml = announcement.categories.map(cat => {
        const deleteIcon = isAdmin ? `<span class="category-delete" data-id="${announcement.id}" data-category="${escapeHtml(cat)}" title="刪除此分類">×</span>` : '';
        return `<span class="category-tag">${escapeHtml(cat)}${deleteIcon}</span>`;
    }).join('');

    const date = new Date(announcement.date);
    const dateStr = date.toLocaleDateString('zh-TW');

    const readBy = announcement.readBy || [];
    const readCount = readBy.length;

    // 計算測驗完成人數（90分以上）
    const scores = announcement.scores || {};
    const passedCount = Object.values(scores).filter(s => s.percentage >= 90).length;

    // 顯示已讀和已完成測驗的人員名單
    const readByList = readBy.join(', ') || '尚無人閱讀';
    const passedList = Object.entries(scores)
        .filter(([, data]) => data.percentage >= 90)
        .map(([email]) => email)
        .join(', ') || '尚無人完成測驗';

    // Admin 刪除按鈕
    const deleteButton = isAdmin ?
        `<button class="btn btn-danger btn-delete" data-id="${announcement.id}">🗑️ 刪除公告</button>` : '';

    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">${escapeHtml(announcement.title)}</h3>
            <div class="card-meta">
                <span>📅 ${dateStr}</span>
                <span>✍️ ${escapeHtml(announcement.posterName)}</span>
            </div>
        </div>
        <div class="card-content">
            ${escapeHtml(announcement.content)}
        </div>
        <div class="card-footer">
            ${categoriesHtml}
        </div>
        <div class="card-stats">
            <div class="stat-item">
                <strong>👁️ 已閱讀：</strong>${readCount} 人
                <div class="stat-detail">${readByList}</div>
            </div>
            <div class="stat-item">
                <strong>✅ 測驗通過：</strong>${passedCount} 人
                <div class="stat-detail">${passedList}</div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn btn-success btn-read" data-id="${announcement.id}">
                ✅ 我已閱讀並理解
            </button>
            <button class="btn btn-primary btn-quiz" data-id="${announcement.id}">
                📝 開始學習測驗
            </button>
            <button class="btn btn-secondary btn-copy-link" data-id="${announcement.id}" title="複製公告連結">
                🔗 複製連結
            </button>
            ${deleteButton}
        </div>
        <div class="card-comments" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>💬 留言區（${(announcement.comments || []).length}）</strong>
                <button class="btn btn-secondary" style="font-size: 12px; padding: 6px 12px;" onclick="addComment('${announcement.id}'); event.stopPropagation();">
                    ➕ 新增留言
                </button>
            </div>
            <div class="comments-list">
                ${renderComments(announcement.comments || [], announcement.id)}
            </div>
        </div>
    `;

    // 綁定按鈕事件
    const readBtn = card.querySelector('.btn-read');
    readBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleMarkAsRead(announcement.id);
    });

    const quizBtn = card.querySelector('.btn-quiz');
    quizBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleStartQuiz(announcement);
    });

    // 綁定複製連結按鈕
    const copyLinkBtn = card.querySelector('.btn-copy-link');
    copyLinkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCopyAnnouncementLink(announcement.id);
    });

    // 綁定刪除公告按鈕
    const deleteBtn = card.querySelector('.btn-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteAnnouncement(announcement.id, announcement.title);
        });
    }

    // 綁定刪除分類按鈕
    const categoryDeleteBtns = card.querySelectorAll('.category-delete');
    categoryDeleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const announcementId = btn.dataset.id;
            const category = btn.dataset.category;
            handleDeleteCategory(announcementId, category, announcement);
        });
    });

    // 點擊卡片主體顯示詳細內容
    card.addEventListener('click', (e) => {
        // 如果點擊的是按鈕，不觸發詳細視圖
        if (e.target.closest('.btn') || e.target.closest('.category-delete')) {
            return;
        }
        showAnnouncementDetail(announcement);
    });

    return card;
}

// ============================================================================
// 刪除公告（Admin 功能）
// ============================================================================

async function handleDeleteAnnouncement(announcementId, title) {
    if (!confirm(`確定要刪除公告「${title}」嗎？\n此操作無法復原！`)) {
        return;
    }

    try {
        const response = await fetch(`/api/announcements/${announcementId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('公告已刪除');
            loadAnnouncements();
        } else {
            showError('刪除失敗：' + (result.error || '未知錯誤'));
        }
    } catch (error) {
        console.error('刪除公告失敗:', error);
        showError('刪除公告失敗，請稍後再試');
    }
}

// ============================================================================
// 刪除分類標籤（Admin 功能）
// ============================================================================

async function handleDeleteCategory(announcementId, category, announcement) {
    if (!confirm(`確定要從此公告中刪除分類「${category}」嗎？`)) {
        return;
    }

    try {
        // 從分類列表中移除該分類
        const updatedCategories = announcement.categories.filter(c => c !== category);

        // 更新公告（使用 PUT 請求，我們需要在後端添加這個 endpoint）
        // 目前先用前端更新，實際應該調用 API
        const response = await fetch(`/api/announcements/${announcementId}/categories`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categories: updatedCategories
            })
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('分類已刪除');
            loadAnnouncements();
        } else {
            showError('刪除分類失敗：' + (result.error || '未知錯誤'));
        }
    } catch (error) {
        console.error('刪除分類失敗:', error);
        showError('刪除分類失敗，請稍後再試');
    }
}

// ============================================================================
// 建立新公告
// ============================================================================

async function handleCreateAnnouncement(e) {
    e.preventDefault();

    const posterName = document.getElementById('posterName').value.trim();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();

    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    const categories = Array.from(categoryCheckboxes).map(cb => cb.value);

    // 新增自訂分類
    const customCategory = document.getElementById('custom-category');
    if (customCategory && customCategory.value.trim()) {
        categories.push(customCategory.value.trim());
    }

    if (!posterName || !title || !content) {
        showError('請填寫所有必填欄位');
        return;
    }

    try {
        const response = await fetch('/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                posterName,
                title,
                content,
                categories
            })
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('公告發布成功！');
            document.getElementById('create-form').reset();
            loadAnnouncements();
        } else {
            showError('發布失敗：' + (result.error || '未知錯誤'));
        }
    } catch (error) {
        console.error('發布公告失敗:', error);
        showError('發布公告失敗，請稍後再試');
    }
}

// ============================================================================
// 標記為已讀
// ============================================================================

async function handleMarkAsRead(announcementId) {
    try {
        const response = await fetch(`/api/announcements/${announcementId}/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('已標記為已讀！');
            loadAnnouncements();
        } else {
            showError('標記失敗');
        }
    } catch (error) {
        console.error('標記已讀失敗:', error);
        showError('標記失敗，請稍後再試');
    }
}

// ============================================================================
// 搜尋與篩選
// ============================================================================

function handleSearch() {
    const category = document.getElementById('category-filter').value;
    const search = document.getElementById('search-input').value.trim();

    loadAnnouncements(category, search);
}

// ============================================================================
// 測驗功能
// ============================================================================

async function handleStartQuiz(announcement) {
    currentAnnouncementId = announcement.id;

    // 先詢問姓名
    const userName = prompt('請輸入您的姓名（用於測驗記錄）：');
    if (!userName || !userName.trim()) {
        showError('需要輸入姓名才能開始測驗');
        return;
    }
    currentUserName = userName.trim();

    // 顯示載入中
    const modal = document.getElementById('quiz-modal');
    const container = document.getElementById('quiz-container');
    const currentDate = new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    container.innerHTML = `
        <div class="quiz-info">
            <p><strong>測驗者：</strong>${escapeHtml(currentUserName)}</p>
            <p><strong>日期：</strong>${currentDate}</p>
            <p><strong>及格標準：</strong>90 分</p>
        </div>
        <p class="loading">正在使用 AI 生成測驗題目...</p>
    `;
    modal.classList.add('active');

    try {
        const response = await fetch('/api/quiz/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: announcement.title,
                content: announcement.content
            })
        });

        const quiz = await response.json();

        if (quiz.questions && quiz.questions.length > 0) {
            currentQuiz = quiz;
            userAnswers = new Array(quiz.questions.length).fill(null);
            renderQuiz(quiz);
        } else {
            showError('無法生成測驗題目');
            closeQuizModal();
        }
    } catch (error) {
        console.error('生成測驗失敗:', error);
        showError('生成測驗失敗，請稍後再試');
        closeQuizModal();
    }
}

function renderQuiz(quiz) {
    const container = document.getElementById('quiz-container');
    const currentDate = new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let html = `
        <div class="quiz-info">
            <p><strong>測驗者：</strong>${escapeHtml(currentUserName)}</p>
            <p><strong>日期：</strong>${currentDate}</p>
            <p><strong>及格標準：</strong>90 分</p>
            <hr style="margin: 1rem 0;">
        </div>
    `;

    quiz.questions.forEach((question, index) => {
        const optionsHtml = question.options.map((option, optionIndex) => `
            <div class="quiz-option" data-question="${index}" data-option="${optionIndex}">
                ${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(option)}
            </div>
        `).join('');

        html += `
            <div class="quiz-question">
                <h3>問題 ${index + 1}：${escapeHtml(question.question)}</h3>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
            </div>
        `;
    });

    // 加入提交按鈕
    html += '<button class="btn btn-primary mt-3" id="submit-quiz-btn">提交測驗</button>';

    container.innerHTML = html;

    // 綁定選項點擊事件
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', handleQuizOptionClick);
    });

    // 綁定提交按鈕
    document.getElementById('submit-quiz-btn').addEventListener('click', handleSubmitQuiz);
}

function handleQuizOptionClick(e) {
    const option = e.currentTarget;
    const questionIndex = parseInt(option.dataset.question);
    const optionIndex = parseInt(option.dataset.option);

    // 取消同一題的其他選項
    const allOptions = document.querySelectorAll(`[data-question="${questionIndex}"]`);
    allOptions.forEach(opt => opt.classList.remove('selected'));

    // 選擇當前選項
    option.classList.add('selected');
    userAnswers[questionIndex] = optionIndex;
}

async function handleSubmitQuiz() {
    // 檢查是否所有題目都已作答
    const unanswered = userAnswers.findIndex(answer => answer === null);
    if (unanswered !== -1) {
        showError(`請回答第 ${unanswered + 1} 題`);
        return;
    }

    // 計算分數
    let score = 0;
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            score++;
        }
    });

    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 90;

    // 提交成績到伺服器
    try {
        await fetch(`/api/announcements/${currentAnnouncementId}/quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                score,
                total,
                userName: currentUserName,
                passed
            })
        });
    } catch (error) {
        console.error('提交成績失敗:', error);
    }

    // 顯示結果
    showQuizResult(score, total, percentage, passed);
}

function showQuizResult(score, total, percentage, passed) {
    const container = document.getElementById('quiz-container');
    const resultDiv = document.getElementById('quiz-result');

    container.classList.add('hidden');
    resultDiv.classList.remove('hidden');

    let emoji, message, resultClass;

    if (passed) {
        emoji = '🎉';
        message = '恭喜通過！';
        resultClass = 'result-pass';
    } else {
        emoji = '😢';
        message = '未達及格標準，請重新測驗';
        resultClass = 'result-fail';
    }

    const currentDate = new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    resultDiv.innerHTML = `
        <div class="quiz-result ${resultClass}">
            <h3>${emoji} ${message}</h3>
            <p style="font-size: 3rem; margin: 1rem 0;">${percentage}%</p>
            <p><strong>測驗者：</strong>${escapeHtml(currentUserName)}</p>
            <p><strong>日期：</strong>${currentDate}</p>
            <p><strong>得分：</strong>${score} / ${total} 題</p>
            <p><strong>及格標準：</strong>90 分</p>
            ${passed ?
                '<p class="pass-message">✅ 已記錄為測驗通過</p>' :
                '<p class="fail-message">❌ 需要重新測驗以達到 90 分</p>'
            }
            <button class="btn btn-primary mt-3" onclick="closeQuizModal()">
                ${passed ? '關閉' : '重新測驗'}
            </button>
        </div>
    `;
}

// ============================================================================
// 公告詳細視圖
// ============================================================================

function showAnnouncementDetail(announcement) {
    const modal = document.getElementById('announcement-detail-modal');
    const titleElement = document.getElementById('detail-modal-title');
    const contentElement = document.getElementById('announcement-detail-content');

    // 設定標題
    titleElement.textContent = `📢 ${announcement.title}`;

    // 準備分類標籤 HTML
    const categoriesHtml = announcement.categories.map(cat =>
        `<span class="category-tag">${escapeHtml(cat)}</span>`
    ).join('');

    const date = new Date(announcement.date);
    const dateStr = date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const readBy = announcement.readBy || [];
    const readCount = readBy.length;
    const readByList = readBy.join(', ') || '尚無人閱讀';

    const scores = announcement.scores || {};
    const passedCount = Object.values(scores).filter(s => s.percentage >= 90).length;
    const passedList = Object.entries(scores)
        .filter(([, data]) => data.percentage >= 90)
        .map(([email]) => email)
        .join(', ') || '尚無人完成測驗';

    // 設定內容
    contentElement.innerHTML = `
        <div class="announcement-detail">
            <div class="detail-meta">
                <p><strong>📅 發布時間：</strong>${dateStr}</p>
                <p><strong>✍️ 發布者：</strong>${escapeHtml(announcement.posterName)}</p>
                <p><strong>🏷️ 分類：</strong>${categoriesHtml || '無'}</p>
            </div>

            <div class="detail-content">
                <h3>📄 內容</h3>
                <div class="content-text">${escapeHtml(announcement.content).replace(/\n/g, '<br>')}</div>
            </div>

            <div class="detail-stats">
                <h3>📊 統計資訊</h3>
                <div class="stat-item">
                    <strong>👁️ 已閱讀：</strong>${readCount} 人
                    <div class="stat-detail">${readByList}</div>
                </div>
                <div class="stat-item">
                    <strong>✅ 測驗通過 (≥90分)：</strong>${passedCount} 人
                    <div class="stat-detail">${passedList}</div>
                </div>
            </div>

            <div class="detail-actions">
                <button class="btn btn-success" onclick="closeAnnouncementDetailModal(); handleMarkAsRead('${announcement.id}')">
                    ✅ 我已閱讀並理解
                </button>
                <button class="btn btn-primary" onclick="closeAnnouncementDetailModal(); handleStartQuiz(${JSON.stringify(announcement).replace(/"/g, '&quot;')})">
                    📝 開始學習測驗
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeAnnouncementDetailModal() {
    const modal = document.getElementById('announcement-detail-modal');
    modal.classList.remove('active');
}

function closeQuizModal() {
    const modal = document.getElementById('quiz-modal');
    modal.classList.remove('active');

    // 重置狀態
    currentQuiz = null;
    currentAnnouncementId = null;
    userAnswers = [];
    currentUserName = '';

    const container = document.getElementById('quiz-container');
    const resultDiv = document.getElementById('quiz-result');
    container.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    // 重新載入公告以更新統計
    loadAnnouncements();
}

// ============================================================================
// 工具函式
// ============================================================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}

// ============================================================================
// 評論功能
// ============================================================================

async function addComment(announcementId) {
    const userName = prompt('請輸入您的姓名：');
    if (!userName || !userName.trim()) {
        showError('需要輸入姓名');
        return;
    }

    const content = prompt('請輸入留言內容：');
    if (!content || !content.trim()) {
        showError('留言內容不能為空');
        return;
    }

    try {
        const response = await fetch(`/api/announcements/${announcementId}/comments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userName: userName.trim(),
                content: content.trim()
            })
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('留言已發送！');
            loadAnnouncements(); // 重新載入以顯示新留言
        } else {
            showError('留言失敗');
        }
    } catch (error) {
        console.error('留言失敗:', error);
        showError('留言失敗，請稍後再試');
    }
}

async function deleteComment(commentId) {
    if (!confirm('確定要刪除這則留言嗎？')) {
        return;
    }

    try {
        const response = await fetch(`/api/announcements/comments/${commentId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('留言已刪除');
            loadAnnouncements(); // 重新載入
        } else {
            showError('刪除失敗');
        }
    } catch (error) {
        console.error('刪除留言失敗:', error);
        showError('刪除失敗，請稍後再試');
    }
}

function renderComments(comments, announcementId) {
    if (!comments || comments.length === 0) {
        return '<p style="color: #64748b; font-size: 14px;">尚無留言</p>';
    }

    return comments.map(comment => {
        const date = new Date(comment.date);
        const dateStr = date.toLocaleString('zh-TW');
        const canDelete = comment.userEmail === currentUserEmail || isAdmin;

        return `
            <div class="comment-item" style="
                padding: 10px;
                margin: 10px 0;
                background: #f8fafc;
                border-radius: 4px;
                border-left: 3px solid var(--primary-color);
            ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong style="color: var(--primary-color);">${escapeHtml(comment.userName)}</strong>
                    <small style="color: #94a3b8;">${dateStr}</small>
                </div>
                <div style="color: var(--text-primary); white-space: pre-wrap;">${escapeHtml(comment.content)}</div>
                ${canDelete ? `
                    <button
                        class="btn btn-danger"
                        style="font-size: 12px; padding: 4px 8px; margin-top: 8px;"
                        onclick="deleteComment(${comment.id})"
                    >刪除</button>
                ` : ''}
            </div>
        `;
    }).join('');
}

// 複製公告連結
function handleCopyAnnouncementLink(announcementId) {
    // 產生公告的完整 URL (包含 hash 定位)
    const baseUrl = window.location.origin;
    const announcementUrl = `${baseUrl}/#announcement-${announcementId}`;

    // 使用 Clipboard API 複製到剪貼簿
    navigator.clipboard.writeText(announcementUrl).then(() => {
        alert('✅ 公告連結已複製到剪貼簿!\n\n' + announcementUrl);
    }).catch(err => {
        // 如果 Clipboard API 失敗,使用舊方法
        const textArea = document.createElement('textarea');
        textArea.value = announcementUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('✅ 公告連結已複製到剪貼簿!\n\n' + announcementUrl);
        } catch (err) {
            alert('❌ 複製失敗,請手動複製:\n' + announcementUrl);
        }
        document.body.removeChild(textArea);
    });
}

// 處理頁面載入時的 hash 定位
window.addEventListener('DOMContentLoaded', () => {
    // 如果 URL 包含 #announcement-xxx, 自動滾動到對應公告
    if (window.location.hash.startsWith('#announcement-')) {
        setTimeout(() => {
            const announcementId = window.location.hash.replace('#announcement-', '');
            const card = document.getElementById(`announcement-${announcementId}`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.5)';
                setTimeout(() => {
                    card.style.boxShadow = '';
                }, 2000);
            }
        }, 500);
    }
});
