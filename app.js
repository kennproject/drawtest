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

// 修正：補上 UePay 的 Android Intent 連結
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

const THEMES = {
    orange: { primary: '#BF7B49', title: '#F4A261', summaryBg: '#FEF5ED', summaryBorder: '#F4A261', summaryText: '#9A6234' },
    red: { primary: '#D32F2F', title: '#F44336', summaryBg: '#FFEBEE', summaryBorder: '#F44336', summaryText: '#C62828' },
    blue: { primary: '#1976D2', title: '#2196F3', summaryBg: '#E3F2FD', summaryBorder: '#2196F3', summaryText: '#1565C0' },
    yellow: { primary: '#FBC02D', title: '#FFEB3B', summaryBg: '#FFFDE7', summaryBorder: '#FFEB3B', summaryText: '#F57F17' },
    purple: { primary: '#7B1FA2', title: '#9C27B0', summaryBg: '#F3E5F5', summaryBorder: '#9C27B0', summaryText: '#6A1B9A' },
    green: { primary: '#388E3C', title: '#4CAF50', summaryBg: '#E8F5E9', summaryBorder: '#4CAF50', summaryText: '#2E7D32' },
};

const RAW_DATA_WEEK_1 = `Alipay,0.458,0.217,0.226,0.081,0.014,0.005,39.23,816,0.518,0.104\nBOC,0.116,0.369,0.332,0.159,0.016,0.008,64.69,1287,0.817,0.271\nGFB,0.339,0.305,0.224,0.101,0.029,0.003,48.22,314,0.199,0.049\nICBC,0.263,0.402,0.242,0.073,0.017,0.003,44.48,925,0.587,0.134\nLuso,0.395,0.318,0.209,0.067,0.009,0.003,36.58,526,0.334,0.063\nMPay,0.232,0.379,0.273,0.091,0.018,0.006,50.56,1291,0.820,0.213\nTFB,0.372,0.247,0.257,0.100,0.017,0.007,47.36,636,0.404,0.098\nUePay,0.360,0.359,0.237,0.028,0.011,0.005,35.58,581,0.369,0.067`;
const RAW_DATA_WEEK_2 = `Alipay,0.410,0.281,0.200,0.098,0.010,0.001,38.90,935,0.618,0.119\nBOC,0.224,0.399,0.299,0.066,0.008,0.003,43.90,1325,0.876,0.191\nGFB,0.338,0.281,0.244,0.108,0.022,0.007,50.20,409,0.271,0.067\nICBC,0.301,0.376,0.242,0.061,0.016,0.003,41.60,1075,0.711,0.147\nLuso,0.500,0.258,0.190,0.044,0.006,0.001,28.49,669,0.442,0.063\nMPay,0.373,0.208,0.293,0.105,0.014,0.008,48.59,1317,0.871,0.210\nTFB,0.367,0.264,0.246,0.096,0.017,0.011,48.55,771,0.510,0.123\nUePay,0.404,0.353,0.193,0.028,0.016,0.007,35.17,688,0.455,0.079`;
const RAW_DATA_WEEK_3 = `Alipay,0.404,0.370,0.172,0.045,0.007,0.002,31.47,994,0.685,0.116\nBOC,0.148,0.568,0.223,0.052,0.006,0.003,41.49,1327,0.914,0.203\nGFB,0.333,0.393,0.160,0.092,0.015,0.008,44.28,437,0.301,0.072\nICBC,0.307,0.497,0.149,0.041,0.003,0.003,32.61,1117,0.769,0.135\nLuso,0.472,0.350,0.129,0.044,0.005,0.000,26.58,734,0.506,0.072\nMPay,0.208,0.535,0.198,0.051,0.006,0.003,39.03,1360,0.937,0.196\nTFB,0.337,0.398,0.182,0.067,0.010,0.007,40.17,805,0.554,0.119\nUePay,0.426,0.364,0.161,0.031,0.012,0.005,32.13,733,0.505,0.087`;
const RAW_DATA_WEEK_4 = `Alipay,0.437,0.358,0.153,0.045,0.006,0.001,29.15,971,0.676,0.103\nBOC,0.119,0.599,0.213,0.059,0.006,0.004,43.80,1312,0.914,0.209\nGFB,0.339,0.374,0.183,0.086,0.011,0.005,41.77,440,0.306,0.067\nICBC,0.294,0.544,0.130,0.026,0.004,0.002,30.33,1107,0.771,0.122\nLuso,0.496,0.334,0.130,0.035,0.002,0.003,25.61,711,0.495,0.066\nMPay,0.210,0.508,0.186,0.074,0.011,0.011,47.41,1334,0.929,0.230\nTFB,0.294,0.409,0.193,0.087,0.008,0.009,44.39,782,0.545,0.126\nUePay,0.455,0.354,0.148,0.028,0.010,0.006,30.19,700,0.487,0.077`;
const RAW_DATA_WEEK_5 = `Alipay,0.418,0.376,0.149,0.050,0.006,0.002,30.60,946,0.696,0.105\nBOC,0.151,0.556,0.213,0.067,0.009,0.004,44.67,1247,0.918,0.202\nGFB,0.357,0.381,0.154,0.079,0.021,0.009,43.92,421,0.310,0.067\nICBC,0.310,0.461,0.149,0.075,0.004,0.001,35.94,1061,0.781,0.139\nLuso,0.456,0.374,0.130,0.034,0.004,0.002,26.34,713,0.525,0.068\nMPay,0.154,0.503,0.241,0.091,0.006,0.004,47.55,1253,0.922,0.216\nTFB,0.309,0.409,0.189,0.071,0.014,0.009,43.44,784,0.577,0.124\nUePay,0.466,0.338,0.148,0.030,0.011,0.007,30.91,696,0.512,0.078`;

function parseRawCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const stats = {};
    lines.forEach(line => {
        const cols = line.split(/,|\t/).map(c => c.trim().replace(/"/g, ''));
        const platform = cols[0];
        if (PLATFORMS[platform]) {
            stats[platform] = {
                p0: parseFloat(cols[1]) || 0, p10: parseFloat(cols[2]) || 0, p20: parseFloat(cols[3]) || 0,
                p50: parseFloat(cols[4]) || 0, p100: parseFloat(cols[5]) || 0, p200: parseFloat(cols[6]) || 0,
                exp: parseFloat(cols[7]) || 0, draws: parseInt(cols[8]) || 0, userShare: parseFloat(cols[9]) || 0, amtShare: parseFloat(cols[10]) || 0
            };
        }
    });
    return stats;
}

const GLOBAL_STATS_DATA = {
    "1": { cutoff: "2026年4月13日0時", overview: { totalUsers: "1,575", usersWith200: "89", maxUserAmount: "950", avgUserAmount: "195", medianUserAmount: "160", avgPlatformsPerUser: "4" }, stats: parseRawCSV(RAW_DATA_WEEK_1) },
    "2": { cutoff: "2026年4月20日0時", overview: { totalUsers: "1,512", usersWith200: "98", maxUserAmount: "1,010", avgUserAmount: "201", medianUserAmount: "170", avgPlatformsPerUser: "4.75" }, stats: parseRawCSV(RAW_DATA_WEEK_2) },
    "3": { cutoff: "2026年4月27日0時", overview: { totalUsers: "1,452", usersWith200: "75", maxUserAmount: "690", avgUserAmount: "186", medianUserAmount: "160", avgPlatformsPerUser: "4.7" }, stats: parseRawCSV(RAW_DATA_WEEK_3) },
    "4": { cutoff: "2026年5月7日23:00", overview: { totalUsers: "1,436", usersWith200: "108", maxUserAmount: "840", avgUserAmount: "192", medianUserAmount: "160", avgPlatformsPerUser: "5.12" }, stats: parseRawCSV(RAW_DATA_WEEK_4) },
    "5": { cutoff: "2026年5月11日00:30", overview: { totalUsers: "1,359", usersWith200: "108", maxUserAmount: "760", avgUserAmount: "202", medianUserAmount: "180", avgPlatformsPerUser: "5.24" }, stats: parseRawCSV(RAW_DATA_WEEK_5) }
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
    globalStatsDialogForm: document.getElementById('globalStatsDialogForm'), downloadGlobalStatsBtn: document.getElementById('downloadGlobalStatsBtn'),
    themeBtn: document.getElementById('themeBtn'), themeDialog: document.getElementById('themeDialog'), themeOptions: document.getElementById('theme-options'), darkModeSwitch: document.getElementById('darkModeSwitch'),
    alertDialog: document.getElementById('alertDialog'), alertTitle: document.getElementById('alertTitle'), alertMessage: document.getElementById('alertMessage'),
    confirmDialog: document.getElementById('confirmDialog'), confirmTitle: document.getElementById('confirmTitle'), confirmMessage: document.getElementById('confirmMessage'),
    addFavoriteBtn: document.getElementById('addFavoriteBtn'), addToHomeScreenBtn: document.getElementById('addToHomeScreenBtn'), exportCsvBtn: document.getElementById('exportCsvBtn'), 
    calculatorBtn: document.getElementById('calculatorBtn'), calculatorDialog: document.getElementById('calculatorDialog'), spendingAmountInput: document.getElementById('spendingAmountInput'), calculatorResult: document.getElementById('calculatorResult'), calculateBtn: document.getElementById('calculateBtn'), markAsUsedBtn: document.getElementById('markAsUsedBtn'), cancelCalculatorBtn: document.getElementById('cancelCalculator'), statusAnnouncer: document.getElementById('status-announcer'),
};

function announceStatus(message) { allDOMElements.statusAnnouncer.textContent = message; }

function showLoadingSkeleton() {
    const { recordsList } = allDOMElements;
    recordsList.innerHTML = ''; recordsList.setAttribute('aria-busy', 'true');
    for (let i = 0; i < 6; i++) {
        const card = document.createElement('div');
        // 加入更緊湊高度的 Skeleton
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
            <div class="col-span-full flex flex-col items-center justify-center py-12 gap-3 stagger-card">
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
        cardContainer.className = `swipe-container stagger-card`;
        cardContainer.style.animationDelay = `${index * 0.05}s`;
        
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

        // 調整按鈕高度：h-12 sm:h-14
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
                // 滑動超過 5px 才顯示紅色底，完美解決平時邊緣透色問題
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

            // 長按一鍵填 0 邏輯
            let holdTimer = null;
            const startHold = (e) => {
                if(e.type === 'touchstart' && navigator.vibrate) navigator.vibrate(10);
                holdTimer = setTimeout(() => {
                    holdTimer = null;
                    if(navigator.vibrate) navigator.vibrate([30, 50, 30]); // 成功微震
                    currentInputPlatform = key;
                    currentInputValues = ['-', '-', '-'];
                    submitRecordLogic();
                }, 600);
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
            tooltip: { backgroundColor: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', titleColor: isDarkMode ? '#f8fafc' : '#0f172a', bodyColor: isDarkMode ? '#cbd5e1' : '#334155', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderWidth: 1, padding: 10, cornerRadius: 8, titleFont: { family: "'Noto Sans TC', sans-serif", size: 14, weight: 'bold' }, bodyFont: { family: "'Noto Sans TC', sans-serif", size: 13 } },
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
            <div class="flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl border shadow-sm" style="border-color: var(--color-border); background-color: var(--color-surface);">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">groups</span> 總用戶數</span>
                <span class="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">${overview.totalUsers}</span>
            </div>
            <div class="flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl border shadow-sm" style="border-color: var(--color-border); background-color: var(--color-surface);">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">celebration</span> 中≥200元人數</span>
                <span class="text-lg sm:text-xl font-black text-yellow-600 dark:text-yellow-400 tabular-nums">${overview.usersWith200}</span>
            </div>
            <div class="flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl border shadow-sm" style="border-color: var(--color-border); background-color: var(--color-surface);">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">stars</span> 單人最高金額</span>
                <span class="text-lg sm:text-xl font-black text-green-600 dark:text-green-400 tabular-nums">${overview.maxUserAmount}</span>
            </div>
            <div class="flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl border shadow-sm" style="border-color: var(--color-border); background-color: var(--color-surface);">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">functions</span> 抽到金額平均</span>
                <span class="text-lg sm:text-xl font-black tabular-nums" style="color: var(--theme-color-primary);">${overview.avgUserAmount}</span>
            </div>
            <div class="flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl border shadow-sm" style="border-color: var(--color-border); background-color: var(--color-surface);">
                <span class="text-[11px] sm:text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">vertical_align_center</span> 金額中位數</span>
                <span class="text-lg sm:text-xl font-black tabular-nums" style="color: var(--theme-color-primary);">${overview.medianUserAmount}</span>
            </div>
            <div class="flex flex-col justify-center items-center py-2 sm:py-3 rounded-xl border shadow-sm" style="border-color: var(--color-border); background-color: var(--color-surface);">
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
            <div class="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-[#1c2128] shadow-sm border" style="border-color: var(--color-border);">
                <span class="flex items-center gap-1 font-bold opacity-80 text-[13px]"><span class="material-symbols-outlined text-[18px] text-green-500">trending_up</span> 最高期望值(MOP)</span>
                <div class="flex items-baseline gap-2 mt-auto pt-2"><strong class="text-2xl">${maxEvPlatform}</strong><span class="text-3xl font-black text-green-600 dark:text-green-400 leading-none tabular-nums">${data[maxEvPlatform].exp.toFixed(1)}</span></div>
            </div>
            <div class="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-[#1c2128] shadow-sm border" style="border-color: var(--color-border);">
                <span class="flex items-center gap-1 font-bold opacity-80 text-[13px]"><span class="material-symbols-outlined text-[18px] text-gray-500">sentiment_dissatisfied</span> 最容易中0元</span>
                <div class="flex items-baseline gap-2 mt-auto pt-2"><strong class="text-2xl">${max0Platform}</strong><span class="text-3xl font-black text-gray-600 dark:text-gray-400 leading-none tabular-nums">${(data[max0Platform].p0 * 100).toFixed(1)}%</span></div>
            </div>
            <div class="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-[#1c2128] shadow-sm border" style="border-color: var(--color-border);">
                <span class="flex items-center gap-1 font-bold opacity-80 text-[13px]"><span class="material-symbols-outlined text-[18px] text-yellow-500">workspace_premium</span> 最容易中200元</span>
                <div class="flex items-baseline gap-2 mt-auto pt-2"><strong class="text-2xl">${max200Platform}</strong><span class="text-3xl font-black text-yellow-600 dark:text-yellow-400 leading-none tabular-nums">${(data[max200Platform].p200 * 100).toFixed(2)}%</span></div>
            </div>
            <div class="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-[#1c2128] shadow-sm border" style="border-color: var(--color-border);">
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
    
    const couponOrder = ['-', '10', '20', '50', '100', '200'];
    const couponCounts = couponOrder.reduce((acc, val) => ({ ...acc, [val]: 0 }), {});
    filtered.forEach(r => { [r.draw1, r.draw2, r.draw3].forEach(c => { if (couponCounts.hasOwnProperty(c)) couponCounts[c]++; }); });
    
    if (couponCountChart) couponCountChart.destroy();
    const couponCtx = document.getElementById('couponCountChart').getContext('2d');

    couponCountChart = new Chart(couponCtx, {
        type: 'bar',
        data: { labels: couponOrder, datasets: [{ label: '張數', data: couponOrder.map(key => couponCounts[key]), backgroundColor: ['#F6F6F6', '#BA4040', '#6F4E9F', '#825211', '#3C72A1', '#E18C1F'], borderColor: ['#e5e7eb', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'], borderWidth: [1, 0, 0, 0, 0, 0], borderRadius: 4 }] },
        options: { ...chartTheme, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }, x: {} }, plugins: { ...chartTheme.plugins, legend: { display: false }, datalabels: { ...chartTheme.plugins.datalabels, anchor: 'start', align: 'end', backgroundColor: (ctx) => document.documentElement.classList.contains('dark') ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)', color: (ctx) => document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937', borderRadius: 6, padding: 4, font: { weight: 'bold', size: 10, family: "'Noto Sans TC', sans-serif" }, textAlign: 'center', formatter: (v, ctx) => { if (v === 0) return ''; const total = ctx.dataset.data.reduce((a, b) => a + b, 0); const pct = ((v / total) * 100).toFixed(1) + '%'; return v + '\n(' + pct + ')'; } } } }
    });
    
    const platformTotals = Object.keys(PLATFORMS).reduce((acc, p) => ({...acc, [p]: 0}), {});
    filtered.forEach(r => { 
        const total = (parseInt(r.draw1) || 0) + (parseInt(r.draw2) || 0) + (parseInt(r.draw3) || 0);
        if (platformTotals[r.platform] !== undefined) platformTotals[r.platform] += total;
    });
    const sortedPlatforms = Object.entries(platformTotals).filter(([_, total]) => total > 0).sort((a, b) => b[1] - a[1]);

    if (platformTotalChart) platformTotalChart.destroy();
    platformTotalChart = new Chart(document.getElementById('platformTotalChart'), {
        type: 'doughnut',
        data: { labels: sortedPlatforms.map(p => PLATFORMS[p[0]]), datasets: [{ data: sortedPlatforms.map(p => p[1]), backgroundColor: sortedPlatforms.map(p => PLATFORM_COLORS[p[0]]), borderColor: document.documentElement.style.getPropertyValue('--color-surface'), borderWidth: 2, hoverOffset: 4 }] },
        options: { ...chartTheme, responsive: true, maintainAspectRatio: false, cutout: '40%', layout: { padding: 10 }, scales: { x: { display: false }, y: { display: false } }, plugins: { ...chartTheme.plugins, legend: { display: false }, datalabels: { ...chartTheme.plugins.datalabels, formatter: (v, ctx) => { const total = ctx.chart.getDatasetMeta(0).total; if (total === 0) return ''; const percent = v / total; if (percent < 0.04) return ''; const fullLabel = ctx.chart.data.labels[ctx.dataIndex]; const shortLabel = fullLabel.replace(/^[a-zA-Z]+/g, '').trim() || fullLabel; return shortLabel + '\n' + (percent * 100).toFixed(0) + '%'; }, color: '#fff', font: { weight: 'bold', size: 12, family: "'Noto Sans TC', sans-serif" }, textAlign: 'center' } } }
    });

    if (platformWeeklyTotalChart) platformWeeklyTotalChart.destroy();
    const allWeeks = [...new Set(records.map(r => r.week))].sort((a,b) => a-b);
    const platformsWithData = [...new Set(records.map(r => r.platform))];
    const platformWeeklyDatasets = platformsWithData.map(platform => {
        const data = allWeeks.map(week => records.filter(r => r.week === week && r.platform === platform).reduce((sum, r) => sum + (parseInt(r.draw1) || 0) + (parseInt(r.draw2) || 0) + (parseInt(r.draw3) || 0), 0));
        return { label: PLATFORMS[platform] || platform, data: data, borderColor: PLATFORM_COLORS[platform] || '#cccccc', backgroundColor: 'transparent', fill: false, tension: 0.2, pointBackgroundColor: PLATFORM_COLORS[platform] || '#cccccc', pointHoverRadius: 6, pointRadius: 4, borderWidth: 2 };
    });
    platformWeeklyTotalChart = new Chart(document.getElementById('platformWeeklyTotalChart'), { type: 'line', data: { labels: allWeeks.map(w => `第 ${w} 周`), datasets: platformWeeklyDatasets }, options: { ...chartTheme, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: {} }, plugins: { ...chartTheme.plugins, legend: { position: 'top', labels: { boxWidth: 12, padding: 15 } }, datalabels: { display: false } } } });

    if (weeklyTotalChart) weeklyTotalChart.destroy();
    const weeklyTotals = {};
    if (records.length > 0) { const maxWeek = Math.max(...records.map(r => r.week)); for(let i = 1; i <= maxWeek; i++) weeklyTotals[i] = 0; }
    records.forEach(r => { const total = (parseInt(r.draw1) || 0) + (parseInt(r.draw2) || 0) + (parseInt(r.draw3) || 0); if (weeklyTotals[r.week] !== undefined) weeklyTotals[r.week] += total; });
    const weeklyCtx = document.getElementById('weeklyTotalChart').getContext('2d');
    const primaryColorHex = document.documentElement.style.getPropertyValue('--theme-color-primary') || '#1976D2';
    const numWeeks = Object.keys(weeklyTotals).length;
    const weekColors = Object.keys(weeklyTotals).map((w, i) => hexToRgbA(primaryColorHex, numWeeks <= 1 ? 1 : 0.3 + (0.7 * (i / (numWeeks - 1)))) );

    weeklyTotalChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: { labels: Object.keys(weeklyTotals).map(w => `第 ${w} 周`), datasets: [{ label: '總金額', data: Object.values(weeklyTotals), backgroundColor: weekColors, borderWidth: 0, borderRadius: 4 }] },
        options: { ...chartTheme, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: {} }, plugins: { ...chartTheme.plugins, legend: { display: false }, datalabels: { ...chartTheme.plugins.datalabels, anchor: 'end', align: 'end', color: chartTheme.color, formatter: v => v > 0 ? formatNumber(v) : '' } } }
    });
}

allDOMElements.statsBtn.addEventListener('click', async () => {
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js'); await loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js');
    const { statsWeekFilter, statsDialog } = allDOMElements;
    statsWeekFilter.innerHTML = '<md-select-option value="all" selected>全部周數</md-select-option>';
    const weeks = [...new Set(records.map(r => r.week))].sort((a,b) => a-b);
    weeks.forEach(w => statsWeekFilter.innerHTML += `<md-select-option value="${w}">第 ${w} 周</md-select-option>`);
    renderCharts('all'); statsDialog.show();
});
allDOMElements.closeStatsDialogBtn.addEventListener('click', () => allDOMElements.statsDialog.close());
allDOMElements.statsWeekFilter.addEventListener('change', (e) => renderCharts(e.target.value));

function applyTheme(themeName) {
    const theme = THEMES[themeName]; if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--theme-color-primary', theme.primary); root.style.setProperty('--theme-color-title', theme.title); root.style.setProperty('--theme-color-summary-bg', theme.summaryBg); root.style.setProperty('--theme-color-summary-border', theme.summaryBorder); root.style.setProperty('--theme-color-summary-text', theme.summaryText);
    document.getElementById('meta-theme-color').content = theme.primary;
    localStorage.setItem('selectedTheme', themeName); updateThemeSelectionUI(themeName);
    if(allDOMElements.statsDialog.open) renderCharts(allDOMElements.statsWeekFilter.value);
    if(allDOMElements.globalStatsDialog.open) renderGlobalStats(allDOMElements.globalStatsWeekFilter.value);
    renderRecords();
}

function toggleDarkMode(enable) {
    document.documentElement.classList.toggle('dark', enable);
    localStorage.setItem('darkMode', enable ? 'enabled' : 'disabled');
    allDOMElements.darkModeSwitch.selected = enable;
    if(allDOMElements.statsDialog.open) renderCharts(allDOMElements.statsWeekFilter.value);
    if(allDOMElements.globalStatsDialog.open) renderGlobalStats(allDOMElements.globalStatsWeekFilter.value);
}

function updateThemeSelectionUI(selectedTheme) { document.querySelectorAll('.theme-dot').forEach(dot => dot.classList.toggle('selected', dot.dataset.theme === selectedTheme)); }

allDOMElements.themeBtn.addEventListener('click', () => {
    allDOMElements.themeOptions.innerHTML = '';
    Object.keys(THEMES).forEach(themeName => {
        const dot = document.createElement('div'); dot.className = 'theme-dot shadow-sm'; dot.dataset.theme = themeName; dot.style.backgroundColor = THEMES[themeName].title;
        dot.onclick = () => applyTheme(themeName); allDOMElements.themeOptions.appendChild(dot);
    });
    updateThemeSelectionUI(localStorage.getItem('selectedTheme') || 'blue');
    allDOMElements.darkModeSwitch.selected = document.documentElement.classList.contains('dark');
    allDOMElements.themeDialog.show();
});

allDOMElements.darkModeSwitch.addEventListener('change', (e) => toggleDarkMode(e.target.selected));

function findBestCouponCombination(coupons, targetAmount, strategy = 'large') {
    const platformCouponCounts = coupons.reduce((acc, coupon) => { acc[coupon.platform] = (acc[coupon.platform] || 0) + 1; return acc; }, {});
    const didClearPlatform = (combination) => {
        if (combination.length === 0) return false;
        const comboCounts = combination.reduce((acc, coupon) => { acc[coupon.platform] = (acc[coupon.platform] || 0) + 1; return acc; }, {});
        for (const platform in comboCounts) if (comboCounts[platform] === platformCouponCounts[platform]) return true;
        return false;
    };

    let bestSolution = { combination: [], value: -1, clearsPlatform: false, numPlatforms: Infinity, numCoupons: Infinity };

    if (strategy === 'clear') {
        coupons.sort((a, b) => {
            if (platformCouponCounts[a.platform] !== platformCouponCounts[b.platform]) return platformCouponCounts[a.platform] - platformCouponCounts[b.platform];
            return b.value - a.value;
        });
    } else {
        coupons.sort((a, b) => b.value - a.value);
    }

    function find(startIndex, currentAmount, currentCombination) {
        const currentValue = currentCombination.reduce((sum, c) => sum + c.value, 0);
        
        if (currentValue > bestSolution.value) {
            bestSolution = { combination: [...currentCombination], value: currentValue, clearsPlatform: didClearPlatform(currentCombination), numPlatforms: new Set(currentCombination.map(c => c.platform)).size, numCoupons: currentCombination.length };
        } else if (currentValue === bestSolution.value && currentValue > 0) {
            const currentNumCoupons = currentCombination.length;
            const currentClears = didClearPlatform(currentCombination);
            const currentNumPlatforms = new Set(currentCombination.map(c => c.platform)).size;

            if (strategy === 'clear') {
                if (currentClears && !bestSolution.clearsPlatform) { bestSolution = { combination: [...currentCombination], value: currentValue, clearsPlatform: true, numPlatforms: currentNumPlatforms, numCoupons: currentNumCoupons }; } 
                else if (currentClears === bestSolution.clearsPlatform) {
                    if (currentNumPlatforms < bestSolution.numPlatforms) { bestSolution = { combination: [...currentCombination], value: currentValue, clearsPlatform: currentClears, numPlatforms: currentNumPlatforms, numCoupons: currentNumCoupons }; }
                    else if (currentNumPlatforms === bestSolution.numPlatforms) {
                        if (currentNumCoupons < bestSolution.numCoupons) { bestSolution = { combination: [...currentCombination], value: currentValue, clearsPlatform: currentClears, numPlatforms: currentNumPlatforms, numCoupons: currentNumCoupons }; }
                    }
                }
            } else {
                if (currentNumCoupons < bestSolution.numCoupons) { bestSolution = { combination: [...currentCombination], value: currentValue, clearsPlatform: currentClears, numPlatforms: currentNumPlatforms, numCoupons: currentNumCoupons }; } 
                else if (currentNumCoupons === bestSolution.numCoupons) {
                    if (currentNumPlatforms < bestSolution.numPlatforms) { bestSolution = { combination: [...currentCombination], value: currentValue, clearsPlatform: currentClears, numPlatforms: currentNumPlatforms, numCoupons: currentNumCoupons }; } 
                    else if (currentNumPlatforms === bestSolution.numPlatforms) {
                        if (currentClears && !bestSolution.clearsPlatform) { bestSolution = { combination: [...currentCombination], value: currentValue, clearsPlatform: true, numPlatforms: currentNumPlatforms, numCoupons: currentNumCoupons }; }
                    }
                }
            }
        }

        for (let i = startIndex; i < coupons.length; i++) {
            const coupon = coupons[i];
            const requiredSpend = coupon.value * 3;
            if (currentAmount + requiredSpend <= targetAmount) {
                currentCombination.push(coupon); find(i + 1, currentAmount + requiredSpend, currentCombination); currentCombination.pop();
            }
        }
    }
    find(0, 0, []); return bestSolution.combination;
}

allDOMElements.calculatorBtn.addEventListener('click', () => {
    bestCouponCombination = []; allDOMElements.spendingAmountInput.value = ''; allDOMElements.calculatorResult.innerHTML = '請輸入上方欲消費金額後點擊「計算」。';
    allDOMElements.markAsUsedBtn.classList.add('hidden'); 
    
    const currentWeek = getWeekNumber(new Date());
    const weeklyRecords = records.filter(record => record.week === currentWeek);
    const availablePlatforms = new Set();
    weeklyRecords.forEach(record => {
        const usedCoupons = record.usedCoupons || {};
        ['draw1', 'draw2', 'draw3'].forEach(drawKey => {
            const value = parseInt(record[drawKey]);
            if (value > 0 && !usedCoupons[drawKey]) availablePlatforms.add(record.platform);
        });
    });

    const makeupSelect = document.getElementById('makeupPlatformSelect');
    makeupSelect.innerHTML = '';
    if (availablePlatforms.size === 0) {
        makeupSelect.innerHTML = '<md-select-option value="" disabled selected>本周已無可用平台</md-select-option>';
        makeupSelect.disabled = true;
    } else {
        makeupSelect.disabled = false;
        Array.from(availablePlatforms).sort().forEach((p, index) => {
            makeupSelect.innerHTML += `<md-select-option value="${p}" ${index === 0 ? 'selected' : ''}>${PLATFORMS[p] || p}</md-select-option>`;
        });
    }
    allDOMElements.calculatorDialog.show();
});

allDOMElements.cancelCalculatorBtn.addEventListener('click', () => allDOMElements.calculatorDialog.close());

allDOMElements.calculateBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const targetAmount = parseFloat(allDOMElements.spendingAmountInput.value);
    if (isNaN(targetAmount) || targetAmount <= 0) { allDOMElements.calculatorResult.innerHTML = '<div class="text-red-500 font-bold">請輸入有效的消費金額。</div>'; return; }

    const currentWeek = getWeekNumber(new Date());
    const weeklyRecords = records.filter(record => record.week === currentWeek);
    const strategyNode = document.querySelector('input[name="calcStrategy"]:checked');
    const strategy = strategyNode ? strategyNode.value : 'large';

    const availableCoupons = [];
    weeklyRecords.forEach(record => {
        const usedCoupons = record.usedCoupons || {};
        ['draw1', 'draw2', 'draw3'].forEach(drawKey => {
            const value = parseInt(record[drawKey]);
            if (value > 0 && !usedCoupons[drawKey]) availableCoupons.push({ recordId: record.id, platform: record.platform, value: value, couponKey: drawKey });
        });
    });

    if (availableCoupons.length === 0) { allDOMElements.calculatorResult.innerHTML = '<div class="font-bold opacity-70 text-gray-500">本周已經沒有可用的消費券囉！</div>'; return; }
    bestCouponCombination = findBestCouponCombination(availableCoupons, targetAmount, strategy);

    if (bestCouponCombination.length === 0) {
         allDOMElements.calculatorResult.innerHTML = '<div class="text-orange-500 font-bold mb-1">沒有找到合適的用券方案。</div><div class="text-xs text-gray-500">提示：請確認消費金額是否大於任何單張券所需的最低消費（即券面額的3倍）。</div>'; 
         return;
    }
    
    let resultHTML = `<div class="font-bold text-lg mb-3 pb-2 border-b" style="border-color: var(--color-border); color: var(--color-text-primary);">✅ 目標消費：MOP ${targetAmount}</div>`;
    resultHTML += `<div class="flex flex-col gap-2 mb-3">`;

    const groupedByPlatform = bestCouponCombination.reduce((acc, coupon) => { acc[coupon.platform] = acc[coupon.platform] || []; acc[coupon.platform].push(coupon.value); return acc; }, {});

    let totalRequiredSpend = 0;
    for (const platform in groupedByPlatform) { totalRequiredSpend += groupedByPlatform[platform].reduce((sum, val) => sum + val * 3, 0); }
    const remainingAmount = targetAmount - totalRequiredSpend;
    const makeupPlatform = document.getElementById('makeupPlatformSelect').value;

    if (remainingAmount > 0 && makeupPlatform) { if (!groupedByPlatform[makeupPlatform]) { groupedByPlatform[makeupPlatform] = []; } }
    let notificationTextLines = [];

    for (const platform in groupedByPlatform) {
        const coupons = groupedByPlatform[platform];
        let platformSpend = coupons.reduce((sum, val) => sum + val * 3, 0);
        const isMakeupPlatform = (remainingAmount > 0 && platform === makeupPlatform);
        if (isMakeupPlatform) platformSpend += remainingAmount;

        const pColor = PLATFORM_COLORS[platform] || 'var(--theme-color-primary)';
        notificationTextLines.push(`${PLATFORMS[platform] || platform}: MOP ${platformSpend}`);
        
        let makeupBadge = isMakeupPlatform ? `<span class="ml-2 text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold">含補底 ${remainingAmount.toFixed(0)}</span>` : '';
        let couponsDisplay = coupons.length > 0 ? coupons.map(c => `<span class="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 font-mono font-bold text-gray-700 dark:text-gray-300 shadow-sm">${c}</span>`).join('') : `<span class="text-xs text-gray-400 italic">無 (純補底)</span>`;

        resultHTML += `
        <div class="p-2.5 rounded-lg border flex flex-col gap-1.5 bg-white dark:bg-[#1c2128]" style="border-color: ${pColor}; border-left-width: 4px;">
            <div class="flex justify-between items-center w-full">
                <div class="font-bold text-[15px] truncate flex items-center gap-2" style="color: ${pColor};">
                    <img src="${PLATFORM_ICONS[platform]}" alt="${PLATFORMS[platform] || platform}" class="w-6 h-6 rounded-md object-contain border border-gray-100 dark:border-gray-700 bg-white flex-shrink-0" onerror="this.style.display='none'">
                    <span class="truncate">${PLATFORMS[platform] || platform}</span>
                </div>
                <div class="text-sm flex-shrink-0" style="color: var(--color-text-primary);">需消費: <span class="font-bold text-base tabular-nums">MOP ${platformSpend}</span>${makeupBadge}</div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span>使用券:</span>
                <div class="flex gap-1">${couponsDisplay}</div>
            </div>
        </div>
        `;
    }
    resultHTML += `</div>`;
    
    if (remainingAmount > 0) {
        notificationTextLines.push(`已將差額 MOP ${remainingAmount.toFixed(0)} 加至 ${PLATFORMS[makeupPlatform] || makeupPlatform}`);
        resultHTML += `<div class="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined">task_alt</span> 🎉 方案已將差額 MOP ${remainingAmount.toFixed(0)} 加至 ${PLATFORMS[makeupPlatform] || makeupPlatform}。</div>`;
    } else {
        notificationTextLines.push(`完美匹配，無需補差額！`);
        resultHTML += `<div class="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined">task_alt</span> 🎉 完美匹配！不需補任何差額。</div>`;
    }

    const today = new Date();
    if ([0, 5, 6].includes(today.getDay())) {
        resultHTML += `<div class="p-2.5 mt-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 font-bold text-sm">⚠️ 周五至周日無法使用消費券，故無法標記為已使用。</div>`;
        allDOMElements.markAsUsedBtn.classList.add('hidden');
    } else {
        allDOMElements.markAsUsedBtn.classList.remove('hidden');
    }

    allDOMElements.calculatorResult.innerHTML = resultHTML;
    showToast("用券方案已計算完成", notificationTextLines);
    if ("Notification" in window) {
        const options = { body: notificationTextLines.join('\n'), icon: "./icon.png", badge: "./icon.png", vibrate: [200, 100, 200] };
        const sendNativeNotification = () => { if ("serviceWorker" in navigator) { navigator.serviceWorker.ready.then(r => r.showNotification("用券方案已計算完成", options)).catch(()=>new Notification("用券方案已計算完成", options)); } else { new Notification("用券方案已計算完成", options); } };
        if (Notification.permission === "granted") { sendNativeNotification(); } else if (Notification.permission !== "denied") { Notification.requestPermission().then(p => { if (p === "granted") sendNativeNotification(); }); }
    }
});

allDOMElements.markAsUsedBtn.addEventListener('click', async () => {
    if (bestCouponCombination.length === 0) return;
    const confirmed = await showConfirmDialog('確定要將計算結果中的消費券標示為「已使用」嗎？\n此操作將會直接更新您的記錄。', '確認操作');
    if (!confirmed) return;
    try {
        const updates = {}; bestCouponCombination.forEach(coupon => { updates[`records.${coupon.recordId}.usedCoupons.${coupon.couponKey}`] = true; });
        await safeUpdateRecordDoc(updates, null); 
        announceStatus("已成功標示消費券為已使用。"); allDOMElements.calculatorDialog.close();
    } catch (error) { showAlertDialog('操作失敗，請稍後再試。'); }
});

async function submitRecordLogic() {
    if (!currentInputPlatform) { showAlertDialog("請先點選上方平台！"); return; }
    const platform = currentInputPlatform; const [draw1, draw2, draw3] = currentInputValues;
    const weekNumber = getEntryWeekNumber();
    
    if (!weekNumber) { showAlertDialog("請選擇要記錄的周數！"); return; }
    if (records.some(r => r.week === weekNumber && r.platform === platform)) { showAlertDialog(`第 ${weekNumber} 周已存在 ${platform} 的記錄！`); return; }
    
    const docId = `${weekNumber}-${platform}`;
    const isAllDash = draw1 === '-' && draw2 === '-' && draw3 === '-';
    const newRecord = { id: docId, week: weekNumber, platform, draw1, draw2, draw3, usedCoupons: { draw1: isAllDash, draw2: isAllDash, draw3: isAllDash }, createdAt: new Date().toISOString() };
    
    try {
        const updates = { [`records.${docId}`]: newRecord }; const fallbackData = { records: { [docId]: newRecord } };
        await safeUpdateRecordDoc(updates, fallbackData);
        
        currentInputIndex = 0; currentInputValues = ['-', '-', '-']; currentInputPlatform = '';
        updateCouponSlotsUI(); renderPlatformOptions(); 
        announceStatus(`已成功新增 ${PLATFORMS[platform]} 的紀錄。`);

        if ([draw1, draw2, draw3].includes('200')) {
            await loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js');
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 10000, colors: ['#F59E0B', '#F97316', '#EF4444', '#10B981', '#3B82F6'] });
        }
    } catch (error) { showAlertDialog("新增紀錄失敗，請檢查網絡連線。"); }
}

allDOMElements.addRecordBtn.addEventListener('click', submitRecordLogic);

allDOMElements.skipBtn.addEventListener('click', async () => {
    if (!currentInputPlatform) { showAlertDialog("請先點選上方要跳過的平台！"); return; }
    const platform = currentInputPlatform; const weekNumber = getEntryWeekNumber();
    if (!weekNumber) { showAlertDialog("請選擇要操作的周數！"); return; }
    if (records.some(r => r.week === weekNumber && r.platform === platform)) { showAlertDialog(`第 ${weekNumber} 周已存在 ${platform} 的記錄！`); return; }
    const docId = `${weekNumber}-${platform}`;
    const newRecord = { id: docId, week: weekNumber, platform, draw1: "ND", draw2: "ND", draw3: "ND", usedCoupons: { draw1: true, draw2: true, draw3: true }, createdAt: new Date().toISOString() };
    try {
        await safeUpdateRecordDoc({ [`records.${docId}`]: newRecord }, { records: { [docId]: newRecord } });
        currentInputPlatform = ''; renderPlatformOptions(); announceStatus(`已成功新增 ${PLATFORMS[platform]} 的跳過紀錄。`);
    } catch (error) { showAlertDialog("新增 Skip 紀錄失敗，請檢查網絡連線。"); }
});

allDOMElements.filterWeekSelect.addEventListener('change', renderRecords);
allDOMElements.filterPlatformSelect.addEventListener('change', renderRecords);
allDOMElements.filterCurrentWeekBtn.addEventListener('click', () => {
    const select = allDOMElements.filterWeekSelect; select.value = getWeekNumber(new Date()).toString(); select.dispatchEvent(new Event('change', { bubbles: true }));
});

let recordPressTimer = null;
let isRecordLongPress = false;

function toggleAllCouponsForElement(titleEl) {
    const card = titleEl.closest('.record-card'); if (!card || !card.dataset.id) return;
    const docId = card.dataset.id; const record = records.find(r => r.id === docId); if (!record) return;

    const today = new Date(); const isRestricted = [0, 5, 6].includes(today.getDay()) && record.week === getWeekNumber(today);
    if (isRestricted) { showAlertDialog('規則限制：周五至周日無法使用當周的消費券！'); return; }

    const couponKeys = ['draw1', 'draw2', 'draw3']; const monetaryCoupons = couponKeys.filter(key => !isNaN(parseInt(record[key])));
    if (monetaryCoupons.length === 0) return;
    
    const wasAllUsed = monetaryCoupons.every(key => (record.usedCoupons || {})[key]);
    const isChecked = !wasAllUsed; const updatedUsedCoupons = { ...(record.usedCoupons || {}) };
    monetaryCoupons.forEach(key => updatedUsedCoupons[key] = isChecked);
    record.usedCoupons = updatedUsedCoupons; refreshUI(); scheduleWrite(docId, updatedUsedCoupons);
}

const startRecordPress = (e) => {
    const titleEl = e.target.closest('.platform-title');
    if (!titleEl) return;
    isRecordLongPress = false;
    if(e.type === 'touchstart' && navigator.vibrate) navigator.vibrate(10);
    recordPressTimer = setTimeout(() => {
        isRecordLongPress = true;
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        toggleAllCouponsForElement(titleEl);
    }, 450);
};

const cancelRecordPress = () => { if (recordPressTimer) clearTimeout(recordPressTimer); };

allDOMElements.recordsList.addEventListener('touchstart', startRecordPress, { passive: true });
allDOMElements.recordsList.addEventListener('touchend', cancelRecordPress);
allDOMElements.recordsList.addEventListener('touchmove', cancelRecordPress, { passive: true });
allDOMElements.recordsList.addEventListener('mousedown', startRecordPress);
allDOMElements.recordsList.addEventListener('mouseup', cancelRecordPress);
allDOMElements.recordsList.addEventListener('mouseleave', cancelRecordPress);

allDOMElements.recordsList.addEventListener('click', async (e) => {
    const target = e.target;
    const swipeDelBtn = target.closest('.delete-record-swipe, .delete-record');
    if (swipeDelBtn) {
        const docId = swipeDelBtn.dataset.id || swipeDelBtn.closest('.record-card, .swipe-container').dataset.id;
        const record = records.find(r => r.id === docId);
        if(record) {
            const confirmed = await showConfirmDialog(`確定要刪除 ${PLATFORMS[record.platform]} 在第 ${record.week} 周的紀錄嗎？`, '刪除確認');
            if (confirmed) {
                try { await safeUpdateRecordDoc({ [`records.${docId}`]: FB.fs.deleteField() }, null); announceStatus("紀錄已刪除。"); } 
                catch (error) { showAlertDialog("刪除失敗！"); }
            }
        }
        return;
    }

    const titleEl = target.closest('.platform-title');
    if (titleEl) {
        if (isRecordLongPress) { isRecordLongPress = false; return; }
        if (navigator.vibrate) navigator.vibrate(10);
        
        const card = titleEl.closest('.record-card');
        const docId = card.dataset.id;
        const record = records.find(r => r.id === docId);
        if (record) {
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            var isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
            var isAndroid = /android/i.test(userAgent);

            if (record.platform === 'UePay') {
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
            } else if (record.platform === 'GFB') {
                if (isIOS) {
                    window.location.href = 'cgbaom://';
                } else {
                    window.location.href = APP_SCHEMES['GFB'];
                }
            } else if (APP_SCHEMES[record.platform]) {
                window.location.href = APP_SCHEMES[record.platform];
            }
        }
        return;
    }

    const card = target.closest('.record-card'); if (!card || !card.dataset.id) return;
    const docId = card.dataset.id; const record = records.find(r => r.id === docId); if (!record) return;

    const couponBtn = target.closest('.coupon-value');
    if (couponBtn && !couponBtn.classList.contains('invalid')) {
        const today = new Date(); const isRestricted = [0, 5, 6].includes(today.getDay()) && record.week === getWeekNumber(today);
        if (isRestricted) { showAlertDialog('規則限制：周五至周日無法使用當周的消費券！'); return; }

        if (navigator.vibrate) navigator.vibrate(10);
        const couponKey = couponBtn.dataset.coupon;
        const updatedUsedCoupons = { ...(record.usedCoupons || {}), [couponKey]: !(record.usedCoupons || {})[couponKey] };
        record.usedCoupons = updatedUsedCoupons; refreshUI(); scheduleWrite(docId, updatedUsedCoupons);
    }
});

allDOMElements.copyUserIdBtn.addEventListener('click', () => {
    const { userIdInput } = allDOMElements;
    if (navigator.clipboard && userIdInput.value) {
        navigator.clipboard.writeText(userIdInput.value).then(() => { showAlertDialog('用戶 ID 已成功複製！\n請妥善保存以防資料遺失。'); announceStatus('用戶 ID 已複製到剪貼簿。'); }).catch(err => { showAlertDialog('複製失敗，請手動複製。'); });
    }
});

allDOMElements.switchUserBtn.addEventListener('click', () => {
    const newUserId = allDOMElements.userIdInput.value.trim();
    if (newUserId && newUserId !== currentUserId) {
        currentUserId = newUserId; localStorage.setItem('savedUserId', currentUserId);
        showAlertDialog(`已成功切換至帳號 ID:\n${currentUserId}`); announceStatus(`已切換至新用戶。`);
        loadCachedData(currentUserId); syncRecords(currentUserId);
    } else if (!newUserId) { showAlertDialog('請輸入有效的用戶 ID！'); }
});

allDOMElements.addFavoriteBtn.addEventListener('click', () => { showAlertDialog('<b>電腦:</b> 按下 `Ctrl + D` 或 `Cmd + D` 將此頁加入書籤。<br><br><b>手機:</b> 請點擊瀏覽器選單按鈕，然後選擇「新增至書籤」或類似選項。', '新增至書籤/最愛'); });
allDOMElements.addToHomeScreenBtn.addEventListener('click', async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; } 
    else {
        const ua = navigator.userAgent; const isIOS = /iPad|iPhone|iPod/.test(ua); const isAndroid = /Android/.test(ua); let message = '';
        if (isIOS) message = '<b>iOS/iPadOS 裝置:</b><br>1. 點擊底部工具列的「分享」<span class="material-symbols-outlined" style="font-size: 1em; vertical-align: -0.15em;">ios_share</span>按鈕。<br>2. 在選項中向下滑動，找到並點擊「加入主畫面」。';
        else if (isAndroid) message = '<b>Android 裝置:</b><br>1. 點擊瀏覽器右上角的「選單」<span class="material-symbols-outlined" style="font-size: 1em; vertical-align: -0.15em;">more_vert</span>按鈕。<br>2. 找到並點擊「新增至主畫面」或「安裝應用程式」。';
        else message = '請使用您的瀏覽器選單，尋找「新增至主畫面」、「安裝應用程式」或類似選項，即可將此網站像APP一樣放在桌面。';
        showAlertDialog(message, '安裝應用程式/新增到主畫面');
    }
});

function exportToCsv(filename, rows) {
    let csvFile = ''; rows.forEach(row => {
        let finalVal = ''; row.forEach((val, j) => {
            let innerValue = val === null || val === undefined ? '' : val.toString();
            if (val instanceof Date) innerValue = val.toLocaleString();
            let result = innerValue.replace(/"/g, '""'); if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
            if (j > 0) finalVal += ','; finalVal += result;
        }); csvFile += finalVal + '\n';
    });
    const blob = new Blob(['\uFEFF' + csvFile], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a");
    if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", filename); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }
}

allDOMElements.exportCsvBtn.addEventListener('click', () => {
    if (records.length === 0) { showAlertDialog('沒有可匯出的資料。'); return; }
    const headers = ['周數', '平台', '券1', '券2', '券3', '券1已使用', '券2已使用', '券3已使用', '建立時間']; const rows = [headers];
    const sortedRecords = [...records].sort((a, b) => (a.week !== b.week) ? a.week - b.week : a.platform.localeCompare(b.platform));
    sortedRecords.forEach(record => {
        const usedCoupons = record.usedCoupons || {}; const createdAt = record.createdAt ? new Date(record.createdAt).toLocaleString('zh-HK') : '';
        rows.push([ record.week, PLATFORMS[record.platform] || record.platform, record.draw1, record.draw2, record.draw3, usedCoupons.draw1 ? '是' : '否', usedCoupons.draw2 ? '是' : '否', usedCoupons.draw3 ? '是' : '否', createdAt ]);
    });
    const now = new Date(); const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    exportToCsv(`社區消費獎賞2026_${timestamp}_${currentUserId}.csv`, rows);
});

allDOMElements.downloadStatsBtn.addEventListener('click', async () => {
    const charts = [ { chart: platformTotalChart, title: '各平台累計金額' }, { chart: couponCountChart, title: '各面額券數統計' }, { chart: platformWeeklyTotalChart, title: '各平台每周趨勢' }, { chart: weeklyTotalChart, title: '每周總額趨勢' } ].filter(item => item.chart);
    if (charts.length === 0) { showAlertDialog('沒有圖表可以下載。'); return; }

    const PADDING = 50, TITLE_HEIGHT = 60, SPACING = 40, canvasWidth = 1200; let totalHeight = PADDING;
    const chartItems = charts.map(item => {
        const originalCanvas = item.chart.canvas; const aspectRatio = originalCanvas.height / originalCanvas.width; const height = canvasWidth * aspectRatio; const image = originalCanvas.toDataURL('image/png'); return { ...item, image, height };
    });
    totalHeight += chartItems.reduce((acc, item) => acc + item.height + TITLE_HEIGHT + SPACING, 0) - SPACING + PADDING;

    const mergedCanvas = document.createElement('canvas'); mergedCanvas.width = canvasWidth + PADDING * 2; mergedCanvas.height = totalHeight;
    const ctx = mergedCanvas.getContext('2d'); ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#0d1117' : '#ffffff'; ctx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);

    let currentY = PADDING;
    const drawPromises = chartItems.map(item => new Promise(resolve => { const img = new Image(); img.onload = () => resolve({ img, item }); img.src = item.image; }));

    Promise.all(drawPromises).then(loadedItems => {
        const orderedItems = charts.map(chartInfo => loadedItems.find(loaded => loaded.item.title === chartInfo.title));
        orderedItems.forEach(({ img, item }) => {
            ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#1f2937'; ctx.font = 'bold 28px "Noto Sans TC", sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(item.title, mergedCanvas.width / 2, currentY + TITLE_HEIGHT / 2); currentY += TITLE_HEIGHT;
            ctx.drawImage(img, PADDING, currentY, canvasWidth, item.height); currentY += item.height + SPACING;
        });
        const link = document.createElement('a'); const now = new Date(); const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        link.download = `統計圖表_${timestamp}.png`; link.href = mergedCanvas.toDataURL('image/png'); link.click();
    });
});

allDOMElements.disclaimerLink.addEventListener('click', (e) => {
    e.preventDefault();
    const disclaimerText = "1. 服務性質：本網站為一非官方、個人開發的輔助工具，旨在方便用戶記錄「社區消費大獎賞2026」活動相關數據。本網站與活動主辦方無任何關聯。\n\n2. 數據儲存與隱私：所有用戶輸入的資料均以匿名方式儲存在第三方雲端數據庫 (Firebase) 中。系統僅會生成一組匿名的用戶ID用於數據同步，過程中不會收集、儲存或處理任何個人可識別信息 (PII)，如姓名、電話或電郵地址。\n\n3. 數據準確性與風險：用戶應自行確保輸入資料的準確性。本網站提供者不對任何因數據不準確、遺失、損毀或洩漏所導致的任何直接或間接損失負責。請用戶理解雲端服務本質上存在的風險。\n\n4. 服務可用性：本網站不保證服務的永久可用性、穩定性或無錯誤。服務可能因維護、升級或不可抗力因素而中斷，恕不另行通知。\n\n5. 內容所有權與使用：用戶在本網站輸入的數據，其所有權仍歸用戶本人。然而，網站持有人保留對所有匿名數據進行匯總、統計與分析的權利，以用於改善服務或學術研究，分析結果將以不透露任何個別用戶數據的形式呈現。\n\n6. 責任限制：在任何情況下，本網站的開發者與提供者均不對使用或無法使用本網站所造成的任何損害承擔責任。\n\n當您開始使用本網站時，即表示您已閱讀、理解並同意以上所有條款。";
    showAlertDialog(disclaimerText, "免責聲明");
});

async function initializeAppFlow() {
    showLoadingSkeleton(); loadSettings();
    const savedTheme = localStorage.getItem('selectedTheme') || 'blue'; applyTheme(savedTheme);
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled' || (savedMode !== 'disabled' && window.matchMedia('(prefers-color-scheme: dark)').matches)) toggleDarkMode(true);
    else toggleDarkMode(false);

    updateTimeInfo(); initializeEntryWeekSelect(); initializeAdvancedToggle(); initializeAuthToggle();
    initRecordPanelUI(); 
    
    // 將原本會阻塞的 Firebase 初始化，放入 requestIdleCallback 延遲執行，讓 UI 先秒開
    if (window.requestIdleCallback) {
        requestIdleCallback(lazyLoadFirebase);
    } else {
        setTimeout(lazyLoadFirebase, 100);
    }
    
    const currentWeek = getWeekNumber(new Date()).toString();
    allDOMElements.filterWeekSelect.value = currentWeek;
}

// --- App Entry Point ---
initializeAppFlow();
