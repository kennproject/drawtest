import { GLOBAL_STATS_DATA } from './data.js';

// --- 全局防誤觸：攔截選單與禁用長按 ---
window.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.platform-title') || e.target.closest('.platform-chip') || e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// --- 統一系統本地通知模組 ---
function sendLocalNotification(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        const options = {
            body: body,
            icon: "./icon.png",
            badge: "./icon.png",
            vibrate: [200, 100, 200]
        };
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, options);
            }).catch(() => {
                new Notification(title, options);
            });
        } else {
            new Notification(title, options);
        }
    }
}

// --- 網頁內建 Toast 通知系統 ---
function showToast(title, messageLines) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'app-toast p-4 rounded-xl shadow-2xl flex flex-col gap-2 pointer-events-auto border-l-4 border-blue-500 bg-white dark:bg-[#1c2128]';
    const plainText = title + '\n' + messageLines.join('\n');
    toast.innerHTML = `
        <div class="flex justify-between items-start w-full">
            <div class="font-bold text-sm flex items-center gap-2" style="color: var(--theme-color-primary);">
                <span class="material-symbols-outlined text-[18px]">notifications_active</span> ${title}
            </div>
            <button class="toast-copy-btn text-gray-400 hover:text-blue-500 transition-colors p-1 -mt-1 -mr-1" title="複製結果">
                <span class="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
        </div>
        <div class="text-[13px] font-bold leading-relaxed tabular-nums" style="color: var(--color-text-primary);">
            ${messageLines.join('<br>')}
        </div>
    `;
    const copyBtn = toast.querySelector('.toast-copy-btn');
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(plainText).then(() => {
            copyBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] text-green-500">check</span>';
            setTimeout(() => { copyBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">content_copy</span>'; }, 2000);
        });
    });
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400); 
    }, 6000);
}

// --- PWA 動態設置與更新機制 ---
const setupPWA = () => {
    const manifest = {
        name: "社區消費大獎賞2026記錄平台", short_name: "消費大獎賞", start_url: ".", display: "standalone",
        background_color: "#f3f4f6", theme_color: "#1976D2",
        icons: [ { src: "./icon.png", sizes: "192x192 512x512", type: "image/png", purpose: "any maskable" } ]
    };
    document.getElementById('manifest-link').href = 'data:application/manifest+json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest));

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(reg => {
                console.log('Service Worker 註冊成功:', reg.scope);
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('發現新版本，正在自動重新載入...');
                            window.location.reload(true);
                        }
                    });
                });
            }).catch(err => console.warn('Service Worker 註冊失敗:', err));
        });
    }
};
setupPWA();

// --- 核心動態載入工具 ---
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src; script.defer = true;
        script.onload = resolve; script.onerror = reject;
        document.head.appendChild(script);
    });
};

// --- 常數定義 ---
const PLATFORMS = { 'Alipay': 'Alipay支付寶', 'BOC': 'BOC中銀', 'GFB': 'GFB廣發', 'ICBC': 'ICBC工銀', 'Luso': 'Luso國際', 'MPay': 'MPay', 'TFB': 'TFB大豐', 'UePay': 'UePay極易付' };
const PLATFORM_COLORS = { 'Alipay': '#003c8b', 'BOC': '#a71930', 'GFB': '#e3041f', 'ICBC': '#C7000B', 'Luso': '#0c4890', 'MPay': '#ff8201', 'TFB': '#ffd801', 'UePay': '#58c0df' };
const PLATFORM_ICONS = { 'Alipay': './alipay_icon.webp', 'BOC': './boc_icon.webp', 'GFB': './guangfa_icon.webp', 'ICBC': './icbc_icon.webp', 'Luso': './luso_icon.webp', 'MPay': './mpay_icon.webp', 'TFB': './taifung_icon.webp', 'UePay': './uepay_icon.webp' };

// UePay / GFB 等 App 跳轉 Scheme
const APP_SCHEMES = { 
    'Alipay': 'alipays://', 
    'BOC': 'bocmmobilebankeid://', 
    'GFB': 'cgbchina://aomenbank/openpage', 
    'ICBC': 'icbcabroadbank://com.icbc.abroadbank.launch', 
    'Luso': 'lib://mobile.lusobank.com.mo', 
    'MPay': 'mpay://', 
    'TFB': 'tfbmobilebank://taifungbank.com',
    'UePay': 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.foorich.uepay;end'
};

// 統一管理跳轉 APP 邏輯
function jumpToApp(platform) {
    if (!platform) return;
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    var isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    var isAndroid = /android/i.test(userAgent);

    if (platform === 'UePay') {
        var iosScheme = 'uepay://'; 
        var androidScheme = APP_SCHEMES['UePay'];
        var appStoreUrl = 'https://apps.apple.com/hk/app/uepay/id1262244387';
        var googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.foorich.uepay';

        if (isIOS) {
            window.location.href = iosScheme;
            setTimeout(function() { if (!document.hidden) window.location.href = appStoreUrl; }, 2000);
        } else if (isAndroid) {
            const a = document.createElement('a');
            a.href = androidScheme;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function() { if (!document.hidden) window.location.href = googlePlayUrl; }, 2000);
        } else {
            window.location.href = appStoreUrl;
        }
    } else if (platform === 'GFB') {
        if (isIOS) {
            window.location.href = 'cgbaom://';
        } else {
            window.location.href = APP_SCHEMES['GFB'];
        }
    } else if (APP_SCHEMES[platform]) {
        window.location.href = APP_SCHEMES[platform];
    }
}

const THEMES = {
    orange: { primary: '#BF7B49', title: '#F4A261', summaryBg: '#FEF5ED', summaryBorder: '#F4A261', summaryText: '#9A6234' },
    red: { primary: '#D32F2F', title: '#F44336', summaryBg: '#FFEBEE', summaryBorder: '#F44336', summaryText: '#C62828' },
    blue: { primary: '#1976D2', title: '#2196F3', summaryBg: '#E3F2FD', summaryBorder: '#2196F3', summaryText: '#1565C0' },
    yellow: { primary: '#FBC02D', title: '#FFEB3B', summaryBg: '#FFFDE7', summaryBorder: '#FFEB3B', summaryText: '#F57F17' },
    purple: { primary: '#7B1FA2', title: '#9C27B0', summaryBg: '#F3E5F5', summaryBorder: '#9C27B0', summaryText: '#6A1B9A' },
    green: { primary: '#388E3C', title: '#4CAF50', summaryBg: '#E8F5E9', summaryBorder: '#4CAF50', summaryText: '#2E7D32' },
};

let deferredPrompt; window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

// --- Firebase Lazy Loading 初始化 ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{"apiKey":"AIzaSyBi7ljiBtEW6D2ZZFxj4z4DGemsYviRM_g","authDomain":"macaudraw2-e4d16.firebaseapp.com","projectId":"macaudraw2-e4d16","storageBucket":"macaudraw2-e4d16.firebasestorage.app","messagingSenderId":"1088106363043","appId":"1:1088106363043:web:5f727855b41165f8216716"}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'macau-draw-2026';
let FB = {}; 
let currentUserId = null, records = [], hiddenPlatforms = [];
let unsubscribeFromRecords = null, isInitialLoad = true; 
let couponCountChart = null, platformTotalChart = null, weeklyTotalChart = null, platformWeeklyTotalChart = null;
let globalCouponChart = null, globalShareChart = null; 
let bestCouponCombination = []; let writeTimeout = null; let pendingWrites = {};
let currentInputPlatform = ''; let currentInputValues = ['-', '-', '-']; let currentInputIndex = 0;

// 我的大獎賞海報專用 Chart 實例
let posterPlatformChart = null;
let posterCouponChart = null;
let posterWeeklyTrendChart = null;

const allDOMElements = {
    mainTitle: document.getElementById('main-title'), timeInfoEl: document.getElementById('timeInfo'),
    userIdInput: document.getElementById('userIdInput'), copyUserIdBtn: document.getElementById('copyUserId'), switchUserBtn: document.getElementById('switchUserBtn'),
    addRecordSection: document.getElementById('addRecordSection'), allCompletedMsg: document.getElementById('allCompletedMsg'),
    toggleRecordPanelBtn: document.getElementById('toggleRecordPanelBtn'), recordPanel: document.getElementById('recordPanel'), toggleRecordIcon: document.getElementById('toggleRecordIcon'),
    platformChipsContainer: document.getElementById('platformChipsContainer'), couponSlots: document.querySelectorAll('.coupon-slot'), valBtns: document.querySelectorAll('.val-btn'), clearSlotsBtn: document.getElementById('clearSlotsBtn'),
    skipBtn: document.getElementById('skipBtn'),
    advancedToggle: document.getElementById('advanced-toggle'), advancedToggleIcon: document.getElementById('advanced-toggle-icon'), advancedOptionsContainer: document.getElementById('advanced-options-container'), entryWeek: document.getElementById('entryWeek'),
    filterWeekSelect: document.getElementById('filterWeek'), filterCurrentWeekBtn: document.getElementById('filterCurrentWeekBtn'), filterPlatformSelect: document.getElementById('filterPlatform'),
    addRecordBtn: document.getElementById('addRecordBtn'), recordsList: document.getElementById('recordsList'), expiringAlertContainer: document.getElementById('expiringAlertContainer'),
    summaryTotal: document.getElementById('summary-total'), summaryRemaining: document.getElementById('summary-remaining'), summarySpending: document.getElementById('summary-spending'),
    settingsBtn: document.getElementById('settingsBtn'), settingsDialog: document.getElementById('settingsDialog'), platformSettingsEl: document.getElementById('platformSettings'), saveSettingsBtn: document.getElementById('saveSettings'), cancelSettingsBtn: document.getElementById('cancelSettings'),
    disclaimerLink: document.getElementById('disclaimerLink'), 
    statsBtn: document.getElementById('statsBtn'), statsDialog: document.getElementById('statsDialog'), closeStatsDialogBtn: document.getElementById('closeStatsDialog'), statsWeekFilter: document.getElementById('statsWeekFilter'), downloadStatsBtn: document.getElementById('downloadStatsBtn'),
    globalStatsBtn: document.getElementById('globalStatsBtn'), globalStatsDialog: document.getElementById('globalStatsDialog'), closeGlobalStatsBtn: document.getElementById('closeGlobalStatsBtn'), globalStatsWeekFilter: document.getElementById('globalStatsWeekFilter'), globalStatsTbody: document.getElementById('globalStatsTbody'), globalStatsCutoff: document.getElementById('globalStatsCutoff'), globalStatsOverview: document.getElementById('globalStatsOverview'),
    themeBtn: document.getElementById('themeBtn'), themeDialog: document.getElementById('themeDialog'), themeOptions: document.getElementById('theme-options'), darkModeSwitch: document.getElementById('darkModeSwitch'),
    alertDialog: document.getElementById('alertDialog'), alertTitle: document.getElementById('alertTitle'), alertMessage: document.getElementById('alertMessage'),
    confirmDialog: document.getElementById('confirmDialog'), confirmTitle: document.getElementById('confirmTitle'), confirmMessage: document.getElementById('confirmMessage'),
    addFavoriteBtn: document.getElementById('addFavoriteBtn'), addToHomeScreenBtn: document.getElementById('addToHomeScreenBtn'), exportCsvBtn: document.getElementById('exportCsvBtn'), 
    calculatorBtn: document.getElementById('calculatorBtn'), calculatorDialog: document.getElementById('calculatorDialog'), spendingAmountInput: document.getElementById('spendingAmountInput'), calculatorResult: document.getElementById('calculatorResult'), calculateBtn: document.getElementById('calculateBtn'), markAsUsedBtn: document.getElementById('markAsUsedBtn'), cancelCalculatorBtn: document.getElementById('cancelCalculator'), statusAnnouncer: document.getElementById('status-announcer'),
    quickNotifyBtn: document.getElementById('quickNotifyBtn'),
    
    // 我的大獎賞 DOM 綁定
    myRewardsBtn: document.getElementById('myRewardsBtn'),
    myRewardsDialog: document.getElementById('myRewardsDialog'),
    closeMyRewardsBtn: document.getElementById('closeMyRewardsBtn'),
    downloadPosterBtn: document.getElementById('downloadPosterBtn')
};

function announceStatus(message) { allDOMElements.statusAnnouncer.textContent = message; }

function showLoadingSkeleton() {
    const { recordsList } = allDOMElements;
    recordsList.innerHTML = ''; recordsList.setAttribute('aria-busy', 'true');
    for (let i = 0; i < 6; i++) {
        const card = document.createElement('div');
        card.className = 'p-3 sm:p-4 rounded-[1.5rem] border shadow-sm bg-white/60 dark:bg-[#1c2128]/60 backdrop-blur-md flex flex-row items-center gap-3 sm:gap-4 border-white/40 dark:border-gray-700/40';
        card.innerHTML = `
            <div class="flex flex-row items-center w-[140px] sm:w-[170px] flex-shrink-0 gap-2 overflow-hidden">
                <div class="skeleton-loader w-14 h-14 sm:w-16 sm:h-16 rounded-[1rem] flex-shrink-0"></div>
                <div class="flex flex-col items-start gap-1 mt-0.5"><div class="skeleton-loader h-4 w-10 rounded-full"></div><div class="skeleton-loader h-6 w-16 rounded-full"></div></div>
            </div>
            <div class="flex-1 flex justify-between items-center gap-2 pl-2">
                <div class="skeleton-loader h-12 sm:h-14 flex-1 rounded-full"></div><div class="skeleton-loader h-12 sm:h-14 flex-1 rounded-full"></div><div class="skeleton-loader h-12 sm:h-14 flex-1 rounded-full"></div>
            </div>
        `;
        recordsList.appendChild(card);
    }
}

function updateSundayReminder() {
    const today = new Date();
    const reminderEl = document.getElementById('sundayReminder');
    const reminderText = document.getElementById('sundayReminderText');
    if (today.getDay() === 0) { 
        const currentWeek = getWeekNumber(today);
        const recordedPlatforms = records.filter(r => r.week === currentWeek).map(r => r.platform);
        const availablePlatforms = Object.keys(PLATFORMS).filter(p => !hiddenPlatforms.includes(p));
        const unrecorded = availablePlatforms.filter(p => !recordedPlatforms.includes(p));
        if (unrecorded.length > 0) {
            reminderText.textContent = `提提您，您仲有 ${unrecorded.map(p => PLATFORMS[p]).join('、')} 平台未抽券呀。`;
            reminderEl.classList.remove('hidden');
        } else { reminderEl.classList.add('hidden'); }
    } else { reminderEl.classList.add('hidden'); }
}

function refreshUI() { renderRecords(); updateWeeklySummary(); updatePlatformOptionsAvailability(); initializeEntryWeekSelect(); updateSundayReminder(); }

function initRecordPanelUI() {
    const { toggleRecordPanelBtn, recordPanel, toggleRecordIcon, valBtns, clearSlotsBtn, couponSlots, entryWeek } = allDOMElements;
    toggleRecordPanelBtn.addEventListener('click', () => {
        const isHidden = recordPanel.classList.toggle('hidden');
        toggleRecordIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    });
    couponSlots.forEach((slot, index) => { slot.addEventListener('click', () => { currentInputIndex = index; updateCouponSlotsUI(); }); });
    valBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentInputIndex < 3) {
                currentInputValues[currentInputIndex] = btn.dataset.val;
                if (currentInputIndex < 2) currentInputIndex++; else currentInputIndex = 3; 
                updateCouponSlotsUI();
            }
        });
    });
    clearSlotsBtn.addEventListener('click', () => {
        if (currentInputIndex === 3) currentInputIndex = 2; 
        if (currentInputValues[currentInputIndex] !== '-') currentInputValues[currentInputIndex] = '-';
        else if (currentInputIndex > 0) { currentInputIndex--; currentInputValues[currentInputIndex] = '-'; }
        updateCouponSlotsUI();
    });
    entryWeek.addEventListener('change', () => {
        updatePlatformOptionsAvailability();
        if(recordPanel.classList.contains('hidden')) toggleRecordPanelBtn.click();
    });
}

function updateCouponSlotsUI() {
    allDOMElements.couponSlots.forEach((slot, index) => {
        slot.textContent = currentInputValues[index] === '-' ? '0' : currentInputValues[index];
        if (index === currentInputIndex) {
            slot.style.borderColor = 'var(--theme-color-primary)'; slot.style.backgroundColor = 'var(--color-surface)'; slot.classList.add('shadow-md');
        } else {
            slot.style.borderColor = 'transparent'; slot.style.backgroundColor = 'rgba(200,200,200,0.15)'; slot.classList.remove('shadow-md');
        }
    });
}

function initializeEntryWeekSelect() {
    const { entryWeek } = allDOMElements; const currentWeek = getWeekNumber(new Date()); const previousSelection = entryWeek.value;
    entryWeek.innerHTML = ''; entryWeek.disabled = false;
    if (currentWeek > 1) {
        for (let i = 1; i < currentWeek; i++) entryWeek.innerHTML += `<md-select-option value="${i}">第 ${i} 周</md-select-option>`;
        if(previousSelection && parseInt(previousSelection) < currentWeek) entryWeek.value = previousSelection;
        else entryWeek.value = (currentWeek - 1).toString();
    } else {
        entryWeek.innerHTML = `<md-select-option value="" disabled selected>無過往周數可補錄</md-select-option>`; entryWeek.disabled = true;
    }
}

function initializeAdvancedToggle() {
    allDOMElements.advancedToggle.addEventListener('click', () => {
        const isHidden = allDOMElements.advancedOptionsContainer.classList.toggle('hidden');
        allDOMElements.advancedToggle.setAttribute('aria-expanded', !isHidden);
        allDOMElements.advancedToggleIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        updatePlatformOptionsAvailability();
    });
}

// 綁定跨設備資料同步展開面板
function initializeAuthToggle() {
    const authToggle = document.getElementById('auth-toggle'); const authOptionsContainer = document.getElementById('auth-options-container'); const authToggleIcon = document.getElementById('auth-toggle-icon');
    authToggle.addEventListener('click', () => {
        const isHidden = authOptionsContainer.classList.toggle('hidden');
        authToggle.setAttribute('aria-expanded', !isHidden);
        authToggleIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    });
}

function showAlertDialog(message, title = "通知") { allDOMElements.alertTitle.textContent = title; allDOMElements.alertMessage.innerHTML = message.replace(/\n/g, '<br>'); allDOMElements.alertDialog.show(); }
function showConfirmDialog(message, title = "請確認") { allDOMElements.confirmTitle.textContent = title; allDOMElements.confirmMessage.textContent = message; allDOMElements.confirmDialog.show(); return new Promise(resolve => { allDOMElements.confirmDialog.addEventListener('close', (event) => { resolve(event.target.returnValue === 'confirm'); }, { once: true }); }); }

function getEntryWeekNumber() {
    if (!allDOMElements.advancedOptionsContainer.classList.contains('hidden') && allDOMElements.entryWeek.value) return parseInt(allDOMElements.entryWeek.value);
    return getWeekNumber(new Date());
}

function getWeekNumber(date) { 
    const startOfFirstWeek = new Date(2026, 3, 10); 
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = targetDate - startOfFirstWeek; 
    if (diff < 0) return 1; 
    const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1; 
    return weekNum > 10 ? 10 : weekNum; 
}

function formatNumber(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function updateTimeInfo() { 
    const date = new Date();
    const weekNumber = getWeekNumber(date);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    allDOMElements.timeInfoEl.innerHTML = `
        <div class="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <div class="h-9 flex items-center gap-2 px-4 rounded-full shadow-inner border box-border transition-colors" style="background-color: var(--color-bg); border-color: var(--color-border);">
                <span class="text-sm font-bold" style="color: var(--color-text-secondary);">第</span>
                <span class="flex items-center justify-center w-6 h-6 rounded-full font-black text-sm shadow-sm leading-none border transition-colors tabular-nums" style="background-color: var(--color-surface); border-color: var(--color-border); color: var(--theme-color-primary);">${weekNumber}</span>
                <span class="text-sm font-bold" style="color: var(--color-text-secondary);">周</span>
            </div>
            <div class="h-9 flex items-center gap-1.5 px-4 rounded-full shadow-inner border box-border transition-colors tabular-nums" style="background-color: var(--theme-color-summary-bg); border-color: var(--theme-color-summary-border); color: var(--theme-color-summary-text);">
                <span class="material-symbols-outlined text-[18px]">calendar_month</span>
                <span class="text-sm font-bold tracking-wider">${date.getMonth() + 1}月${date.getDate()}日 (${days[date.getDay()]})</span>
            </div>
        </div>`;
}

function calculateConsumption(record) { 
    const usedCoupons = record.usedCoupons || {}; 
    const values = [
        (!usedCoupons.draw1 && record.draw1 !== '-' && record.draw1 !== 'ND') ? parseInt(record.draw1) || 0 : 0, 
        (!usedCoupons.draw2 && record.draw2 !== '-' && record.draw2 !== 'ND') ? parseInt(record.draw2) || 0 : 0, 
        (!usedCoupons.draw3 && record.draw3 !== '-' && record.draw3 !== 'ND') ? parseInt(record.draw3) || 0 : 0
    ]; 
    return values.reduce((a, b) => a + b, 0) * 3; 
}

function renderRecords() {
    const { recordsList } = allDOMElements;
    recordsList.setAttribute('aria-busy', 'false');
    const filteredRecords = records.filter(record => {
        const matchWeek = !allDOMElements.filterWeekSelect.value || record.week.toString() === allDOMElements.filterWeekSelect.value;
        const matchPlatform = !allDOMElements.filterPlatformSelect.value || record.platform === allDOMElements.filterPlatformSelect.value;
        return matchWeek && matchPlatform && !hiddenPlatforms.includes(record.platform);
    });
    
    const processedRecords = filteredRecords.map(record => {
        const usedCoupons = record.usedCoupons || {};
        const couponKeys = ['draw1', 'draw2', 'draw3'];
        const monetaryCoupons = couponKeys.filter(key => !isNaN(parseInt(record[key])));
        const allUsed = monetaryCoupons.length === 0 ? true : monetaryCoupons.every(key => usedCoupons[key]);
        
        // 計算該次抽獎的總金額
        const totalAmount = (parseInt(record.draw1) || 0) + (parseInt(record.draw2) || 0) + (parseInt(record.draw3) || 0);
        
        return { ...record, allUsed, totalAmount };
    });

    processedRecords.sort((a, b) => {
        if (a.allUsed !== b.allUsed) return a.allUsed ? 1 : -1;
        if (b.totalAmount !== a.totalAmount) return b.totalAmount - a.totalAmount; // 卡片按總抽到金額由大到小排序
        if (a.week !== b.week) return a.week - b.week;
        return a.platform.localeCompare(b.platform);
    });

    recordsList.innerHTML = '';
    
    // 空狀態引導按鈕
    if (processedRecords.length === 0) { 
        recordsList.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 gap-3">
                <div class="w-16 h-16 rounded-full bg-white dark:bg-[#1c2128] border dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-400">
                    <span class="material-symbols-outlined text-3xl">inbox</span>
                </div>
                <p class="font-bold text-gray-500 dark:text-gray-400">本周仲未有紀錄喎</p>
                <button id="emptyStateAddBtn" class="mt-2 px-5 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-bold text-sm border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">add_circle</span> 立即新增第一筆紀錄
                </button>
            </div>`; 
        const emptyAdd = document.getElementById('emptyStateAddBtn');
        if (emptyAdd) {
            emptyAdd.addEventListener('click', () => {
                if (allDOMElements.recordPanel.classList.contains('hidden')) allDOMElements.toggleRecordPanelBtn.click();
                allDOMElements.addRecordSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
        return; 
    }

    processedRecords.forEach((record, index) => {
        const consumption = calculateConsumption(record);
        const usedCoupons = record.usedCoupons || {};
        const platformColor = PLATFORM_COLORS[record.platform] || 'var(--color-border)';

        const cardContainer = document.createElement('div');
        cardContainer.className = `swipe-container`;
        
        const couponsData = [1, 2, 3].map(i => {
            const key = `draw${i}`;
            return { key: key, val: record[key], isInvalid: record[key] === '-' || record[key] === 'ND', isUsed: !!usedCoupons[key], originalIndex: i };
        });

        couponsData.sort((a, b) => {
            if (a.isInvalid !== b.isInvalid) return a.isInvalid ? 1 : -1;
            if (a.isUsed !== b.isUsed) return a.isUsed ? 1 : -1;
            
            const valA = parseInt(a.val) || 0;
            const valB = parseInt(b.val) || 0;
            return valB - valA; // 卡片內的個別券也按面額由大到小排序
        });

        const drawButtons = couponsData.map(item => {
            let styles = '';
            let classes = 'coupon-value flex-1 h-12 sm:h-14 flex items-center justify-center rounded-full text-base sm:text-lg font-bold transition-all box-border ';
            if (item.isInvalid) { classes += 'invalid border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 bg-transparent'; } 
            else if (item.isUsed) { classes += `striked bg-gray-100/80 dark:bg-[#21262d]/80 text-gray-400 dark:text-gray-500 ${item.val === '200' ? 'border-2 border-yellow-500/40' : 'border border-transparent'}`; } 
            else { classes += `shadow-sm hover:brightness-110 hover:scale-[1.02] active:scale-95 text-white ${item.val === '200' ? 'border-2 border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.6)] relative z-10' : 'border border-transparent'}`; styles = `background-color: ${platformColor};`; }
            return `<button class="${classes}" style="${styles}" data-coupon="${item.key}" aria-label="標記券為${item.isUsed ? '未使用' : '已使用'}" ${item.isInvalid ? 'disabled' : ''}>${item.isInvalid ? '0' : item.val}</button>`;
        }).join('');

        cardContainer.innerHTML = `
            <div class="swipe-action-bg delete-record-swipe" data-id="${record.id}">
                <span class="material-symbols-outlined text-3xl">delete</span>
            </div>
            <div class="record-card p-3 sm:p-4 rounded-[1.5rem] flex flex-row items-center gap-3 sm:gap-4 border" data-id="${record.id}" style="border-color: ${platformColor}60; box-shadow: 0 8px 24px -4px ${platformColor}33;">
                <div class="flex flex-row items-center w-[140px] sm:w-[170px] flex-shrink-0 platform-title cursor-pointer group gap-2 overflow-hidden" title="點擊跳轉APP / 長按全用">
                    <img src="${PLATFORM_ICONS[record.platform]}" alt="${PLATFORMS[record.platform] || record.platform}" class="w-14 h-14 sm:w-16 sm:h-16 rounded-[1rem] shadow-sm transition-opacity group-hover:opacity-70 bg-white object-contain border border-gray-100/50 dark:border-gray-700/50 flex-shrink-0" onerror="this.outerHTML='<div class=\\'font-extrabold text-sm sm:text-base truncate transition-colors group-hover:opacity-70 leading-none\\' style=\\'color: ${platformColor};\\'>${PLATFORMS[record.platform] || record.platform}</div>'">
                    <div class="flex flex-col items-start gap-1 font-bold tracking-tight transition-colors min-w-0 mt-0.5">
                        <span class="text-[10px] px-1.5 py-0.5 rounded-full text-white leading-none flex-shrink-0 tabular-nums shadow-sm" style="background-color: ${platformColor};">第${record.week}周</span>
                        <div class="flex items-baseline gap-0.5 truncate w-full" style="color: ${platformColor};">
                            <span class="text-[11px] sm:text-xs leading-none font-bold">MOP</span>
                            <span class="text-xl sm:text-2xl leading-none font-black truncate tabular-nums">${formatNumber(consumption)}</span>
                        </div>
                    </div>
                </div>
                <div class="flex-1 flex justify-between items-center gap-2 pl-2">
                    ${drawButtons}
                </div>
            </div>
        `;
        
        // 滑動刪除邏輯
        const innerCard = cardContainer.querySelector('.record-card');
        const swipeBg = cardContainer.querySelector('.swipe-action-bg');
        let startX = 0, startY = 0; let isDragging = false; let swipeOpen = false;
        innerCard.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX; startY = e.touches[0].clientY;
            isDragging = true; innerCard.style.transition = 'none';
        }, { passive: true });
        innerCard.addEventListener('touchmove', e => {
            if (!isDragging) return;
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 10) { isDragging = false; innerCard.style.transform = swipeOpen ? 'translateX(-80px)' : 'translateX(0)'; return; }
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                let moveX = swipeOpen ? deltaX - 80 : deltaX;
                if (moveX < -90) moveX = -90; if (moveX > 0) moveX = 0;
                innerCard.style.transform = `translateX(${moveX}px)`;
                swipeBg.style.opacity = moveX < -5 ? '1' : '0';
            }
        }, { passive: true });
        innerCard.addEventListener('touchend', e => {
            if (!isDragging) return;
            isDragging = false; const deltaX = e.changedTouches[0].clientX - startX;
            innerCard.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            if (swipeOpen) { if (deltaX > 20) swipeOpen = false; } else { if (deltaX < -30) swipeOpen = true; }
            innerCard.style.transform = swipeOpen ? 'translateX(-80px)' : 'translateX(0)';
            swipeBg.style.opacity = swipeOpen ? '1' : '0';
        });

        recordsList.appendChild(cardContainer);
    });
}

function updateWeeklySummary() {
    const date = new Date();
    const currentWeek = getWeekNumber(date);
    const weeklyRecords = records.filter(record => record.week === currentWeek);
    let totalCoupons = 0, remainingCoupons = 0;
    weeklyRecords.forEach(record => {
        const usedCoupons = record.usedCoupons || {};
        [record.draw1, record.draw2, record.draw3].forEach((c, i) => {
            const val = parseInt(c) || 0;
            if (val > 0) { totalCoupons += val; if (!usedCoupons[`draw${i+1}`]) remainingCoupons += val; }
        });
    });
    allDOMElements.summaryTotal.textContent = `MOP ${formatNumber(totalCoupons)}`;
    allDOMElements.summaryRemaining.textContent = `MOP ${formatNumber(remainingCoupons)}`;
    allDOMElements.summarySpending.textContent = `MOP ${formatNumber(remainingCoupons * 3)}`;
    
    if (date.getDay() === 4 && remainingCoupons > 0) allDOMElements.expiringAlertContainer.classList.remove('hidden');
    else allDOMElements.expiringAlertContainer.classList.add('hidden');
}

function renderPlatformOptions() {
    const platformsToRender = JSON.parse(localStorage.getItem('platformsCache')) || PLATFORMS;
    allDOMElements.filterPlatformSelect.innerHTML = '<md-select-option value="" selected>全部</md-select-option>';
    for (const key in platformsToRender) { 
        if (!hiddenPlatforms.includes(key)) allDOMElements.filterPlatformSelect.innerHTML += `<md-select-option value="${key}">${platformsToRender[key]}</md-select-option>`; 
    }

    const chipsContainer = allDOMElements.platformChipsContainer;
    chipsContainer.innerHTML = '';
    
    for (const key in platformsToRender) {
        if (!hiddenPlatforms.includes(key)) {
            const btn = document.createElement('button');
            const color = PLATFORM_COLORS[key] || '#9ca3af';
            const shortName = platformsToRender[key].replace(/^[a-zA-Z]+/g, '').trim() || platformsToRender[key];
            
            btn.className = 'platform-chip w-full flex flex-col items-center justify-center p-2 rounded-[1.25rem] border-2 transition-all shadow-sm bg-white/70 dark:bg-[#1c2128]/70 text-gray-700 dark:text-gray-300 backdrop-blur-sm';
            btn.dataset.platform = key;
            btn.style.borderColor = 'rgba(200,200,200,0.3)';
            
            btn.innerHTML = `
                <img src="${PLATFORM_ICONS[key]}" alt="${platformsToRender[key]}" class="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-1 rounded-[0.75rem] border border-gray-100/50 dark:border-gray-700/50 bg-white" onerror="this.outerHTML='<span class=\\'material-symbols-outlined mb-1 text-2xl\\'>account_balance_wallet</span>'">
                <span class="text-[11px] sm:text-xs font-bold truncate w-full text-center opacity-90" style="color: ${color};">${shortName}</span>
            `;
            
            // 單擊選擇邏輯
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.platform-chip').forEach(c => {
                    c.classList.remove('selected-chip'); c.style.borderColor = 'rgba(200,200,200,0.3)'; c.style.backgroundColor = '';
                });
                currentInputPlatform = key; btn.classList.add('selected-chip'); btn.style.borderColor = color; btn.style.backgroundColor = color + '15'; 
                updateCouponSlotsUI(); 
            });

            // 長按一鍵填 0 邏輯 - 長按時長更新為 1000ms (1秒)
            let holdTimer = null;
            const startHold = (e) => {
                if(e.type === 'touchstart' && navigator.vibrate) navigator.vibrate(10);
                holdTimer = setTimeout(() => {
                    holdTimer = null;
                    if(navigator.vibrate) navigator.vibrate([30, 50, 30]); // 成功微震
                    currentInputPlatform = key;
                    currentInputValues = ['-', '-', '-'];
                    submitRecordLogic();
                }, 1000);
            };
            const cancelHold = () => { if(holdTimer) { clearTimeout(holdTimer); holdTimer = null; } };
            
            btn.addEventListener('touchstart', startHold, { passive: true });
            btn.addEventListener('touchend', cancelHold);
            btn.addEventListener('touchmove', cancelHold);
            btn.addEventListener('mousedown', startHold);
            btn.addEventListener('mouseup', cancelHold);
            btn.addEventListener('mouseleave', cancelHold);

            chipsContainer.appendChild(btn);
        }
    }
    updatePlatformOptionsAvailability();
}

function updatePlatformOptionsAvailability() {
    const weekToCheck = getEntryWeekNumber(); if (!weekToCheck) return;
    const usedPlatformsThisWeek = records.filter(record => record.week === weekToCheck).map(record => record.platform);
    const availablePlatforms = Object.keys(PLATFORMS).filter(p => !hiddenPlatforms.includes(p));
    const allCompleted = availablePlatforms.length > 0 && availablePlatforms.every(p => usedPlatformsThisWeek.includes(p));
    
    if (allCompleted) {
        if(allDOMElements.addRecordSection) allDOMElements.addRecordSection.style.display = 'none';
        if(allDOMElements.allCompletedMsg) allDOMElements.allCompletedMsg.classList.remove('hidden');
    } else {
        if(allDOMElements.addRecordSection) allDOMElements.addRecordSection.style.display = 'flex';
        if(allDOMElements.allCompletedMsg) allDOMElements.allCompletedMsg.classList.add('hidden');
    }
    
    document.querySelectorAll('.platform-chip').forEach(chip => {
        if (usedPlatformsThisWeek.includes(chip.dataset.platform)) {
            chip.style.display = 'none';
            if(currentInputPlatform === chip.dataset.platform) { currentInputPlatform = ''; updateCouponSlotsUI(); }
        } else { chip.style.display = 'flex'; chip.disabled = false; chip.style.opacity = '1'; chip.style.cursor = 'pointer'; }
    });
}

function loadCachedData(uid) {
    const cachedRecords = localStorage.getItem(`recordsCache_${uid}`);
    if (cachedRecords) { try { records = JSON.parse(cachedRecords); refreshUI(); } catch (e) { records = []; } }
}

// --- Firebase Lazy Load Core ---
async function lazyLoadFirebase() {
    try {
        FB.app = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
        FB.auth = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        FB.fs = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
        
        const appInstance = FB.app.initializeApp(firebaseConfig);
        const authInstance = FB.auth.getAuth(appInstance);
        const dbInstance = FB.fs.getFirestore(appInstance);
        
        FB.dbInstance = dbInstance; // 保存參考供其他函數調用
        
        try { await FB.fs.enableIndexedDbPersistence(dbInstance); } catch(e) { console.warn("離線持久化啟動失敗", e); }
        
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await FB.auth.signInWithCustomToken(authInstance, __initial_auth_token);
        else await FB.auth.signInAnonymously(authInstance);

        FB.auth.onAuthStateChanged(authInstance, (user) => {
            if (user) {
                const savedUserId = localStorage.getItem('savedUserId');
                currentUserId = savedUserId || user.uid;
                if (!savedUserId) localStorage.setItem('savedUserId', currentUserId);
                allDOMElements.userIdInput.value = currentUserId;
            
                loadCachedData(currentUserId);
                syncRecords(currentUserId);
            } else {
                allDOMElements.recordsList.innerHTML = '<div class="col-span-full text-center py-8 text-red-500 font-bold">用戶驗證失敗。</div>';
                allDOMElements.recordsList.setAttribute('aria-busy', 'false');
            }
        });
    } catch(error) {
        console.error("Firebase 初始化失敗:", error);
    }
}

async function migrateDataIfNeeded(uid) {
    if(!FB.fs) return;
    const oldRecordsCol = FB.fs.collection(FB.dbInstance, 'artifacts', appId, 'users', uid, 'records');
    const userDocRef = FB.fs.doc(FB.dbInstance, 'artifacts', appId, 'users', uid, 'appData', 'recordsDoc');
    try {
        const snapshot = await FB.fs.getDocs(oldRecordsCol);
        if (!snapshot.empty) {
            const batch = FB.fs.writeBatch(FB.dbInstance);
            const newRecordsFormat = {};
            snapshot.forEach(docSnap => { newRecordsFormat[docSnap.id] = { id: docSnap.id, ...docSnap.data() }; batch.delete(docSnap.ref); });
            batch.set(userDocRef, { records: newRecordsFormat }, { merge: true }); 
            await batch.commit(); 
        }
    } catch (e) {}
}

async function syncRecords(uid) {
    if (unsubscribeFromRecords) unsubscribeFromRecords(); 
    if (!uid || !FB.fs) return;
    await migrateDataIfNeeded(uid);
    try {
        const userDocRef = FB.fs.doc(FB.dbInstance, 'artifacts', appId, 'users', uid, 'appData', 'recordsDoc');
        unsubscribeFromRecords = FB.fs.onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) { records = Object.values(docSnap.data().records || {}); } 
            else { records = []; }
            localStorage.setItem(`recordsCache_${uid}`, JSON.stringify(records));
            refreshUI();

            if (isInitialLoad) {
                const today = new Date(); const day = today.getDay();
                if (day === 0 || day === 5 || day === 6) {
                    const currentWeek = getWeekNumber(today);
                    const usedPlatformsThisWeek = records.filter(record => record.week === currentWeek).map(record => record.platform);
                    const availablePlatforms = Object.keys(PLATFORMS).filter(p => !hiddenPlatforms.includes(p));
                    const allCompleted = availablePlatforms.length > 0 && availablePlatforms.every(p => usedPlatformsThisWeek.includes(p));
                    if (!allCompleted && allDOMElements.recordPanel.classList.contains('hidden')) {
                        allDOMElements.toggleRecordPanelBtn.click();
                    }
                }
                isInitialLoad = false;
            }
        }, (error) => { showAlertDialog("無法連接到伺服器，目前顯示的是離線資料。"); });
    } catch (error) { console.error("設置同步監聽器失敗:", error); }
}

async function safeUpdateRecordDoc(updatesObject, fallbackSetData) {
    if (!currentUserId || !FB.fs) throw new Error("尚未驗證用戶");
    const userDocRef = FB.fs.doc(FB.dbInstance, 'artifacts', appId, 'users', currentUserId, 'appData', 'recordsDoc');
    try { await FB.fs.updateDoc(userDocRef, updatesObject); } 
    catch (e) {
        if (e.code === 'not-found' && fallbackSetData) { await FB.fs.setDoc(userDocRef, fallbackSetData, { merge: true }); } 
        else throw e;
    }
}

function scheduleWrite(docId, updatedUsedCoupons) {
    pendingWrites[`records.${docId}.usedCoupons`] = updatedUsedCoupons;
    if (writeTimeout) clearTimeout(writeTimeout);
    writeTimeout = setTimeout(async () => {
        if (Object.keys(pendingWrites).length === 0) return;
        const updatesToApply = { ...pendingWrites }; pendingWrites = {};
        try { await safeUpdateRecordDoc(updatesToApply, null); } catch(err) { announceStatus("網路不穩定，部分狀態儲存失敗"); }
    }, 1000); 
}

// --- 設定功能 ---
function loadSettings() { 
    hiddenPlatforms = JSON.parse(localStorage.getItem('hiddenPlatforms') || '[]');
    localStorage.setItem('platformsCache', JSON.stringify(PLATFORMS));
    renderPlatformOptions(); 
}
allDOMElements.settingsBtn.addEventListener('click', () => {
    allDOMElements.platformSettingsEl.innerHTML = '';
    for (const key in PLATFORMS) {
        const isHidden = hiddenPlatforms.includes(key);
        allDOMElements.platformSettingsEl.innerHTML += `<label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><md-checkbox value="${key}" ${!isHidden ? 'checked' : ''} class="platform-toggle"></md-checkbox><span class="font-medium">${PLATFORMS[key]}</span></label>`;
    }
    allDOMElements.settingsDialog.show();
});
allDOMElements.cancelSettingsBtn.addEventListener('click', () => allDOMElements.settingsDialog.close());
allDOMElements.saveSettingsBtn.addEventListener('click', () => {
    hiddenPlatforms = Array.from(document.querySelectorAll('.platform-toggle')).filter(cb => !cb.checked).map(cb => cb.value);
    localStorage.setItem('hiddenPlatforms', JSON.stringify(hiddenPlatforms));
    renderPlatformOptions(); refreshUI(); allDOMElements.settingsDialog.close(); announceStatus("平台顯示設定已儲存。");
});

function getChartJsThemeOptions() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDarkMode ? '#9ca3af' : '#6b7280';
    const titleColor = isDarkMode ? '#f3f4f6' : '#1f2937';

    return {
        color: textColor, borderColor: gridColor,
        plugins: {
            legend: { labels: { color: textColor, font: { family: "'Noto Sans TC', sans-serif" } } },
            title: { color: titleColor, font: { family: "'Noto Sans TC', sans-serif", size: 16, weight: 'bold' } },
            tooltip: { 
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)', 
                titleColor: isDarkMode ? '#f8fafc' : '#0f172a', 
                bodyColor: isDarkMode ? '#cbd5e1' : '#334155', 
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0,0,0,0.12)', 
                borderWidth: 1, 
                padding: 10, 
                cornerRadius: 8, 
                titleFont: { family: "'Noto Sans TC', sans-serif", size: 14, weight: 'bold' }, 
                bodyFont: { family: "'Noto Sans TC', sans-serif", size: 13 } 
            },
            datalabels: { color: textColor, font: { weight: 'bold', family: "'Noto Sans TC', sans-serif" } }
        },
        scales: { x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "'Noto Sans TC', sans-serif" } } }, y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "'Noto Sans TC', sans-serif" } } } }
    };
}

const hexToRgbA = (hex, alpha) => {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex.trim())){
        c = hex.trim().substring(1).split(''); if(c.length== 3){ c= [c[0], c[0], c[1], c[1], c[2], c[2]]; }
        c = '0x'+c.join(''); return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return `rgba(25, 118, 210, ${alpha})`;
};

function initGlobalStatsDialog() {
    const select = allDOMElements.globalStatsWeekFilter;
    select.innerHTML = '';
    const weeks = Object.keys(GLOBAL_STATS_DATA).sort((a, b) => parseInt(b) - parseInt(a));
    weeks.forEach(week => { select.innerHTML += `<md-select-option value="${week}">第 ${week} 周</md-select-option>`; });
    if(weeks.length > 0) select.value = weeks[0]; 
}

// Lazy load Chart.js and DataLabels before showing
allDOMElements.globalStatsBtn.addEventListener('click', async () => {
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    await loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js');
    initGlobalStatsDialog(); renderGlobalStats(allDOMElements.globalStatsWeekFilter.value); allDOMElements.globalStatsDialog.show();
});

allDOMElements.closeGlobalStatsBtn.addEventListener('click', () => allDOMElements.globalStatsDialog.close());
allDOMElements.globalStatsWeekFilter.addEventListener('change', (e) => renderGlobalStats(e.target.value));

function renderGlobalStats(week) {
    const weekData = GLOBAL_STATS_DATA[week]; if (!weekData) return;
    const data = weekData.stats; const overview = weekData.overview;
    if (allDOMElements.globalStatsCutoff) allDOMElements.globalStatsCutoff.textContent = `資料截止時間：${weekData.cutoff}`;

    const overviewEl = allDOMElements.globalStatsOverview;
    if (overview) {
        overviewEl.style.display = 'grid';
        overviewEl.innerHTML = `
            <div class="glass-card flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl shadow-sm">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">groups</span> 總用戶數</span>
                <span class="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">${overview.totalUsers}</span>
            </div>
            <div class="glass-card flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl shadow-sm">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">celebration</span> 中≥200元人數</span>
                <span class="text-lg sm:text-xl font-black text-yellow-600 dark:text-yellow-400 tabular-nums">${overview.usersWith200}</span>
            </div>
            <div class="glass-card flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl shadow-sm">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">stars</span> 單人最高金額</span>
                <span class="text-lg sm:text-xl font-black text-green-600 dark:text-green-400 tabular-nums">${overview.maxUserAmount}</span>
            </div>
            <div class="glass-card flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl shadow-sm">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">functions</span> 抽到金額平均</span>
                <span class="text-lg sm:text-xl font-black tabular-nums" style="color: var(--theme-color-primary);">${overview.avgUserAmount}</span>
            </div>
            <div class="glass-card flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl shadow-sm">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">vertical_align_center</span> 金額中位數</span>
                <span class="text-lg sm:text-xl font-black tabular-nums" style="color: var(--theme-color-primary);">${overview.medianUserAmount}</span>
            </div>
            <div class="glass-card flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl shadow-sm">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">apps</span> 人均使用平台</span>
                <span class="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 tabular-nums">${overview.avgPlatformsPerUser}</span>
            </div>
        `;
    } else { overviewEl.style.display = 'none'; }

    const tbody = allDOMElements.globalStatsTbody; tbody.innerHTML = '';
    const availablePlatforms = Object.keys(PLATFORMS).filter(p => data[p]);
    const ranks = {}; const metrics = ['p0', 'p10', 'p20', 'p50', 'p100', 'p200', 'exp'];
    metrics.forEach(metric => {
        const sorted = [...availablePlatforms].sort((a, b) => data[b][metric] - data[a][metric]);
        ranks[metric] = {}; let currentRank = 1; let previousValue = null; let actualPosition = 1;
        sorted.forEach(p => {
            const val = data[p][metric];
            if (previousValue !== null && val < previousValue) currentRank = actualPosition;
            ranks[metric][p] = currentRank; previousValue = val; actualPosition++;
        });
    });

    const getRankBadge = (metric, platform) => {
        const rank = ranks[metric][platform]; let content = '';
        if (rank === 1) content = `<span class="inline-flex items-center justify-center w-[14px] h-[14px] text-[9px] font-bold rounded-full bg-yellow-500 text-white shadow-sm" title="第1高">1</span>`;
        else if (rank === 2) content = `<span class="inline-flex items-center justify-center w-[14px] h-[14px] text-[9px] font-bold rounded-full bg-slate-400 text-white shadow-sm" title="第2高">2</span>`;
        else if (rank === 3) content = `<span class="inline-flex items-center justify-center w-[14px] h-[14px] text-[9px] font-bold rounded-full bg-amber-600 text-white shadow-sm" title="第3高">3</span>`;
        return `<span class="inline-block w-[16px] ml-0.5 text-left align-middle tabular-nums">${content}</span>`;
    };

    let maxEvPlatform = availablePlatforms[0]; let max0Platform = availablePlatforms[0]; let max200Platform = availablePlatforms[0];
    availablePlatforms.forEach(p => {
        const d = data[p];
        if (d.exp > data[maxEvPlatform].exp) maxEvPlatform = p; if (d.p0 > data[max0Platform].p0) max0Platform = p; if (d.p200 > data[max200Platform].p200) max200Platform = p;
        tbody.innerHTML += `
            <tr>
                <td class="p-2 sm:p-3 sticky-col">${PLATFORMS[p]}</td>
                <td class="p-2 sm:p-3 text-center border-l tabular-nums" style="border-color: var(--color-border);"><span class="inline-flex items-center justify-center">${(d.p0 * 100).toFixed(1)}%${getRankBadge('p0', p)}</span></td>
                <td class="p-2 sm:p-3 text-center tabular-nums"><span class="inline-flex items-center justify-center">${(d.p10 * 100).toFixed(1)}%${getRankBadge('p10', p)}</span></td>
                <td class="p-2 sm:p-3 text-center tabular-nums"><span class="inline-flex items-center justify-center">${(d.p20 * 100).toFixed(1)}%${getRankBadge('p20', p)}</span></td>
                <td class="p-2 sm:p-3 text-center tabular-nums"><span class="inline-flex items-center justify-center">${(d.p50 * 100).toFixed(1)}%${getRankBadge('p50', p)}</span></td>
                <td class="p-2 sm:p-3 text-center tabular-nums"><span class="inline-flex items-center justify-center">${(d.p100 * 100).toFixed(1)}%${getRankBadge('p100', p)}</span></td>
                <td class="p-2 sm:p-3 text-center tabular-nums"><span class="inline-flex items-center justify-center">${(d.p200 * 100).toFixed(2)}%${getRankBadge('p200', p)}</span></td>
                <td class="p-2 sm:p-3 text-center text-blue-600 font-bold border-l tabular-nums" style="border-color: var(--color-border);"><span class="inline-flex items-center justify-center">${d.exp.toFixed(1)}${getRankBadge('exp', p)}</span></td>
                <td class="p-2 sm:p-3 text-center text-gray-500 border-l tabular-nums" style="border-color: var(--color-border);">${formatNumber(d.draws)}</td>
                <td class="p-2 sm:p-3 text-center tabular-nums">${(d.userShare * 100).toFixed(1)}%</td>
                <td class="p-2 sm:p-3 text-center font-bold tabular-nums" style="color: var(--theme-color-primary);">${(d.amtShare * 100).toFixed(1)}%</td>
            </tr>
        `;
    });

    const top3Platforms = [...availablePlatforms].sort((a, b) => data[b].draws - data[a].draws).slice(0, 3);
    const top3HTML = top3Platforms.map((p, i) => `<div class="flex justify-between items-center"><span class="opacity-80">${i+1}. ${p}</span><span class="font-bold text-base tabular-nums">${formatNumber(data[p].draws)}</span></div>`).join('');

    const funFactEl = document.getElementById('globalStatsFunFact');
    funFactEl.innerHTML = `
        <h4 class="font-bold text-base sm:text-lg mb-4 flex items-center gap-2" style="color: var(--theme-color-summary-text);">
            <span class="material-symbols-outlined">lightbulb</span> 第 ${week} 周全網抽獎大數據
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm" style="color: var(--theme-color-summary-text);">
            <div class="glass-card flex flex-col gap-1 p-4 rounded-xl shadow-sm">
                <span class="flex items-center gap-1 font-bold opacity-80 text-[13px]"><span class="material-symbols-outlined text-[18px] text-green-500">trending_up</span> 最高期望值(MOP)</span>
                <div class="flex items-baseline gap-2 mt-auto pt-2"><strong class="text-2xl">${maxEvPlatform}</strong><span class="text-3xl font-black text-green-600 dark:text-green-400 leading-none tabular-nums">${data[maxEvPlatform].exp.toFixed(1)}</span></div>
            </div>
            <div class="glass-card flex flex-col gap-1 p-4 rounded-xl shadow-sm">
                <span class="flex items-center gap-1 font-bold opacity-80 text-[13px]"><span class="material-symbols-outlined text-[18px] text-gray-500">sentiment_dissatisfied</span> 最容易中0元</span>
                <div class="flex items-baseline gap-2 mt-auto pt-2"><strong class="text-2xl">${max0Platform}</strong><span class="text-3xl font-black text-gray-600 dark:text-gray-400 leading-none tabular-nums">${(data[max0Platform].p0 * 100).toFixed(1)}%</span></div>
            </div>
            <div class="glass-card flex flex-col gap-1 p-4 rounded-xl shadow-sm">
                <span class="flex items-center gap-1 font-bold opacity-80 text-[13px]"><span class="material-symbols-outlined text-[18px] text-yellow-500">workspace_premium</span> 最容易中200元</span>
                <div class="flex items-baseline gap-2 mt-auto pt-2"><strong class="text-2xl">${max200Platform}</strong><span class="text-3xl font-black text-yellow-600 dark:text-yellow-400 leading-none tabular-nums">${(data[max200Platform].p200 * 100).toFixed(2)}%</span></div>
            </div>
            <div class="glass-card flex flex-col gap-1 p-4 rounded-xl shadow-sm">
                <span class="flex items-center gap-1 font-bold opacity-80 text-[13px] mb-2"><span class="material-symbols-outlined text-[18px] text-blue-500">format_list_numbered</span> 第 ${week} 周抽獎次數排名</span>
                <div class="flex flex-col gap-1.5 mt-auto">${top3HTML}</div>
            </div>
        </div>
    `;

    if (!window.Chart || !window.ChartDataLabels) return;
    const chartTheme = getChartJsThemeOptions();

    if (globalCouponChart) globalCouponChart.destroy();
    const couponCtx = document.getElementById('globalCouponChart').getContext('2d');
    const couponTiers = ['0', '10', '20', '50', '100', '200'];
    const couponColors = { '0': '#F6F6F6', '10': '#BA4040', '20': '#6F4E9F', '50': '#825211', '100': '#3C72A1', '200': '#E18C1F' };

    globalCouponChart = new Chart(couponCtx, {
        type: 'bar',
        data: {
            labels: availablePlatforms.map(p => PLATFORMS[p]),
            datasets: couponTiers.map(tier => ({
                label: `${tier}元`, data: availablePlatforms.map(p => data[p][`p${tier}`] * 100), backgroundColor: couponColors[tier], borderWidth: tier === '0' ? 1 : 0, borderColor: tier === '0' ? '#e5e7eb' : 'transparent'
            }))
        },
        options: {
            ...chartTheme, responsive: true, maintainAspectRatio: false,
            scales: { x: { ...chartTheme.scales.x, stacked: true }, y: { ...chartTheme.scales.y, stacked: true, max: 100, ticks: { ...chartTheme.scales.y.ticks, callback: v => v + '%' } } },
            plugins: { ...chartTheme.plugins, legend: { display: true, position: 'bottom', labels: { ...chartTheme.plugins.legend.labels, boxWidth: 12 } }, datalabels: { ...chartTheme.plugins.datalabels, formatter: (v) => v >= 5 ? v.toFixed(0) + '%' : '', color: '#fff' } }
        }
    });

    if (globalShareChart) globalShareChart.destroy();
    const shareCtx = document.getElementById('globalShareChart').getContext('2d');
    globalShareChart = new Chart(shareCtx, {
        type: 'doughnut',
        data: {
            labels: availablePlatforms.map(p => PLATFORMS[p]),
            datasets: [{ data: availablePlatforms.map(p => data[p].amtShare * 100), backgroundColor: availablePlatforms.map(p => PLATFORM_COLORS[p]), borderColor: document.documentElement.style.getPropertyValue('--color-surface'), borderWidth: 2, hoverOffset: 4 }]
        },
        options: { ...chartTheme, responsive: true, maintainAspectRatio: false, cutout: '50%', plugins: { ...chartTheme.plugins, legend: { display: true, position: 'right', labels: { ...chartTheme.plugins.legend.labels, boxWidth: 12 } }, datalabels: { ...chartTheme.plugins.datalabels, formatter: (v, ctx) => { const total = ctx.chart.getDatasetMeta(0).total; if (total === 0) return ''; const percent = v / total; if (percent < 0.03) return ''; const fullLabel = ctx.chart.data.labels[ctx.dataIndex]; const shortLabel = fullLabel.replace(/^[a-zA-Z]+/g, '').trim() || fullLabel; return shortLabel + '\n' + v.toFixed(1) + '%'; }, color: '#fff', font: { weight: 'bold', size: 11, family: "'Noto Sans TC', sans-serif" }, textAlign: 'center' } } }
    });
}

function renderCharts(week) {
    if (!window.Chart || !window.ChartDataLabels) return;
    Chart.register(ChartDataLabels);

    const chartTheme = getChartJsThemeOptions();
    const totalAmountAllWeeks = records.reduce((sum, r) => sum + (parseInt(r.draw1) || 0) + (parseInt(r.draw2) || 0) + (parseInt(r.draw3) || 0), 0);
    const statsTotalEl = document.getElementById('stats-total-amount');
    if (statsTotalEl) { statsTotalEl.textContent = `MOP ${formatNumber(totalAmountAllWeeks)}`; statsTotalEl.style.color = document.documentElement.style.getPropertyValue('--theme-color-primary'); }

    const filtered = week === 'all' ? records : records.filter(r => r.week.toString() === week);
    
    const couponOrder =
