// js/app.js - Главный модуль приложения
const App = {
    init: () => {
        // Загрузка данных
        DataManager.load();
        
        // Инициализация авторизации
        AuthManager.init();
        
        // Рендер главного экрана
        App.renderMainScreen();
        
        // Настройка обработчиков
        document.getElementById('filterReg').addEventListener('input', () => CarsManager.render());
        document.getElementById('filterModel').addEventListener('input', () => CarsManager.render());
        document.getElementById('stockSearch').addEventListener('input', () => StockManager.render());
        document.getElementById('stockTypeFilter').addEventListener('change', () => StockManager.render());
        document.getElementById('stockStorageFilter').addEventListener('change', () => StockManager.render());
        
        // Настройка вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!AuthManager.currentRole) {
                    AuthManager.openAuth(this.dataset.tab);
                    return;
                }
                App.openTab(this.dataset.tab);
            });
        });
        
        // Закрытие модального окна по клику вне
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) Utils.closeModal();
        });
        
        // Автоматическая синхронизация (каждые 5 минут)
        setInterval(() => {
            if (navigator.onLine && AuthManager.currentRole) {
                SyncManager.sync();
            }
        }, 300000);
        
        // Запрос разрешения на уведомления
        if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => Notification.requestPermission(), 3000);
        }
        
        // Обработка офлайн-очереди
        if (navigator.onLine) {
            SyncManager.processQueue();
        }
        
        Utils.showToast('⚔️ Система загружена');
    },
    
    renderMainScreen: () => {
        const grid = document.getElementById('tilesGrid');
        const tiles = [
            { id: 'tab1', icon: '🚗', name: 'Автопарк', count: DataManager.cars.length, role: 'all' },
            { id: 'tab2', icon: '👥', name: 'Личный состав', count: DataManager.persons.length, role: 'admin,starshiy' },
            { id: 'tab3', icon: '🔫', name: 'Вооружение', count: DataManager.weapons.length, role: 'admin,oruzhie' },
            { id: 'tab4', icon: '📦', name: 'Склад', count: DataManager.items.length, role: 'admin,klad,mehanik' },
            { id: 'tab5', icon: '📋', name: 'Журнал ТО', count: DataManager.history.length, role: 'admin,starshiy,mehanik' },
            { id: 'tab6', icon: '📊', name: 'Отчёты', count: 0, role: 'admin,starshiy' },
            { id: 'tab7', icon: '⚙️', name: 'Администрирование', count: 0, role: 'admin' }
        ];
        
        const overdueCount = DataManager.cars.filter(c => c.remainder < 0).length;
        const repairCount = DataManager.weapons.filter(w => w.status === 'В ремонте' || w.status === 'Неисправно').length;
        
        grid.innerHTML = tiles.map(t => {
            let badge = '';
            if (t.id === 'tab1' && overdueCount > 0) {
                badge = `<span class="tile-badge">${overdueCount}</span>`;
            }
            if (t.id === 'tab3' && repairCount > 0) {
                badge = `<span class="tile-badge">${repairCount}</span>`;
            }
            return `
                <div class="tile" onclick="window.auth.openAuth('${t.id}')">
                    <span class="tile-icon">${t.icon}</span>
                    <span class="tile-name">${t.name}</span>
                    <span class="tile-count">${t.count > 0 ? t.count + ' зап.' : ''}</span>
                    ${t.role !== 'all' ? '<span class="tile-lock">🔒</span>' : ''}
                    ${badge}
                </div>
            `;
        }).join('');
    },
    
    openTab: (tabId) => {
        document.getElementById('mainScreen').classList.add('hidden');
        document.getElementById('tabsWrapper').classList.add('active');
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (btn) btn.classList.add('active');
        
        const content = document.getElementById(tabId);
        if (content) content.classList.add('active');
        
        // Обновляем видимость вкладок
        document.querySelectorAll('.tab-btn').forEach(b => {
            const roles = b.dataset.role.split(',');
            if (roles.includes('all') || (AuthManager.currentRole && roles.includes(AuthManager.currentRole))) {
                b.style.display = '';
            } else {
                b.style.display = 'none';
            }
        });
        
        App.updateDashboard();
    },
    
    goHome: () => {
        document.getElementById('tabsWrapper').classList.remove('active');
        document.getElementById('mainScreen').classList.remove('hidden');
        App.renderMainScreen();
        Utils.showToast('🏠 Главный экран');
    },
    
    updateDashboard: () => {
        const total = DataManager.cars.length;
        const overdue = DataManager.cars.filter(c => c.remainder < 0).length;
        const soon = DataManager.cars.filter(c => c.remainder >= 0 && c.remainder <= 1000).length;
        const ok = DataManager.cars.filter(c => c.remainder > 1000).length;
        
        document.getElementById('totalCars').textContent = total;
        document.getElementById('overdue').textContent = overdue;
        document.getElementById('soon').textContent = soon;
        document.getElementById('ok').textContent = ok;
        
        const wTotal = DataManager.weapons.length;
        const wRepair = DataManager.weapons.filter(w => w.status === 'В ремонте').length;
        const wFault = DataManager.weapons.filter(w => w.status === 'Неисправно').length;
        const openRequests = DataManager.repairs.filter(r => r.status === 'Открыта').length;
        
        document.getElementById('weaponTotal').textContent = wTotal;
        document.getElementById('weaponRepair').textContent = wRepair;
        document.getElementById('weaponFault').textContent = wFault;
        document.getElementById('weaponRequests').textContent = openRequests;
        
        // Рендерим все таблицы
        CarsManager.render();
        PersonsManager.render();
        WeaponsManager.render();
        RepairsManager.render();
        StockManager.render();
        HistoryManager.render();
        StockManager.updateFilters();
        App.renderMainScreen();
        RefsManager.render();
        App.renderUsers();
        DataManager.save();
        window.notifications.checkCritical();
        window.notifications.updateBadge();
    },
    
    renderUsers: () => {
        const div = document.getElementById('usersList');
        div.innerHTML = Object.keys(DataManager.roles).map(role => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1c2128;font-size:12px;">
                <span>${DataManager.roles[role].label}</span>
                <span style="color:#8b949e;">${role}</span>
                ${AuthManager.currentRole === 'admin' ? `<button onclick="window.auth.changePassword('${role}')" style="background:none;border:1px solid #2d3a2d;color:#e6edf3;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;">Сменить пароль</button>` : ''}
            </div>
        `).join('');
    }
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => App.init());

window.app = App;