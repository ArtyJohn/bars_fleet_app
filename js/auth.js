// js/auth.js - Авторизация
const AuthManager = {
    currentRole: null,
    currentUser: null,
    targetTab: null,
    
    init: () => {
        console.log('🔐 AuthManager.init()');
        const saved = sessionStorage.getItem('bars_session');
        if (saved) {
            try {
                const session = JSON.parse(saved);
                AuthManager.currentRole = session.role;
                AuthManager.currentUser = DataManager.roles[session.role];
                AuthManager.updateUI();
                console.log('✅ Сессия восстановлена:', session.role);
            } catch (e) {
                console.warn('⚠️ Ошибка восстановления сессии:', e);
                AuthManager.logout();
            }
        }
    },
    
    login: () => {
        console.log('🔐 AuthManager.login()');
        const role = document.getElementById('authRole').value;
        const password = document.getElementById('authPassword').value;
        const roleData = DataManager.roles[role];
        
        if (roleData && roleData.passwordHash === DataManager.hashPassword(password)) {
            console.log('✅ Авторизация успешна');
            AuthManager.currentRole = role;
            AuthManager.currentUser = roleData;
            
            sessionStorage.setItem('bars_session', JSON.stringify({ role }));
            
            document.getElementById('authOverlay').classList.remove('active');
            AuthManager.updateUI();
            
            if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
            
            Utils.showToast('✅ Добро пожаловать, ' + roleData.name + '!');
            
            if (AuthManager.targetTab) {
                console.log('➡️ Переход на вкладку:', AuthManager.targetTab);
                if (window.app && typeof window.app.openTab === 'function') {
                    window.app.openTab(AuthManager.targetTab);
                }
                AuthManager.targetTab = null;
            } else {
                if (window.app && typeof window.app.openTab === 'function') {
                    window.app.openTab('tab1');
                }
            }
            
            if (window.app && typeof window.app.updateDashboard === 'function') {
                window.app.updateDashboard();
            }
            if (window.refs && typeof window.refs.render === 'function') {
                window.refs.render();
            }
            if (window.notifications && typeof window.notifications.render === 'function') {
                window.notifications.render();
            }
            if (window.app && typeof window.app.renderUsers === 'function') {
                window.app.renderUsers();
            }
            
            setTimeout(() => {
                if (window.sync && typeof window.sync.sync === 'function') {
                    window.sync.sync();
                }
            }, 2000);
        } else {
            console.warn('❌ Неверный пароль');
            document.getElementById('authError').classList.add('show');
            document.getElementById('authPassword').value = '';
            document.getElementById('authPassword').focus();
            setTimeout(() => document.getElementById('authError').classList.remove('show'), 3000);
        }
    },
    
    logout: () => {
        console.log('🔐 AuthManager.logout()');
        AuthManager.currentRole = null;
        AuthManager.currentUser = null;
        sessionStorage.removeItem('bars_session');
        document.getElementById('authOverlay').classList.remove('active');
        AuthManager.updateUI();
        if (window.app && typeof window.app.goHome === 'function') {
            window.app.goHome();
        }
        Utils.showToast('👋 Выход выполнен');
    },
    
    cancel: () => {
        document.getElementById('authOverlay').classList.remove('active');
        AuthManager.targetTab = null;
    },
    
    openAuth: (tabId) => {
        console.log('🔐 AuthManager.openAuth() tabId:', tabId);
        
        if (AuthManager.currentRole && AuthManager.isTabAvailable(tabId)) {
            console.log('✅ Доступ разрешён, открываем вкладку');
            if (window.app && typeof window.app.openTab === 'function') {
                window.app.openTab(tabId);
            }
            return;
        }
        
        console.log('🔒 Требуется авторизация');
        AuthManager.targetTab = tabId;
        document.getElementById('authTitle').textContent = '🔐 Доступ к разделу';
        document.getElementById('authSub').textContent = 'Введите пароль для продолжения';
        document.getElementById('authPassword').value = '';
        document.getElementById('authError').classList.remove('show');
        document.getElementById('authOverlay').classList.add('active');
        
        setTimeout(() => document.getElementById('authPassword').focus(), 300);
        document.getElementById('authPassword').onkeydown = function(e) {
            if (e.key === 'Enter') AuthManager.login();
        };
    },
    
    isTabAvailable: (tabId) => {
        const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (!btn) return false;
        const roles = btn.dataset.role.split(',');
        return roles.includes('all') || (AuthManager.currentRole && roles.includes(AuthManager.currentRole));
    },
    
    updateUI: () => {
        console.log('🔐 AuthManager.updateUI()');
        if (AuthManager.currentUser) {
            document.getElementById('userBadge').textContent = '👤 ' + AuthManager.currentUser.label;
            document.getElementById('logoutBtn').style.display = '';
            document.getElementById('homeBtn').style.display = '';
            document.getElementById('bottomActions').style.display = '';
        } else {
            document.getElementById('userBadge').textContent = '👤 Гость';
            document.getElementById('logoutBtn').style.display = 'none';
            document.getElementById('homeBtn').style.display = 'none';
            document.getElementById('bottomActions').style.display = 'none';
        }
    },
    
    changePassword: (role) => {
        const newPass = prompt('Введите новый пароль для ' + DataManager.roles[role].label + ':');
        if (newPass && newPass.trim().length >= 4) {
            DataManager.roles[role].passwordHash = DataManager.hashPassword(newPass.trim());
            DataManager.save();
            Utils.showToast('✅ Пароль изменён для ' + DataManager.roles[role].label);
        } else if (newPass !== null) {
            Utils.showToast('❌ Пароль должен быть не менее 4 символов', 'error');
        }
    }
};

// ================================================================
// ⚠️ ВАЖНО! ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
// ================================================================
window.AuthManager = AuthManager;
window.auth = AuthManager;  // ← ЭТА СТРОКА БЫЛА ПРОПУЩЕНА!

console.log('✅ AuthManager загружен');
console.log('✅ window.auth доступен');
