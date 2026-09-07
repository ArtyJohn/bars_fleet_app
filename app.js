// ================================================================
//  app.js — ВСЯ ЛОГИКА ПРИЛОЖЕНИЯ
// ================================================================

// ================================================================
//  РОЛИ И ПАРОЛИ
// ================================================================

const ROLES = {
    admin: { name: 'Командир', password: 'admin2026', label: '👑 Командир' },
    starshiy: { name: 'Старшина', password: 'bars2026', label: '⭐ Старшина' },
    mehanik: { name: 'Механик', password: 'mehanik2026', label: '🔧 Механик' },
    voditel: { name: 'Водитель', password: 'voditel2026', label: '🚗 Водитель' },
    oruzhie: { name: 'Оружейник', password: 'oruzhie2026', label: '🔫 Оружейник' },
    klad: { name: 'Кладовщик', password: 'klad2026', label: '📦 Кладовщик' }
};

let currentRole = null;
let currentUser = null;
let authTargetTab = null;
let notifications = [];
let unreadNotifs = 0;

// ================================================================
//  ДАННЫЕ
// ================================================================

let cars = [];
let persons = [];
let weapons = [];
let items = [];
let historyData = [];
let references = {};
let repairRequests = [];

// Начальные данные
const defaultCars = [
    { id: 1, reg: 'Е390НУ977', model: 'Foton Tunland G9', sts: '1234567890', responsible: 'Ремнев Артем Сергеевич',
        driver: 'Ремнев Артем Сергеевич', mileage: 5359, last_to: 2000, plan_to: 12000, remainder: 3359,
        status: '🟢', mark: '✅ Пройдено', criticality: '🟢 НИЗКИЙ', notification: '✅ Всё в порядке',
        type: 'Легковой', dept: 'Штаб', tsStatus: 'В эксплуатации' },
    { id: 2, reg: 'Е420НУ977', model: 'Foton Tunland G9', sts: '0987654321', responsible: 'Федоров Богдан Владимирович',
        driver: 'Федоров Богдан Владимирович', mileage: 7485, last_to: 2000, plan_to: 12000, remainder: 5485,
        status: '🟢', mark: '✅ Пройдено', criticality: '🟢 НИЗКИЙ', notification: '✅ Всё в порядке',
        type: 'Легковой', dept: 'Инструкторский состав', tsStatus: 'В эксплуатации' },
    { id: 3, reg: 'Е391НУ977', model: 'Foton Tunland G9', sts: '1122334455', responsible: 'Магомедов Магомед Насрудинович',
        driver: 'Никифоров Роман Владимирович', mileage: 0, last_to: 2000, plan_to: 12000, remainder: 2000,
        status: '🟡', mark: '⏳ Скоро ТО', criticality: '🟡 СРЕДНИЙ', notification: '📅 Осталось ≤ 1000 км',
        type: 'Легковой', dept: 'Штаб', tsStatus: 'В эксплуатации' },
    { id: 4, reg: 'Е445НУ977', model: 'Foton Tunland G9', sts: '5544332211', responsible: 'Магомедов Магомед Насрудинович',
        driver: 'Магомедов Магомед Насрудинович', mileage: 144, last_to: 0, plan_to: 2000, remainder: 1856,
        status: '🟢', mark: '✅ Пройдено', criticality: '🟢 НИЗКИЙ', notification: '✅ Всё в порядке',
        type: 'Легковой', dept: 'Снабжение', tsStatus: 'В эксплуатации' },
    { id: 5, reg: 'Е474НУ977', model: 'Foton Tunland G9', sts: '6677889900', responsible: 'Зятиков Илья Михайлович',
        driver: 'Зятиков Илья Михайлович', mileage: 4185, last_to: 2000, plan_to: 12000, remainder: 2185,
        status: '🟢', mark: '✅ Пройдено', criticality: '🟢 НИЗКИЙ', notification: '✅ Всё в порядке',
        type: 'Легковой', dept: 'Штаб', tsStatus: 'В эксплуатации' },
    { id: 6, reg: 'Е370НУ977', model: 'Foton Tunland G9', sts: '7788990011', responsible: 'Блинов Сергей Денисович',
        driver: 'Блинов Сергей Денисович', mileage: 75, last_to: 0, plan_to: 2000, remainder: 1925,
        status: '🟢', mark: '✅ Пройдено', criticality: '🟢 НИЗКИЙ', notification: '✅ Всё в порядке',
        type: 'Легковой', dept: 'Инструкторский состав', tsStatus: 'В эксплуатации' },
    { id: 7, reg: 'Е556НУ977', model: 'Foton Tunland G9', sts: '8899001122', responsible: 'Тимофеев Антон Владимирович',
        driver: 'Тимофеев Антон Владимирович', mileage: 339, last_to: 0, plan_to: 2000, remainder: 1661,
        status: '🟢', mark: '✅ Пройдено', criticality: '🟢 НИЗКИЙ', notification: '✅ Всё в порядке',
        type: 'Легковой', dept: 'Снабжение', tsStatus: 'В эксплуатации' }
];

const defaultPersons = [
    { id: 1, fio: 'Ремнев Артем Сергеевич', position: 'Старшина', department: 'Штаб', rank: 'Старшина',
        phone: '+7 999 123-45-67' },
    { id: 2, fio: 'Магомедов Магомед Насрудинович', position: 'Водитель', department: 'Снабжение', rank: 'Сержант',
        phone: '+7 999 234-56-78' },
    { id: 3, fio: 'Федоров Богдан Владимирович', position: 'Водитель', department: 'Инструкторский состав',
        rank: 'Ефрейтор', phone: '+7 999 345-67-89' },
    { id: 4, fio: 'Зятиков Илья Михайлович', position: 'Командир', department: 'Штаб', rank: 'Капитан',
        phone: '+7 999 456-78-90' },
    { id: 5, fio: 'Блинов Сергей Денисович', position: 'Водитель', department: 'Инструкторский состав',
        rank: 'Ефрейтор', phone: '+7 999 567-89-01' },
    { id: 6, fio: 'Тимофеев Антон Владимирович', position: 'Водитель', department: 'Снабжение', rank: 'Сержант',
        phone: '+7 999 678-90-12' },
    { id: 7, fio: 'Никифоров Роман Владимирович', position: 'Водитель', department: 'Штаб', rank: 'Ефрейтор',
        phone: '+7 999 789-01-23' }
];

const defaultWeapons = [
    { id: 1, type: 'Барьер', number: 'Б-001', symbol: 'Б-1', coordinates: '55.75, 37.62', status: 'Исправно',
        fault: '', lastRequest: '' },
    { id: 2, type: 'Барьер', number: 'Б-002', symbol: 'Б-2', coordinates: '55.76, 37.63', status: 'В ремонте',
        fault: 'Неисправен блок наведения', lastRequest: 'Заявка №1 от 01.09.2026' },
    { id: 3, type: 'Звездочет', number: 'З-001', symbol: 'З-1', coordinates: '55.77, 37.64', status: 'Исправно',
        fault: '', lastRequest: '' },
    { id: 4, type: 'Звездочет', number: 'З-002', symbol: 'З-2', coordinates: '55.78, 37.65', status: 'Неисправно',
        fault: 'Сбой системы охлаждения', lastRequest: 'Заявка №2 от 05.09.2026' }
];

const defaultItems = [
    { id: 1, name: 'Масло моторное 5W-30', article: 'M-001', type: 'Расходные материалы', unit: 'л',
        quantity: 50, storage: 'Склад №1', note: 'Для двигателей' },
    { id: 2, name: 'Фильтр масляный', article: 'F-001', type: 'Запасные части', unit: 'шт.',
        quantity: 30, storage: 'Склад №1', note: '' },
    { id: 3, name: 'Тормозные колодки', article: 'T-001', type: 'Запасные части', unit: 'компл.',
        quantity: 15, storage: 'Склад №2', note: 'Для легковых' },
    { id: 4, name: 'Свечи зажигания', article: 'S-001', type: 'Запасные части', unit: 'шт.',
        quantity: 100, storage: 'Склад №2', note: '' },
    { id: 5, name: 'Набор гаечных ключей', article: 'I-001', type: 'Инструмент', unit: 'компл.',
        quantity: 10, storage: 'Склад №3', note: '' }
];

const defaultHistory = [
    { id: 1, date: '13.08.2026', reg: 'Е391НУ977', model: 'Foton Tunland G9', mileage: 1998,
        toType: 'ТО-0 (2 000 км)', note: '' },
    { id: 2, date: '12.08.2026', reg: 'Е390НУ977', model: 'Foton Tunland G9', mileage: 1999,
        toType: 'ТО-0 (2 000 км)', note: '' },
    { id: 3, date: '14.08.2026', reg: 'Е474НУ977', model: 'Foton Tunland G9', mileage: 1986,
        toType: 'ТО-0 (2 000 км)', note: '' }
];

const defaultRefs = {
    carTypes: ['Легковой', 'Грузовой', 'Спецтехника'],
    departments: ['Штаб', 'Снабжение', 'Полетная группа', 'Инструкторский состав', 'Ремонтная рота'],
    statuses: ['В эксплуатации', 'В ремонте', 'Резерв', 'Списано'],
    toTypes: ['ТО-0 (2 000 км)', 'ТО-1 (10 000 км)', 'ТО-2 (20 000 км)', 'ТО-3 (30 000 км)',
        'ТО-4 (40 000 км)', 'ТО-5 (50 000 км)', 'ТО-6 (60 000 км)', 'ТО-7 (70 000 км)',
        'ТО-8 (80 000 км)', 'ТО-9 (90 000 км)', 'ТО-10 (100 000 км)'
    ],
    exploitants: ['Ремнев Артем Сергеевич', 'Магомедов Магомед Насрудинович', 'Федоров Богдан Владимирович',
        'Зарипов Айнур Ильдарович', 'Циденов Михаил Олегович', 'Тимофеев Антон Владимирович',
        'Никифоров Роман Владимирович', 'Абрамов Владислав Александрович', 'Блинов Сергей Денисович',
        'Шишков Сергей Александрович', 'Зятиков Илья Михайлович'
    ],
    positions: ['Командир', 'Заместитель командира', 'Старшина', 'Механик', 'Водитель', 'Оружейник', 'Кладовщик',
        'Связист', 'Разведчик'
    ],
    ranks: ['Рядовой', 'Ефрейтор', 'Младший сержант', 'Сержант', 'Старший сержант', 'Старшина', 'Прапорщик',
        'Старший прапорщик', 'Лейтенант', 'Старший лейтенант', 'Капитан', 'Майор', 'Подполковник', 'Полковник'
    ],
    units: ['шт.', 'компл.', 'л', 'кг', 'м', 'км', 'шт.', 'уп.', 'кор.', 'пач.'],
    weaponTypes: ['Барьер', 'Звездочет'],
    weaponStatuses: ['Исправно', 'В ремонте', 'Неисправно', 'На хранении', 'Списано'],
    stockTypes: ['Расходные материалы', 'Запасные части', 'Инструмент', 'ГСМ', 'Спецодежда', 'Прочее']
};

// ================================================================
//  ЗАГРУЗКА / СОХРАНЕНИЕ
// ================================================================

function loadData() {
    const prefix = 'bars_';

    cars = JSON.parse(localStorage.getItem(prefix + 'cars') || JSON.stringify(defaultCars));
    persons = JSON.parse(localStorage.getItem(prefix + 'persons') || JSON.stringify(defaultPersons));
    weapons = JSON.parse(localStorage.getItem(prefix + 'weapons') || JSON.stringify(defaultWeapons));
    items = JSON.parse(localStorage.getItem(prefix + 'items') || JSON.stringify(defaultItems));
    historyData = JSON.parse(localStorage.getItem(prefix + 'history') || JSON.stringify(defaultHistory));
    references = JSON.parse(localStorage.getItem(prefix + 'refs') || JSON.stringify(defaultRefs));
    notifications = JSON.parse(localStorage.getItem(prefix + 'notifs') || JSON.stringify([]));
    repairRequests = JSON.parse(localStorage.getItem(prefix + 'repairs') || JSON.stringify([]));

    cars = cars.map(c => {
        c.remainder = c.plan_to - c.mileage;
        if (c.remainder < 0) { c.status = '🔴';
            c.criticality = '🔴 КРИТИЧНО';
            c.notification = '⚠️ ПРОСРОЧЕНО!'; } else if (c.remainder <= 500) { c.status = '🟠';
            c.criticality = '🟠 ВЫСОКИЙ';
            c.notification = '⏰ Осталось ≤ 500 км'; } else if (c.remainder <= 1000) { c.status = '🟡';
            c.criticality = '🟡 СРЕДНИЙ';
            c.notification = '📅 Осталось ≤ 1000 км'; } else { c.status = '🟢';
            c.criticality = '🟢 НИЗКИЙ';
            c.notification = '✅ Всё в порядке'; }
        return c;
    });

    saveData();
}

function saveData() {
    const prefix = 'bars_';
    localStorage.setItem(prefix + 'cars', JSON.stringify(cars));
    localStorage.setItem(prefix + 'persons', JSON.stringify(persons));
    localStorage.setItem(prefix + 'weapons', JSON.stringify(weapons));
    localStorage.setItem(prefix + 'items', JSON.stringify(items));
    localStorage.setItem(prefix + 'history', JSON.stringify(historyData));
    localStorage.setItem(prefix + 'refs', JSON.stringify(references));
    localStorage.setItem(prefix + 'notifs', JSON.stringify(notifications));
    localStorage.setItem(prefix + 'repairs', JSON.stringify(repairRequests));
    updateNotifBadge();
}

// ================================================================
//  УВЕДОМЛЕНИЯ
// ================================================================

function addNotification(type, message, data = {}) {
    const notif = { id: Date.now(), type: type, message: message, data: data, time: new Date().toLocaleString(),
        read: false };
    notifications.unshift(notif);
    if (notifications.length > 100) notifications = notifications.slice(0, 100);
    saveData();
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Барс-Москва', { body: message,
            icon: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2694.png' });
    }
    renderNotifs();
    updateNotifBadge();
}

function updateNotifBadge() {
    const unread = notifications.filter(n => !n.read).length;
    unreadNotifs = unread;
    const btn = document.getElementById('notifBtn');
    const existing = btn.querySelector('.badge-notif');
    if (existing) existing.remove();
    if (unread > 0) {
        const badge = document.createElement('span');
        badge.className = 'badge-notif';
        badge.textContent = unread > 9 ? '9+' : unread;
        btn.appendChild(badge);
    }
}

function toggleNotifs() {
    const panel = document.getElementById('notifPanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        notifications.forEach(n => n.read = true);
        saveData();
        updateNotifBadge();
        renderNotifs();
    }
}

function renderNotifs() {
    const div = document.getElementById('notifList');
    if (notifications.length === 0) {
        div.innerHTML =
            '<div style="color:#8b949e;padding:8px;text-align:center;font-size:12px;">Нет уведомлений</div>';
        return;
    }
    div.innerHTML = notifications.slice(0, 30).map(n => `
                <div class="notif-item">
                    <span class="${n.type}">${n.message}</span>
                    <span class="time">${n.time}</span>
                    <button class="dismiss" onclick="dismissNotif(${n.id})">✕</button>
                </div>
            `).join('');
}

function dismissNotif(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveData();
    renderNotifs();
    updateNotifBadge();
}

function clearNotifs() {
    notifications = [];
    saveData();
    renderNotifs();
    updateNotifBadge();
    document.getElementById('notifPanel').classList.remove('active');
    showToast('Уведомления очищены');
}

// ================================================================
//  СИНХРОНИЗАЦИЯ
// ================================================================

let isSyncing = false;
let lastSyncTime = null;

function syncToCloud() {
    if (isSyncing) return;
    const btn = document.getElementById('syncBtn');
    isSyncing = true;
    if (btn) btn.classList.add('active');
    showToast('☁️ Синхронизация...', 'sync');
    setTimeout(() => {
        saveData();
        checkCriticalMoments();
        isSyncing = false;
        if (btn) btn.classList.remove('active');
        lastSyncTime = new Date();
        const statusEl = document.getElementById('syncStatus');
        statusEl.textContent = '☁️ синхр. ' + lastSyncTime.toLocaleTimeString();
        statusEl.className = 'sync-status online';
        showToast('✅ Синхронизация завершена', 'sync');
    }, 1500);
}

function checkCriticalMoments() {
    const overdue = cars.filter(c => c.remainder < 0);
    overdue.forEach(c => {
        const exists = notifications.some(n => n.message.includes(c.reg) && n.message.includes('ПРОСРОЧЕНО'));
        if (!exists) {
            addNotification('critical', `🚨 ${c.reg}: ПРОСРОЧЕНО ТО на ${Math.abs(c.remainder)} км!`, { car: c });
        }
    });
    const soon = cars.filter(c => c.remainder >= 0 && c.remainder <= 500);
    soon.forEach(c => {
        const exists = notifications.some(n => n.message.includes(c.reg) && n.message.includes('Скоро ТО'));
        if (!exists) {
            addNotification('warning', `⚠️ ${c.reg}: Скоро ТО! Осталось ${c.remainder} км`, { car: c });
        }
    });
    const repairWeapons = weapons.filter(w => w.status === 'В ремонте' || w.status === 'Неисправно');
    repairWeapons.forEach(w => {
        const exists = notifications.some(n => n.message.includes(w.number) && (n.message.includes('ремонте') ||
            n.message.includes('Неисправен')));
        if (!exists) {
            addNotification('warning', `🔴 ${w.type} ${w.number}: ${w.status} (${w.fault || 'без описания'})`, { weapon: w });
        }
    });
    const lowItems = items.filter(i => i.quantity < 5);
    lowItems.forEach(i => {
        const exists = notifications.some(n => n.message.includes(i.name) && n.message.includes('заканчивается'));
        if (!exists) {
            addNotification('warning', `📦 ${i.name}: заканчивается (осталось ${i.quantity} ${i.unit})`, { item: i });
        }
    });
}

// ================================================================
//  ГЛАВНЫЙ ЭКРАН
// ================================================================

function renderMainScreen() {
    const grid = document.getElementById('tilesGrid');
    const tiles = [
        { id: 'tab1', icon: '🚗', name: 'Автопарк', count: cars.length, role: 'all' },
        { id: 'tab2', icon: '👥', name: 'Личный состав', count: persons.length, role: 'admin,starshiy' },
        { id: 'tab3', icon: '🔫', name: 'Вооружение', count: weapons.length, role: 'admin,oruzhie' },
        { id: 'tab4', icon: '📦', name: 'Склад', count: items.length, role: 'admin,klad,mehanik' },
        { id: 'tab5', icon: '📋', name: 'Журнал ТО', count: historyData.length, role: 'admin,starshiy,mehanik' },
        { id: 'tab6', icon: '📊', name: 'Отчёты', count: 0, role: 'admin,starshiy' },
        { id: 'tab7', icon: '⚙️', name: 'Администрирование', count: 0, role: 'admin' }
    ];
    const overdueCount = cars.filter(c => c.remainder < 0).length;
    const repairCount = weapons.filter(w => w.status === 'В ремонте' || w.status === 'Неисправно').length;
    grid.innerHTML = tiles.map(t => {
        let badge = '';
        if (t.id === 'tab1' && overdueCount > 0) badge = `<span class="tile-badge">${overdueCount}</span>`;
        if (t.id === 'tab3' && repairCount > 0) badge = `<span class="tile-badge">${repairCount}</span>`;
        return `
                    <div class="tile" onclick="openAuth('${t.id}')">
                        <span class="tile-icon">${t.icon}</span>
                        <span class="tile-name">${t.name}</span>
                        <span class="tile-count">${t.count > 0 ? t.count + ' зап.' : ''}</span>
                        ${t.role !== 'all' ? '<span class="tile-lock">🔒</span>' : ''}
                        ${badge}
                    </div>
                `;
    }).join('');
}

// ================================================================
//  АВТОРИЗАЦИЯ
// ================================================================

function openAuth(tabId) {
    if (currentRole && isTabAvailable(tabId)) { openTab(tabId); return; }
    authTargetTab = tabId;
    document.getElementById('authTitle').textContent = '🔐 Доступ к разделу';
    document.getElementById('authSub').textContent = 'Введите пароль для продолжения';
    document.getElementById('authPassword').value = '';
    document.getElementById('authError').classList.remove('show');
    document.getElementById('authOverlay').classList.add('active');
    setTimeout(() => document.getElementById('authPassword').focus(), 300);
    document.getElementById('authPassword').onkeydown = function(e) { if (e.key === 'Enter') authLogin(); };
}

function authLogin() {
    const role = document.getElementById('authRole').value;
    const password = document.getElementById('authPassword').value;
    if (ROLES[role] && ROLES[role].password === password) {
        currentRole = role;
        currentUser = ROLES[role];
        document.getElementById('authOverlay').classList.remove('active');
        document.getElementById('userBadge').textContent = '👤 ' + currentUser.label;
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !==
            'denied') {
            Notification.requestPermission();
        }
        showToast('✅ Добро пожаловать, ' + currentUser.name + '!');
        document.getElementById('logoutBtn').style.display = '';
        document.getElementById('homeBtn').style.display = '';
        document.getElementById('bottomActions').style.display = '';
        if (authTargetTab) { openTab(authTargetTab);
            authTargetTab = null; } else { openTab('tab1'); }
        updateDashboard();
        renderRefs();
        renderNotifs();
        renderUsers();
        updateNotifBadge();
        setTimeout(syncToCloud, 2000);
    } else {
        document.getElementById('authError').classList.add('show');
        document.getElementById('authPassword').value = '';
        document.getElementById('authPassword').focus();
        setTimeout(() => document.getElementById('authError').classList.remove('show'), 3000);
    }
}

function authCancel() {
    document.getElementById('authOverlay').classList.remove('active');
    authTargetTab = null;
}

function isTabAvailable(tabId) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (!btn) return false;
    const roles = btn.dataset.role.split(',');
    return roles.includes('all') || roles.includes(currentRole);
}

function logout() {
    currentRole = null;
    currentUser = null;
    document.getElementById('authOverlay').classList.remove('active');
    document.getElementById('userBadge').textContent = '👤 Гость';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('homeBtn').style.display = 'none';
    document.getElementById('bottomActions').style.display = 'none';
    document.getElementById('tabsWrapper').classList.remove('active');
    document.getElementById('mainScreen').classList.remove('hidden');
    showToast('👋 Выход выполнен');
    renderMainScreen();
}

// ================================================================
//  ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ================================================================

function openTab(tabId) {
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('tabsWrapper').classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => {
        const roles = b.dataset.role.split(',');
        if (roles.includes('all') || (currentRole && roles.includes(currentRole))) {
            b.style.display = '';
        } else {
            b.style.display = 'none';
        }
    });
    updateDashboard();
}

function goHome() {
    document.getElementById('tabsWrapper').classList.remove('active');
    document.getElementById('mainScreen').classList.remove('hidden');
    renderMainScreen();
    showToast('🏠 Главный экран');
}

// ================================================================
//  СПРАВОЧНИКИ
// ================================================================

function toggleRefs() {
    const panel = document.getElementById('refsPanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) renderRefs();
}

function renderRefs() {
    const grid = document.getElementById('refsGrid');
    const groups = [
        { label: '🚗 Типы ТС', key: 'carTypes' },
        { label: '🏢 Подразделения', key: 'departments' },
        { label: '📌 Статусы ТС', key: 'statuses' },
        { label: '🔧 Типы ТО', key: 'toTypes' },
        { label: '👤 Эксплуатанты', key: 'exploitants' },
        { label: '💼 Должности', key: 'positions' },
        { label: '🎖 Звания', key: 'ranks' },
        { label: '📦 Ед. изм.', key: 'units' },
        { label: '🔫 Типы вооружения', key: 'weaponTypes' },
        { label: '🛠 Статусы вооружения', key: 'weaponStatuses' },
        { label: '📂 Типы ТМЦ', key: 'stockTypes' }
    ];
    grid.innerHTML = groups.map(g => {
        const items = references[g.key] || [];
        const showItems = items.slice(0, 5);
        const hiddenCount = items.length - 5;
        return `
                    <div class="ref-group">
                        <div class="ref-label">
                            <span>${g.label}</span>
                            ${currentRole === 'admin' ? `<button class="btn-small" onclick="addRef('${g.key}')" style="font-size:9px;padding:1px 6px;">➕</button>` : ''}
                        </div>
                        <div class="ref-list">
                            ${showItems.map(item => `
                                <div class="ref-item">
                                    <span>${item}</span>
                                    ${currentRole === 'admin' ? `<span class="del" onclick="deleteRef('${g.key}','${item}')">✕</span>` : ''}
                                </div>
                            `).join('')}
                            ${hiddenCount > 0 ? `<div style="color:#4a6a3a;font-size:10px;padding:2px 0;">+ еще ${hiddenCount}</div>` : ''}
                            ${items.length === 0 ? '<div style="color:#8b949e;font-size:10px;padding:2px 0;">Пусто</div>' : ''}
                        </div>
                    </div>
                `;
    }).join('');
}

function addRef(key) {
    const value = prompt('Введите новое значение:');
    if (value && value.trim()) {
        if (!references[key]) references[key] = [];
        references[key].push(value.trim());
        saveData();
        renderRefs();
        showToast('✅ Добавлено: ' + value.trim());
        syncToCloud();
    }
}

function deleteRef(key, value) {
    if (confirm('Удалить "' + value + '"?')) {
        references[key] = references[key].filter(v => v !== value);
        saveData();
        renderRefs();
        showToast('🗑️ Удалено');
        syncToCloud();
    }
}

// ================================================================
//  ОБНОВЛЕНИЕ ДАШБОРДА
// ================================================================

function updateDashboard() {
    const total = cars.length;
    const overdue = cars.filter(c => c.remainder < 0).length;
    const soon = cars.filter(c => c.remainder >= 0 && c.remainder <= 1000).length;
    const ok = cars.filter(c => c.remainder > 1000).length;
    document.getElementById('totalCars').textContent = total;
    document.getElementById('overdue').textContent = overdue;
    document.getElementById('soon').textContent = soon;
    document.getElementById('ok').textContent = ok;

    const wTotal = weapons.length;
    const wRepair = weapons.filter(w => w.status === 'В ремонте').length;
    const wFault = weapons.filter(w => w.status === 'Неисправно').length;
    const openRequests = repairRequests.filter(r => r.status === 'Открыта').length;

    document.getElementById('weaponTotal').textContent = wTotal;
    document.getElementById('weaponRepair').textContent = wRepair;
    document.getElementById('weaponFault').textContent = wFault;
    document.getElementById('weaponRequests').textContent = openRequests;

    renderCars();
    renderPersons();
    renderWeapons();
    renderStock();
    renderHistory();
    renderMainScreen();
    saveData();
    checkCriticalMoments();
    updateStockFilters();
}

// ================================================================
//  АВТОПАРК
// ================================================================

function renderCars() {
    const filterReg = document.getElementById('filterReg').value.toLowerCase();
    const filterModel = document.getElementById('filterModel').value.toLowerCase();
    let filtered = cars;
    if (filterReg) filtered = filtered.filter(c => c.reg.toLowerCase().includes(filterReg));
    if (filterModel) filtered = filtered.filter(c => c.model.toLowerCase().includes(filterModel));
    const tbody = document.getElementById('carsTable');
    tbody.innerHTML = '';
    document.getElementById('carsCount').textContent = filtered.length;
    if (filtered.length === 0) {
        tbody.innerHTML =
            `<tr><td colspan="8" style="text-align:center;color:#8b949e;padding:12px;">Нет автомобилей</td></tr>`;
        return;
    }
    filtered.forEach((c, idx) => {
        let badgeClass = 'badge-green';
        if (c.remainder < 0) badgeClass = 'badge-red';
        else if (c.remainder <= 500) badgeClass = 'badge-orange';
        else if (c.remainder <= 1000) badgeClass = 'badge-yellow';
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td><strong>${c.reg}</strong></td>
                    <td>${c.model}</td>
                    <td>${c.sts || '—'}</td>
                    <td>${c.mileage}</td>
                    <td>${c.remainder}</td>
                    <td><span class="badge ${badgeClass}">${c.status}</span></td>
                    <td><span class="clickable" onclick="showCarCard(${c.id})">👁</span></td>
                `;
        tr.addEventListener('dblclick', function() { showCarCard(c.id); });
        tbody.appendChild(tr);
    });
}

function applyFilters() { renderCars(); }

function resetFilters() {
    document.getElementById('filterReg').value = '';
    document.getElementById('filterModel').value = '';
    renderCars();
}

function showAddCarModal() {
    const exploitants = references.exploitants || [];
    const html = `
                <div class="modal-title">🚗 Добавить автомобиль</div>
                <div class="form-group"><label>Регистрационный номер *</label><input id="fReg" placeholder="Например: А001АА"></div>
                <div class="form-group"><label>Модель *</label><input id="fModel" placeholder="Например: Toyota Camry"></div>
                <div class="form-group"><label>СТС</label><input id="fSts" placeholder="Номер СТС"></div>
                <div class="form-group"><label>Ответственный *</label><input id="fResp" placeholder="ФИО ответственного"></div>
                <div class="form-group"><label>Водитель</label><input id="fDriver" placeholder="ФИО водителя" list="driversList"><datalist id="driversList">${exploitants.map(d => `<option value="${d}">`).join('')}</datalist></div>
                <div class="form-row">
                    <div class="form-group"><label>Пробег (км)</label><input id="fMileage" type="number" value="0"></div>
                    <div class="form-group"><label>Последнее ТО (км)</label><input id="fLastTO" type="number" value="0"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Плановое ТО (км)</label><input id="fPlanTO" type="number" value="2000"></div>
                    <div class="form-group"><label>Тип ТС</label><select id="fType">${references.carTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Подразделение</label><select id="fDept">${references.departments.map(d => `<option value="${d}">${d}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Статус ТС</label><select id="fStatus">${references.statuses.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="saveCar()">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function saveCar() {
    const reg = document.getElementById('fReg').value.trim();
    const model = document.getElementById('fModel').value.trim();
    const sts = document.getElementById('fSts').value.trim();
    const responsible = document.getElementById('fResp').value.trim();
    const driver = document.getElementById('fDriver').value.trim();
    const mileage = parseInt(document.getElementById('fMileage').value) || 0;
    const last_to = parseInt(document.getElementById('fLastTO').value) || 0;
    const plan_to = parseInt(document.getElementById('fPlanTO').value) || 2000;
    const type = document.getElementById('fType').value;
    const dept = document.getElementById('fDept').value;
    const tsStatus = document.getElementById('fStatus').value;
    if (!reg || !model || !responsible) {
        showToast('Заполните все обязательные поля!', 'error');
        return;
    }
    const newId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;
    const newCar = {
        id: newId, reg, model, sts, responsible, driver, mileage, last_to, plan_to,
        remainder: plan_to - mileage, status: '🟢', mark: '⏳ Ожидается',
        criticality: '🟢 НИЗКИЙ', notification: '✅ Всё в порядке',
        type, dept, tsStatus
    };
    cars.push(newCar);
    saveData();
    closeModal();
    updateDashboard();
    showToast('✅ Автомобиль добавлен');
    syncToCloud();
    addNotification('info', `🚗 Добавлен автомобиль ${reg} (${model})`);
}

function showCarCard(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    const html = `
                <div class="modal-title">🚗 Карточка автомобиля</div>
                <div class="car-card">
                    <div class="field"><span class="label">Рег.номер</span><span class="value">${car.reg}</span></div>
                    <div class="field"><span class="label">Модель</span><span class="value">${car.model}</span></div>
                    <div class="field"><span class="label">СТС</span><span class="value">${car.sts || '—'}</span></div>
                    <div class="field"><span class="label">Ответственный</span><span class="value">${car.responsible}</span></div>
                    <div class="field"><span class="label">Водитель</span><span class="value">${car.driver || '—'}</span></div>
                    <div class="field"><span class="label">Пробег</span><span class="value">${car.mileage} км</span></div>
                    <div class="field"><span class="label">Последнее ТО</span><span class="value">${car.last_to} км</span></div>
                    <div class="field"><span class="label">Плановое ТО</span><span class="value">${car.plan_to} км</span></div>
                    <div class="field"><span class="label">Тип ТС</span><span class="value">${car.type}</span></div>
                    <div class="field"><span class="label">Подразделение</span><span class="value">${car.dept}</span></div>
                    <div class="field"><span class="label">Статус</span><span class="value">${car.tsStatus}</span></div>
                    <div class="field"><span class="label">Критичность</span><span class="value">${car.criticality}</span></div>
                    <div class="field"><span class="label">Уведомление</span><span class="value">${car.notification}</span></div>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="printCarCard(${car.id})">🖨️ Печать</button>
                    <button class="btn-primary" onclick="exportCarCard(${car.id})">📊 Excel</button>
                    <button class="btn-secondary" onclick="closeModal()">Закрыть</button>
                </div>
            `;
    openModal(html);
}

function printCarCard(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    const html = `
                <html><head><meta charset="UTF-8"><style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    h1 { text-align: center; color: #1a1e1a; border-bottom: 2px solid #4a6a3a; padding-bottom: 10px; }
                    .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 500px; margin: 0 auto; }
                    .field { display: flex; padding: 6px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; width: 150px; color: #555; }
                    .value { flex: 1; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 11px; }
                </style></head>
                <body>
                    <h1>🚗 Карточка автомобиля</h1>
                    <div class="card">
                        <div class="field"><span class="label">Рег.номер</span><span class="value">${car.reg}</span></div>
                        <div class="field"><span class="label">Модель</span><span class="value">${car.model}</span></div>
                        <div class="field"><span class="label">СТС</span><span class="value">${car.sts || '—'}</span></div>
                        <div class="field"><span class="label">Ответственный</span><span class="value">${car.responsible}</span></div>
                        <div class="field"><span class="label">Водитель</span><span class="value">${car.driver || '—'}</span></div>
                        <div class="field"><span class="label">Пробег</span><span class="value">${car.mileage} км</span></div>
                        <div class="field"><span class="label">Последнее ТО</span><span class="value">${car.last_to} км</span></div>
                        <div class="field"><span class="label">Плановое ТО</span><span class="value">${car.plan_to} км</span></div>
                        <div class="field"><span class="label">Тип ТС</span><span class="value">${car.type}</span></div>
                        <div class="field"><span class="label">Подразделение</span><span class="value">${car.dept}</span></div>
                        <div class="field"><span class="label">Статус</span><span class="value">${car.tsStatus}</span></div>
                    </div>
                    <div class="footer">Учетная Система Бригада "БАРС-МОСКВА" • ${new Date().toLocaleString()}</div>
                    <script>window.print(); setTimeout(window.close, 1000);<\/script>
                </body></html>
            `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
}

function exportCarCard(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    const headers = ['Поле', 'Значение'];
    const rows = [
        ['Рег.номер', car.reg],
        ['Модель', car.model],
        ['СТС', car.sts || '—'],
        ['Ответственный', car.responsible],
        ['Водитель', car.driver || '—'],
        ['Пробег', car.mileage + ' км'],
        ['Последнее ТО', car.last_to + ' км'],
        ['Плановое ТО', car.plan_to + ' км'],
        ['Тип ТС', car.type],
        ['Подразделение', car.dept],
        ['Статус', car.tsStatus]
    ];
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    downloadFile(csv, `car_${car.reg}_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
    showToast('📊 Карточка выгружена в Excel');
}

// ================================================================
//  ЛИЧНЫЙ СОСТАВ
// ================================================================

function renderPersons() {
    const tbody = document.getElementById('personsTable');
    tbody.innerHTML = '';
    if (persons.length === 0) {
        tbody.innerHTML =
            `<tr><td colspan="7" style="text-align:center;color:#8b949e;padding:12px;">Нет данных</td></tr>`;
        return;
    }
    persons.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td><strong>${p.fio}</strong></td>
                    <td>${p.position}</td>
                    <td>${p.department}</td>
                    <td>${p.rank}</td>
                    <td>${p.phone || '—'}</td>
                    <td>
                        <button onclick="editPerson(${p.id})" style="background:none;border:none;color:#4a6a3a;cursor:pointer;">✏️</button>
                        <button onclick="deletePerson(${p.id})" style="background:none;border:none;color:#f85149;cursor:pointer;">🗑️</button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function showAddPersonModal() {
    const exploitants = references.exploitants || [];
    const html = `
                <div class="modal-title">👤 Добавить военнослужащего</div>
                <div class="form-group">
                    <label>ФИО *</label>
                    <input id="pFio" placeholder="Фамилия Имя Отчество" list="exploitantsList">
                    <datalist id="exploitantsList">${exploitants.map(e => `<option value="${e}">`).join('')}</datalist>
                </div>
                <div class="form-group"><label>Должность</label><select id="pPosition">${references.positions.map(p => `<option value="${p}">${p}</option>`).join('')}</select></div>
                <div class="form-group"><label>Подразделение</label><select id="pDept">${references.departments.map(d => `<option value="${d}">${d}</option>`).join('')}</select></div>
                <div class="form-group"><label>Звание</label><select id="pRank">${references.ranks.map(r => `<option value="${r}">${r}</option>`).join('')}</select></div>
                <div class="form-group"><label>Телефон</label><input id="pPhone" placeholder="+7 999 123-45-67"></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="savePerson()">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function savePerson() {
    const fio = document.getElementById('pFio').value.trim();
    const position = document.getElementById('pPosition').value;
    const department = document.getElementById('pDept').value;
    const rank = document.getElementById('pRank').value;
    const phone = document.getElementById('pPhone').value.trim();
    if (!fio) { showToast('Введите ФИО!', 'error'); return; }
    const newId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) + 1 : 1;
    persons.push({ id: newId, fio, position, department, rank, phone });
    saveData();
    closeModal();
    updateDashboard();
    showToast('✅ Военнослужащий добавлен');
    syncToCloud();
    addNotification('info', `👤 Добавлен военнослужащий ${fio}`);
}

function editPerson(id) {
    const person = persons.find(p => p.id === id);
    if (!person) return;
    const exploitants = references.exploitants || [];
    const html = `
                <div class="modal-title">✏️ Редактировать военнослужащего</div>
                <div class="form-group">
                    <label>ФИО *</label>
                    <input id="pFio" value="${person.fio}" list="exploitantsList">
                    <datalist id="exploitantsList">${exploitants.map(e => `<option value="${e}">`).join('')}</datalist>
                </div>
                <div class="form-group"><label>Должность</label><select id="pPosition">${references.positions.map(p => `<option value="${p}" ${p===person.position?'selected':''}>${p}</option>`).join('')}</select></div>
                <div class="form-group"><label>Подразделение</label><select id="pDept">${references.departments.map(d => `<option value="${d}" ${d===person.department?'selected':''}>${d}</option>`).join('')}</select></div>
                <div class="form-group"><label>Звание</label><select id="pRank">${references.ranks.map(r => `<option value="${r}" ${r===person.rank?'selected':''}>${r}</option>`).join('')}</select></div>
                <div class="form-group"><label>Телефон</label><input id="pPhone" value="${person.phone || ''}"></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="savePersonEdit(${person.id})">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function savePersonEdit(id) {
    const fio = document.getElementById('pFio').value.trim();
    const position = document.getElementById('pPosition').value;
    const department = document.getElementById('pDept').value;
    const rank = document.getElementById('pRank').value;
    const phone = document.getElementById('pPhone').value.trim();
    if (!fio) { showToast('Введите ФИО!', 'error'); return; }
    const person = persons.find(p => p.id === id);
    if (person) {
        person.fio = fio;
        person.position = position;
        person.department = department;
        person.rank = rank;
        person.phone = phone;
        saveData();
        closeModal();
        updateDashboard();
        showToast('✅ Данные обновлены');
        syncToCloud();
    }
}

function deletePerson(id) {
    if (confirm('Удалить этого военнослужащего?')) {
        persons = persons.filter(p => p.id !== id);
        saveData();
        updateDashboard();
        showToast('🗑️ Запись удалена');
        syncToCloud();
    }
}

// ================================================================
//  ВООРУЖЕНИЕ — НОВАЯ ВЕРСИЯ
// ================================================================

function renderWeapons() {
    const tbody = document.getElementById('weaponsTable');
    tbody.innerHTML = '';
    if (weapons.length === 0) {
        tbody.innerHTML =
            `<tr><td colspan="8" style="text-align:center;color:#8b949e;padding:12px;">Нет данных</td></tr>`;
        return;
    }
    weapons.forEach((w, idx) => {
        let badgeClass = 'badge-green';
        if (w.status === 'Неисправно') badgeClass = 'badge-red';
        else if (w.status === 'В ремонте') badgeClass = 'badge-orange';

        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td><strong>${w.type}</strong></td>
                    <td>${w.number}</td>
                    <td><span class="badge ${badgeClass}">${w.status}</span></td>
                    <td>${w.fault || '—'}</td>
                    <td>${w.coordinates || '—'}</td>
                    <td>${w.lastRequest || '—'}</td>
                    <td><span class="clickable" onclick="showWeaponCard(${w.id})">👁</span></td>
                `;
        tr.addEventListener('dblclick', function() { showWeaponCard(w.id); });
        tbody.appendChild(tr);
    });
}

function showAddWeaponModal() {
    const html = `
                <div class="modal-title">🔫 Добавить вооружение</div>
                <div class="form-group"><label>Тип *</label><select id="wType">${references.weaponTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
                <div class="form-group"><label>Бортовой номер *</label><input id="wNumber" placeholder="Например: Б-001"></div>
                <div class="form-group"><label>Условное обозначение</label><input id="wSymbol" placeholder="Например: Б-1"></div>
                <div class="form-group"><label>Координаты</label><input id="wCoords" placeholder="Например: 55.75, 37.62"></div>
                <div class="form-group"><label>Статус</label><select id="wStatus">${references.weaponStatuses.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
                <div class="form-group"><label>Неисправность</label><textarea id="wFault" placeholder="Описание неисправности"></textarea></div>
                <div class="form-group"><label>Последняя заявка</label><input id="wLastRequest" placeholder="№ заявки"></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="saveWeapon()">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function saveWeapon() {
    const type = document.getElementById('wType').value;
    const number = document.getElementById('wNumber').value.trim();
    const symbol = document.getElementById('wSymbol').value.trim();
    const coordinates = document.getElementById('wCoords').value.trim();
    const status = document.getElementById('wStatus').value;
    const fault = document.getElementById('wFault').value.trim();
    const lastRequest = document.getElementById('wLastRequest').value.trim();
    if (!type || !number) { showToast('Заполните тип и бортовой номер!', 'error'); return; }
    const newId = weapons.length > 0 ? Math.max(...weapons.map(w => w.id)) + 1 : 1;
    weapons.push({
        id: newId,
        type,
        number,
        symbol,
        coordinates,
        status,
        fault,
        lastRequest
    });
    saveData();
    closeModal();
    updateDashboard();
    showToast('✅ Вооружение добавлено');
    syncToCloud();
    addNotification('info', `🔫 Добавлен ${type} ${number}`);
}

function showWeaponCard(id) {
    const w = weapons.find(w => w.id === id);
    if (!w) return;

    const weaponRepairs = repairRequests.filter(r => r.weaponId === id);
    const openRepairs = weaponRepairs.filter(r => r.status === 'Открыта');
    const closedRepairs = weaponRepairs.filter(r => r.status === 'Закрыта');

    let criticality = '🟢 НИЗКИЙ';
    let critColor = 'green';
    if (w.status === 'Неисправно') { criticality = '🔴 КРИТИЧНЫЙ';
        critColor = 'red'; } else if (w.status === 'В ремонте') { criticality = '🟠 СРЕДНИЙ';
        critColor = 'orange'; }

    const html = `
                <div class="modal-title">🔫 Карточка вооружения — ${w.number}</div>

                <!-- ВЕРХНЕЕ ОКНО — ИНФОРМАЦИЯ -->
                <div class="weapon-card" style="margin-bottom:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                        <div class="field"><span class="label">Тип</span><span class="value">${w.type}</span></div>
                        <div class="field"><span class="label">Бортовой №</span><span class="value">${w.number}</span></div>
                        <div class="field"><span class="label">Условное обозначение</span><span class="value">${w.symbol || '—'}</span></div>
                        <div class="field"><span class="label">Координаты</span><span class="value">${w.coordinates || '—'}</span></div>
                        <div class="field"><span class="label">Статус</span><span class="value" style="color:${critColor};">${w.status}</span></div>
                        <div class="field"><span class="label">Критичность</span><span class="value" style="color:${critColor};">${criticality}</span></div>
                        <div class="field" style="grid-column:1/3;"><span class="label">Неисправность</span><span class="value">${w.fault || '—'}</span></div>
                        <div class="field" style="grid-column:1/3;"><span class="label">Последняя заявка</span><span class="value">${w.lastRequest || '—'}</span></div>
                        <div class="field" style="grid-column:1/3;border-bottom:none;padding-top:6px;">
                            <span class="label">📊 Статистика заявок</span>
                            <span class="value">Открыто: ${openRepairs.length} | Закрыто: ${closedRepairs.length}</span>
                        </div>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:6px;">
                        <button class="btn-small" onclick="addRepairRequest(${w.id})" style="font-size:10px;">➕ Добавить заявку</button>
                        <button class="btn-small primary" onclick="editWeapon(${w.id})" style="font-size:10px;">✏️ Редактировать</button>
                        <button class="btn-small danger" onclick="deleteWeapon(${w.id})" style="font-size:10px;">🗑️ Удалить</button>
                    </div>
                </div>

                <!-- НИЖНЕЕ ОКНО — ЗАЯВКИ -->
                <div style="border-top:1px solid #2d3a2d;padding-top:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <strong style="color:#4a6a3a;">📋 Заявки на ремонт</strong>
                        <div style="display:flex;gap:6px;">
                            <span style="font-size:11px;color:#f0883e;">🟠 Открытых: ${openRepairs.length}</span>
                            <span style="font-size:11px;color:#3fb950;">🟢 Закрытых: ${closedRepairs.length}</span>
                        </div>
                    </div>
                    ${weaponRepairs.length === 0 ? '<div style="color:#8b949e;font-size:12px;padding:8px 0;">Заявок нет</div>' : ''}
                    ${weaponRepairs.map(r => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #1c2128;font-size:12px;background:${r.status === 'Закрыта' ? '#0d1117' : 'transparent'};">
                            <div style="display:flex;flex-direction:column;gap:2px;flex:1;">
                                <span><strong>${r.date}</strong> — ${r.description}</span>
                                <span style="font-size:10px;color:#8b949e;">${r.status === 'Открыта' ? '🟠 Открыта' : '🟢 Закрыта'}</span>
                            </div>
                            <div style="display:flex;gap:4px;">
                                ${r.status === 'Открыта' ? `<button onclick="closeRepairRequest(${r.id})" style="background:#2d3a2d;border:1px solid #4a6a3a;color:#e6edf3;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;">Закрыть</button>` : ''}
                                <button onclick="deleteRepairRequest(${r.id})" style="background:none;border:none;color:#f85149;cursor:pointer;font-size:12px;">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="modal-actions">
                    <button class="btn-primary" onclick="printWeaponCard(${w.id})">🖨️ Печать</button>
                    <button class="btn-primary" onclick="exportWeaponCard(${w.id})">📊 Excel</button>
                    <button class="btn-secondary" onclick="closeModal()">Закрыть</button>
                </div>
            `;
    openModal(html);
}

function editWeapon(id) {
    const w = weapons.find(w => w.id === id);
    if (!w) return;
    const html = `
                <div class="modal-title">✏️ Редактировать вооружение</div>
                <div class="form-group"><label>Тип *</label><select id="wType">${references.weaponTypes.map(t => `<option value="${t}" ${t===w.type?'selected':''}>${t}</option>`).join('')}</select></div>
                <div class="form-group"><label>Бортовой номер *</label><input id="wNumber" value="${w.number}"></div>
                <div class="form-group"><label>Условное обозначение</label><input id="wSymbol" value="${w.symbol || ''}"></div>
                <div class="form-group"><label>Координаты</label><input id="wCoords" value="${w.coordinates || ''}"></div>
                <div class="form-group"><label>Статус</label><select id="wStatus">${references.weaponStatuses.map(s => `<option value="${s}" ${s===w.status?'selected':''}>${s}</option>`).join('')}</select></div>
                <div class="form-group"><label>Неисправность</label><textarea id="wFault">${w.fault || ''}</textarea></div>
                <div class="form-group"><label>Последняя заявка</label><input id="wLastRequest" value="${w.lastRequest || ''}"></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="saveWeaponEdit(${w.id})">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function saveWeaponEdit(id) {
    const type = document.getElementById('wType').value;
    const number = document.getElementById('wNumber').value.trim();
    const symbol = document.getElementById('wSymbol').value.trim();
    const coordinates = document.getElementById('wCoords').value.trim();
    const status = document.getElementById('wStatus').value;
    const fault = document.getElementById('wFault').value.trim();
    const lastRequest = document.getElementById('wLastRequest').value.trim();
    if (!type || !number) { showToast('Заполните тип и бортовой номер!', 'error'); return; }
    const w = weapons.find(w => w.id === id);
    if (w) {
        w.type = type;
        w.number = number;
        w.symbol = symbol;
        w.coordinates = coordinates;
        w.status = status;
        w.fault = fault;
        w.lastRequest = lastRequest;
        saveData();
        closeModal();
        updateDashboard();
        showToast('✅ Данные обновлены');
        syncToCloud();
    }
}

function deleteWeapon(id) {
    if (confirm('Удалить эту единицу вооружения?')) {
        weapons = weapons.filter(w => w.id !== id);
        repairRequests = repairRequests.filter(r => r.weaponId !== id);
        saveData();
        closeModal();
        updateDashboard();
        showToast('🗑️ Запись удалена');
        syncToCloud();
    }
}

function addRepairRequest(weaponId) {
    const desc = prompt('Опишите неисправность:');
    if (desc && desc.trim()) {
        repairRequests.push({
            id: Date.now(),
            weaponId: weaponId,
            date: new Date().toLocaleString(),
            status: 'Открыта',
            description: desc.trim()
        });
        saveData();
        const w = weapons.find(w => w.id === weaponId);
        if (w) {
            w.status = 'В ремонте';
            w.fault = desc.trim();
            w.lastRequest = 'Заявка №' + Date.now().toString().slice(-6);
            saveData();
        }
        closeModal();
        showWeaponCard(weaponId);
        showToast('✅ Заявка добавлена');
        syncToCloud();
    }
}

function closeRepairRequest(requestId) {
    if (confirm('Закрыть эту заявку?')) {
        const req = repairRequests.find(r => r.id === requestId);
        if (req) {
            req.status = 'Закрыта';
            saveData();
            const openReqs = repairRequests.filter(r => r.weaponId === req.weaponId && r.status === 'Открыта');
            if (openReqs.length === 0) {
                const w = weapons.find(w => w.id === req.weaponId);
                if (w && w.status === 'В ремонте') {
                    w.status = 'Исправно';
                    w.fault = '';
                    saveData();
                }
            }
            closeModal();
            showWeaponCard(req.weaponId);
            showToast('✅ Заявка закрыта');
            syncToCloud();
        }
    }
}

function deleteRepairRequest(requestId) {
    if (confirm('Удалить эту заявку?')) {
        const req = repairRequests.find(r => r.id === requestId);
        if (req) {
            const weaponId = req.weaponId;
            repairRequests = repairRequests.filter(r => r.id !== requestId);
            saveData();
            const openReqs = repairRequests.filter(r => r.weaponId === weaponId && r.status === 'Открыта');
            if (openReqs.length === 0) {
                const w = weapons.find(w => w.id === weaponId);
                if (w && w.status === 'В ремонте') {
                    w.status = 'Исправно';
                    w.fault = '';
                    saveData();
                }
            }
            closeModal();
            showWeaponCard(weaponId);
            showToast('🗑️ Заявка удалена');
            syncToCloud();
        }
    }
}

function printWeaponCard(id) {
    const w = weapons.find(w => w.id === id);
    if (!w) return;
    const weaponRepairs = repairRequests.filter(r => r.weaponId === id);
    const openReqs = weaponRepairs.filter(r => r.status === 'Открыта');
    const closedReqs = weaponRepairs.filter(r => r.status === 'Закрыта');

    let criticality = 'Низкий';
    let critColor = '#27ae60';
    if (w.status === 'Неисправно') { criticality = 'Критичный';
        critColor = '#e74c3c'; } else if (w.status === 'В ремонте') { criticality = 'Средний';
        critColor = '#e67e22'; }

    const html = `
                <html><head><meta charset="UTF-8"><style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    h1 { text-align: center; color: #1a1e1a; border-bottom: 2px solid #4a6a3a; padding-bottom: 10px; }
                    .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 700px; margin: 0 auto; }
                    .section-title { font-weight: bold; color: #4a6a3a; margin: 10px 0 6px 0; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                    .field { display: flex; padding: 4px 0; border-bottom: 1px solid #eee; font-size: 13px; }
                    .label { font-weight: bold; width: 160px; color: #555; }
                    .value { flex: 1; }
                    .repair-item { padding: 4px 0; border-bottom: 1px solid #eee; font-size: 12px; display: flex; justify-content: space-between; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
                    .status-open { color: #e67e22; }
                    .status-closed { color: #27ae60; }
                    .crit-${w.status === 'Неисправно' ? 'red' : w.status === 'В ремонте' ? 'orange' : 'green'} { color: ${critColor}; }
                </style></head>
                <body>
                    <h1>🔫 Карточка вооружения — ${w.number}</h1>
                    <div class="card">
                        <div class="field"><span class="label">Тип</span><span class="value">${w.type}</span></div>
                        <div class="field"><span class="label">Бортовой номер</span><span class="value">${w.number}</span></div>
                        <div class="field"><span class="label">Условное обозначение</span><span class="value">${w.symbol || '—'}</span></div>
                        <div class="field"><span class="label">Координаты</span><span class="value">${w.coordinates || '—'}</span></div>
                        <div class="field"><span class="label">Статус</span><span class="value crit-${w.status === 'Неисправно' ? 'red' : w.status === 'В ремонте' ? 'orange' : 'green'}">${w.status}</span></div>
                        <div class="field"><span class="label">Критичность</span><span class="value crit-${w.status === 'Неисправно' ? 'red' : w.status === 'В ремонте' ? 'orange' : 'green'}">${criticality}</span></div>
                        <div class="field"><span class="label">Неисправность</span><span class="value">${w.fault || '—'}</span></div>
                        <div class="field"><span class="label">Последняя заявка</span><span class="value">${w.lastRequest || '—'}</span></div>

                        <div class="section-title">📋 Заявки на ремонт (${weaponRepairs.length})</div>
                        <div style="margin-bottom:4px;font-size:12px;color:#666;">
                            Открытых: ${openReqs.length} | Закрытых: ${closedReqs.length}
                        </div>
                        ${weaponRepairs.length === 0 ? '<div style="color:#999;font-size:12px;padding:4px 0;">Заявок нет</div>' : ''}
                        ${weaponRepairs.map(r => `
                            <div class="repair-item">
                                <span>${r.date} — ${r.description}</span>
                                <span class="${r.status === 'Открыта' ? 'status-open' : 'status-closed'}">${r.status === 'Открыта' ? '🟠 Открыта' : '🟢 Закрыта'}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="footer">Учетная Система Бригада "БАРС-МОСКВА" • ${new Date().toLocaleString()}</div>
                    <script>window.print(); setTimeout(window.close, 1000);<\/script>
                </body></html>
            `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
}

function exportWeaponCard(id) {
    const w = weapons.find(w => w.id === id);
    if (!w) return;
    const weaponRepairs = repairRequests.filter(r => r.weaponId === id);

    let criticality = 'Низкий';
    if (w.status === 'Неисправно') criticality = 'Критичный';
    else if (w.status === 'В ремонте') criticality = 'Средний';

    const headers = ['Поле', 'Значение'];
    const rows = [
        ['Тип', w.type],
        ['Бортовой номер', w.number],
        ['Условное обозначение', w.symbol || '—'],
        ['Координаты', w.coordinates || '—'],
        ['Статус', w.status],
        ['Критичность', criticality],
        ['Неисправность', w.fault || '—'],
        ['Последняя заявка', w.lastRequest || '—'],
        ['--- Заявки ---', ''],
        ['Дата', 'Описание', 'Статус']
    ];
    weaponRepairs.forEach(r => {
        rows.push([r.date, r.description, r.status]);
    });

    let csv = headers.join(';') + '\n';
    rows.forEach(r => {
        csv += r.join(';') + '\n';
    });

    downloadFile(csv, `weapon_${w.number}_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
    showToast('📊 Карточка выгружена в Excel');
}

// ================================================================
//  СКЛАД
// ================================================================

function updateStockFilters() {
    const typeSelect = document.getElementById('stockTypeFilter');
    const storageSelect = document.getElementById('stockStorageFilter');
    const types = ['all', ...new Set(items.map(i => i.type || 'Прочее'))];
    const storages = ['all', ...new Set(items.map(i => i.storage || 'Без склада'))];
    typeSelect.innerHTML = types.map(t => `<option value="${t}">${t === 'all' ? 'Все типы' : t}</option>`).join(
        '');
    storageSelect.innerHTML = storages.map(s => `<option value="${s}">${s === 'all' ? 'Все склады' : s}</option>`)
        .join('');
}

function renderStock() {
    const search = document.getElementById('stockSearch').value.toLowerCase();
    const typeFilter = document.getElementById('stockTypeFilter').value;
    const storageFilter = document.getElementById('stockStorageFilter').value;
    let filtered = items;
    if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search) || (i.article || '').toLowerCase()
        .includes(search));
    if (typeFilter !== 'all') filtered = filtered.filter(i => (i.type || 'Прочее') === typeFilter);
    if (storageFilter !== 'all') filtered = filtered.filter(i => (i.storage || 'Без склада') === storageFilter);
    const tbody = document.getElementById('stockTable');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML =
            `<tr><td colspan="9" style="text-align:center;color:#8b949e;padding:12px;">Нет ТМЦ</td></tr>`;
        return;
    }
    filtered.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td><strong>${item.article || '—'}</strong></td>
                    <td>${item.name}</td>
                    <td>${item.type || '—'}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>${item.storage || '—'}</td>
                    <td>${item.note || '—'}</td>
                    <td>
                        <button onclick="editItem(${item.id})" style="background:none;border:none;color:#4a6a3a;cursor:pointer;">✏️</button>
                        <button onclick="deleteItem(${item.id})" style="background:none;border:none;color:#f85149;cursor:pointer;">✕</button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function showAddItemModal() {
    const stockTypes = references.stockTypes || [];
    const html = `
                <div class="modal-title">📦 Добавить ТМЦ</div>
                <div class="form-group"><label>Наименование *</label><input id="iName" placeholder="Наименование ТМЦ"></div>
                <div class="form-group"><label>Артикул</label><input id="iArticle" placeholder="Артикул"></div>
                <div class="form-group"><label>Тип</label><select id="iType">${stockTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
                <div class="form-group"><label>Единица измерения</label><select id="iUnit">${references.units.map(u => `<option value="${u}">${u}</option>`).join('')}</select></div>
                <div class="form-group"><label>Количество</label><input id="iQuantity" type="number" value="0"></div>
                <div class="form-group"><label>Склад</label><input id="iStorage" placeholder="Номер склада"></div>
                <div class="form-group"><label>Примечание</label><input id="iNote" placeholder="Дополнительная информация"></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="saveItem()">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function saveItem() {
    const name = document.getElementById('iName').value.trim();
    const article = document.getElementById('iArticle').value.trim();
    const type = document.getElementById('iType').value;
    const unit = document.getElementById('iUnit').value;
    const quantity = parseInt(document.getElementById('iQuantity').value) || 0;
    const storage = document.getElementById('iStorage').value.trim();
    const note = document.getElementById('iNote').value.trim();
    if (!name) { showToast('Введите наименование!', 'error'); return; }
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    items.push({ id: newId, name, article, type, unit, quantity, storage, note });
    saveData();
    closeModal();
    updateDashboard();
    showToast('✅ ТМЦ добавлено');
    syncToCloud();
    addNotification('info', `📦 Добавлен ТМЦ: ${name} (${quantity} ${unit})`);
}

function editItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const stockTypes = references.stockTypes || [];
    const html = `
                <div class="modal-title">✏️ Редактировать ТМЦ</div>
                <div class="form-group"><label>Наименование *</label><input id="iName" value="${item.name}"></div>
                <div class="form-group"><label>Артикул</label><input id="iArticle" value="${item.article || ''}"></div>
                <div class="form-group"><label>Тип</label><select id="iType">${stockTypes.map(t => `<option value="${t}" ${t===item.type?'selected':''}>${t}</option>`).join('')}</select></div>
                <div class="form-group"><label>Единица измерения</label><select id="iUnit">${references.units.map(u => `<option value="${u}" ${u===item.unit?'selected':''}>${u}</option>`).join('')}</select></div>
                <div class="form-group"><label>Количество</label><input id="iQuantity" type="number" value="${item.quantity}"></div>
                <div class="form-group"><label>Склад</label><input id="iStorage" value="${item.storage}"></div>
                <div class="form-group"><label>Примечание</label><input id="iNote" value="${item.note || ''}"></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="saveItemEdit(${item.id})">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function saveItemEdit(id) {
    const name = document.getElementById('iName').value.trim();
    const article = document.getElementById('iArticle').value.trim();
    const type = document.getElementById('iType').value;
    const unit = document.getElementById('iUnit').value;
    const quantity = parseInt(document.getElementById('iQuantity').value) || 0;
    const storage = document.getElementById('iStorage').value.trim();
    const note = document.getElementById('iNote').value.trim();
    if (!name) { showToast('Введите наименование!', 'error'); return; }
    const item = items.find(i => i.id === id);
    if (item) {
        item.name = name;
        item.article = article;
        item.type = type;
        item.unit = unit;
        item.quantity = quantity;
        item.storage = storage;
        item.note = note;
        saveData();
        closeModal();
        updateDashboard();
        showToast('✅ Данные обновлены');
        syncToCloud();
    }
}

function deleteItem(id) {
    if (confirm('Удалить эту позицию?')) {
        items = items.filter(i => i.id !== id);
        saveData();
        updateDashboard();
        showToast('🗑️ Запись удалена');
        syncToCloud();
    }
}

// ================================================================
//  ЖУРНАЛ ТО
// ================================================================

function renderHistory() {
    const div = document.getElementById('historyList');
    if (historyData.length === 0) {
        div.innerHTML = `<div style="color:#8b949e;padding:10px;text-align:center;">Нет записей</div>`;
        return;
    }
    const sorted = [...historyData].sort((a, b) => b.id - a.id);
    div.innerHTML = sorted.slice(0, 30).map(h => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1c2128;font-size:11px;">
                    <div>
                        <span><strong>${h.reg}</strong> — ${h.model}</span>
                        <span style="color:#8b949e;font-size:10px;margin-left:8px;">${h.date} • ${h.mileage} км</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span style="color:#4a6a3a;">${h.toType}</span>
                        <button onclick="deleteHistory(${h.id})" style="background:none;border:none;color:#f85149;font-size:12px;cursor:pointer;">✕</button>
                    </div>
                </div>
            `).join('');
}

function showAddHistoryModal() {
    const html = `
                <div class="modal-title">📜 Добавить запись о ТО</div>
                <div class="form-group"><label>Автомобиль *</label><select id="hCar">${cars.map(c => `<option value="${c.id}">${c.reg} — ${c.model}</option>`).join('')}</select></div>
                <div class="form-group"><label>Дата ТО *</label><input id="hDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
                <div class="form-group"><label>Пробег (км) *</label><input id="hMileage" type="number" placeholder="Пробег при ТО"></div>
                <div class="form-group"><label>Тип ТО *</label><select id="hType">${references.toTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
                <div class="form-group"><label>Примечание</label><textarea id="hNote" placeholder="Дополнительная информация"></textarea></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="saveHistory()">Сохранить</button>
                </div>
            `;
    openModal(html);
}

function saveHistory() {
    const carId = parseInt(document.getElementById('hCar').value);
    const date = document.getElementById('hDate').value;
    const mileage = parseInt(document.getElementById('hMileage').value) || 0;
    const toType = document.getElementById('hType').value;
    const note = document.getElementById('hNote').value.trim();
    if (!carId || !date || !mileage || !toType) {
        showToast('Заполните все обязательные поля!', 'error');
        return;
    }
    const car = cars.find(c => c.id === carId);
    if (!car) { showToast('Автомобиль не найден!', 'error'); return; }
    const newId = historyData.length > 0 ? Math.max(...historyData.map(h => h.id)) + 1 : 1;
    historyData.push({
        id: newId,
        date: date.split('-').reverse().join('.'),
        reg: car.reg,
        model: car.model,
        mileage,
        toType,
        note
    });
    if (mileage > car.last_to) {
        car.last_to = mileage;
        car.plan_to = mileage + 10000;
        car.remainder = car.plan_to - car.mileage;
    }
    saveData();
    closeModal();
    updateDashboard();
    showToast('✅ Запись о ТО добавлена');
    syncToCloud();
    addNotification('info', `📋 Добавлена запись ТО для ${car.reg} (${mileage} км)`);
}

function deleteHistory(id) {
    if (confirm('Удалить эту запись?')) {
        historyData = historyData.filter(h => h.id !== id);
        saveData();
        updateDashboard();
        showToast('Запись удалена');
        syncToCloud();
    }
}

// ================================================================
//  ОТЧЁТЫ
// ================================================================

function showReportDialog() {
    const html = `
                <div class="modal-title">📊 Выбор данных для отчёта</div>
                <div class="form-group">
                    <label>Выберите данные:</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptCars" checked> 🚗 Автопарк</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptPersons" checked> 👥 Личный состав</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptWeapons" checked> 🔫 Вооружение</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptStock" checked> 📦 Склад</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptHistory" checked> 📋 История ТО</label>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Отмена</button>
                    <button class="btn-primary" onclick="generateReport()">📊 Сформировать отчёт</button>
                    <button class="btn-primary" onclick="generateExcelReport()">📊 Выгрузить в Excel</button>
                </div>
            `;
    openModal(html);
}

function generateReport() {
    closeModal();
    let html = `
                <html><head><meta charset="UTF-8"><style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #1a1e1a; border-bottom: 2px solid #4a6a3a; padding-bottom: 10px; }
                    h2 { color: #4a6a3a; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                    th { background: #1a1e1a; color: white; padding: 6px; text-align: left; border: 1px solid #333; }
                    td { padding: 4px 6px; border: 1px solid #ccc; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
                </style></head>
                <body>
                    <h1>📊 ОТЧЁТ ПО БРИГАДЕ "БАРС-МОСКВА"</h1>
                    <p style="text-align:center;">Дата формирования: ${new Date().toLocaleString()}</p>
            `;
    const rptCars = document.getElementById('rptCars').checked;
    const rptPersons = document.getElementById('rptPersons').checked;
    const rptWeapons = document.getElementById('rptWeapons').checked;
    const rptStock = document.getElementById('rptStock').checked;
    const rptHistory = document.getElementById('rptHistory').checked;
    if (rptCars && cars.length > 0) {
        html +=
            `<h2>🚗 Автопарк (${cars.length})</h2><table><thead><tr><th>№</th><th>Рег.номер</th><th>Модель</th><th>Пробег</th><th>Остаток</th><th>Статус</th></tr></thead><tbody>`;
        cars.forEach((c, i) => {
            html +=
                `<tr><td>${i+1}</td><td>${c.reg}</td><td>${c.model}</td><td>${c.mileage}</td><td>${c.remainder}</td><td>${c.status}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    if (rptPersons && persons.length > 0) {
        html +=
            `<h2>👥 Личный состав (${persons.length})</h2><table><thead><tr><th>№</th><th>ФИО</th><th>Должность</th><th>Подразделение</th><th>Звание</th></tr></thead><tbody>`;
        persons.forEach((p, i) => {
            html +=
                `<tr><td>${i+1}</td><td>${p.fio}</td><td>${p.position}</td><td>${p.department}</td><td>${p.rank}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    if (rptWeapons && weapons.length > 0) {
        html +=
            `<h2>🔫 Вооружение (${weapons.length})</h2><table><thead><tr><th>№</th><th>Тип</th><th>Бортовой №</th><th>Статус</th><th>Неисправность</th></tr></thead><tbody>`;
        weapons.forEach((w, i) => {
            html +=
                `<tr><td>${i+1}</td><td>${w.type}</td><td>${w.number}</td><td>${w.status}</td><td>${w.fault || '—'}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    if (rptStock && items.length > 0) {
        html +=
            `<h2>📦 Склад (${items.length})</h2><table><thead><tr><th>№</th><th>Наименование</th><th>Артикул</th><th>Кол-во</th><th>Ед. изм.</th><th>Склад</th></tr></thead><tbody>`;
        items.forEach((item, i) => {
            html +=
                `<tr><td>${i+1}</td><td>${item.name}</td><td>${item.article || '—'}</td><td>${item.quantity}</td><td>${item.unit}</td><td>${item.storage || '—'}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    if (rptHistory && historyData.length > 0) {
        html +=
            `<h2>📋 История ТО (${historyData.length})</h2><table><thead><tr><th>№</th><th>Дата</th><th>Автомобиль</th><th>Пробег</th><th>Тип ТО</th></tr></thead><tbody>`;
        const sorted = [...historyData].sort((a, b) => b.id - a.id);
        sorted.forEach((h, i) => {
            html +=
                `<tr><td>${i+1}</td><td>${h.date}</td><td>${h.reg}</td><td>${h.mileage}</td><td>${h.toType}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    html += `
                    <div class="footer">Учетная Система Бригада "БАРС-МОСКВА" • ${new Date().toLocaleString()}</div>
                    <script>window.print(); setTimeout(window.close, 1000);<\/script>
                </body></html>
            `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    showToast('📊 Отчёт сформирован');
}

function generateExcelReport() {
    closeModal();
    const rptCars = document.getElementById('rptCars').checked;
    const rptPersons = document.getElementById('rptPersons').checked;
    const rptWeapons = document.getElementById('rptWeapons').checked;
    const rptStock = document.getElementById('rptStock').checked;
    const rptHistory = document.getElementById('rptHistory').checked;
    let csv = 'Учетная Система Бригада "БАРС-МОСКВА"\n';
    csv += `Отчёт от: ${new Date().toLocaleString()}\n\n`;
    if (rptCars && cars.length > 0) {
        csv += '=== АВТОПАРК ===\n';
        csv += '№;Рег.номер;Модель;Пробег;Остаток;Статус\n';
        cars.forEach((c, i) => {
            csv += `${i+1};${c.reg};${c.model};${c.mileage};${c.remainder};${c.status}\n`;
        });
        csv += '\n';
    }
    if (rptPersons && persons.length > 0) {
        csv += '=== ЛИЧНЫЙ СОСТАВ ===\n';
        csv += '№;ФИО;Должность;Подразделение;Звание;Телефон\n';
        persons.forEach((p, i) => {
            csv += `${i+1};${p.fio};${p.position};${p.department};${p.rank};${p.phone || ''}\n`;
        });
        csv += '\n';
    }
    if (rptWeapons && weapons.length > 0) {
        csv += '=== ВООРУЖЕНИЕ ===\n';
        csv += '№;Тип;Бортовой №;Статус;Неисправность;Заявка\n';
        weapons.forEach((w, i) => {
            csv += `${i+1};${w.type};${w.number};${w.status};${w.fault || ''};${w.repairRequest || ''}\n`;
        });
        csv += '\n';
    }
    if (rptStock && items.length > 0) {
        csv += '=== СКЛАД ===\n';
        csv += '№;Наименование;Артикул;Тип;Кол-во;Ед.изм.;Склад;Примечание\n';
        items.forEach((item, i) => {
            csv +=
                `${i+1};${item.name};${item.article || ''};${item.type || ''};${item.quantity};${item.unit};${item.storage || ''};${item.note || ''}\n`;
        });
        csv += '\n';
    }
    if (rptHistory && historyData.length > 0) {
        csv += '=== ИСТОРИЯ ТО ===\n';
        csv += '№;Дата;Автомобиль;Модель;Пробег;Тип ТО;Примечание\n';
        const sorted = [...historyData].sort((a, b) => b.id - a.id);
        sorted.forEach((h, i) => {
            csv += `${i+1};${h.date};${h.reg};${h.model};${h.mileage};${h.toType};${h.note || ''}\n`;
        });
        csv += '\n';
    }
    downloadFile(csv, `report_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
    showToast('📊 Отчёт выгружен в Excel');
}

function printReport() {
    const html = `
                <html><head><meta charset="UTF-8"><style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #1a1e1a; border-bottom: 2px solid #4a6a3a; padding-bottom: 10px; }
                    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
                    .stat { background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center; }
                    .stat .num { font-size: 24px; font-weight: bold; color: #4a6a3a; }
                    .stat .label { font-size: 12px; color: #666; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
                </style></head>
                <body>
                    <h1>📊 ОТЧЁТ ПО БРИГАДЕ "БАРС-МОСКВА"</h1>
                    <p style="text-align:center;">Дата формирования: ${new Date().toLocaleString()}</p>
                    <div class="summary">
                        <div class="stat"><div class="num">${cars.length}</div><div class="label">🚗 Автомобилей</div></div>
                        <div class="stat"><div class="num">${persons.length}</div><div class="label">👥 Личного состава</div></div>
                        <div class="stat"><div class="num">${weapons.length}</div><div class="label">🔫 Единиц вооружения</div></div>
                        <div class="stat"><div class="num">${items.length}</div><div class="label">📦 Позиций на складе</div></div>
                    </div>
                    <div class="footer">Учетная Система Бригада "БАРС-МОСКВА" • ${new Date().toLocaleString()}</div>
                    <script>window.print(); setTimeout(window.close, 1000);<\/script>
                </body></html>
            `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    showToast('🖨️ Отправлено на печать');
}

function exportToExcel() {
    let csv = 'Учетная Система Бригада "БАРС-МОСКВА"\n';
    csv += `Экспорт от: ${new Date().toLocaleString()}\n\n`;
    csv += '=== АВТОПАРК ===\n';
    csv += '№;Рег.номер;Модель;СТС;Пробег;Остаток;Статус\n';
    cars.forEach((c, i) => {
        csv += `${i+1};${c.reg};${c.model};${c.sts || ''};${c.mileage};${c.remainder};${c.status}\n`;
    });
    csv += '\n';
    csv += '=== ЛИЧНЫЙ СОСТАВ ===\n';
    csv += '№;ФИО;Должность;Подразделение;Звание;Телефон\n';
    persons.forEach((p, i) => {
        csv += `${i+1};${p.fio};${p.position};${p.department};${p.rank};${p.phone || ''}\n`;
    });
    csv += '\n';
    csv += '=== ВООРУЖЕНИЕ ===\n';
    csv += '№;Тип;Бортовой №;Статус;Неисправность;Заявка\n';
    weapons.forEach((w, i) => {
        csv += `${i+1};${w.type};${w.number};${w.status};${w.fault || ''};${w.repairRequest || ''}\n`;
    });
    csv += '\n';
    csv += '=== СКЛАД ===\n';
    csv += '№;Наименование;Артикул;Тип;Кол-во;Ед.изм.;Склад;Примечание\n';
    items.forEach((item, i) => {
        csv +=
            `${i+1};${item.name};${item.article || ''};${item.type || ''};${item.quantity};${item.unit};${item.storage || ''};${item.note || ''}\n`;
    });
    csv += '\n';
    csv += '=== ИСТОРИЯ ТО ===\n';
    csv += '№;Дата;Автомобиль;Модель;Пробег;Тип ТО;Примечание\n';
    const sorted = [...historyData].sort((a, b) => b.id - a.id);
    sorted.forEach((h, i) => {
        csv += `${i+1};${h.date};${h.reg};${h.model};${h.mileage};${h.toType};${h.note || ''}\n`;
    });
    downloadFile(csv, `bars_full_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
    showToast('📊 Все данные выгружены в Excel');
}

// ================================================================
//  АДМИНИСТРИРОВАНИЕ
// ================================================================

function renderUsers() {
    const div = document.getElementById('usersList');
    div.innerHTML = Object.keys(ROLES).map(role => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1c2128;font-size:12px;">
                    <span>${ROLES[role].label}</span>
                    <span style="color:#8b949e;">${role}</span>
                    ${currentRole === 'admin' ? `<button onclick="changePassword('${role}')" style="background:none;border:1px solid #2d3a2d;color:#e6edf3;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;">Сменить пароль</button>` : ''}
                </div>
            `).join('');
}

function changePassword(role) {
    const newPass = prompt('Введите новый пароль для ' + ROLES[role].label + ':');
    if (newPass && newPass.trim().length >= 4) {
        ROLES[role].password = newPass.trim();
        localStorage.setItem('bars_roles', JSON.stringify(ROLES));
        showToast('✅ Пароль изменён для ' + ROLES[role].label);
    } else if (newPass !== null) {
        showToast('❌ Пароль должен быть не менее 4 символов', 'error');
    }
}

// ================================================================
//  ЭКСПОРТ
// ================================================================

function exportAllData() {
    const data = {
        cars,
        persons,
        weapons,
        items,
        history: historyData,
        references,
        notifications,
        repairRequests,
        exported: new Date().toISOString(),
        version: '7.0'
    };
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `bars_data_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
    showToast('📤 Данные экспортированы');
}

function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ================================================================
//  СБРОС
// ================================================================

function resetAllData() {
    if (confirm('⚠️ ВНИМАНИЕ! Это действие удалит ВСЕ данные!\n\nВы уверены?')) {
        if (confirm('Последнее подтверждение: удалить все данные?')) {
            const prefix = 'bars_';
            localStorage.removeItem(prefix + 'cars');
            localStorage.removeItem(prefix + 'persons');
            localStorage.removeItem(prefix + 'weapons');
            localStorage.removeItem(prefix + 'items');
            localStorage.removeItem(prefix + 'history');
            localStorage.removeItem(prefix + 'refs');
            localStorage.removeItem(prefix + 'notifs');
            localStorage.removeItem(prefix + 'repairs');
            loadData();
            updateDashboard();
            showToast('🗑️ Все данные сброшены');
        }
    }
}

// ================================================================
//  TOAST
// ================================================================

function showToast(message, type = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ================================================================
//  ОТКРЫТИЕ/ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
// ================================================================

function openModal(html) {
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ================================================================
//  ЗАПУСК ПРИ ЗАГРУЗКЕ
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    const savedRoles = localStorage.getItem('bars_roles');
    if (savedRoles) {
        try {
            const parsed = JSON.parse(savedRoles);
            Object.keys(parsed).forEach(key => {
                if (ROLES[key]) {
                    ROLES[key].password = parsed[key].password;
                }
            });
        } catch (e) {}
    }
    renderMainScreen();
    document.getElementById('filterReg').addEventListener('input', renderCars);
    document.getElementById('filterModel').addEventListener('input', renderCars);

    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!currentRole) { openAuth(this.dataset.tab); return; }
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

    // Автосинхронизация
    setInterval(() => {
        if (navigator.onLine && currentRole) {
            syncToCloud();
        }
    }, 300000);

    window.addEventListener('online', () => {
        showToast('🌐 Интернет восстановлен', 'sync');
        if (currentRole) syncToCloud();
    });

    window.addEventListener('offline', () => {
        showToast('📡 Нет интернета. Данные сохраняются локально.', 'error');
        document.getElementById('syncStatus').textContent = '📡 офлайн';
        document.getElementById('syncStatus').className = 'sync-status offline';
    });

    if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => Notification.requestPermission(), 3000);
    }
});
