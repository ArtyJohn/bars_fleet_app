// js/sync.js - Синхронизация
const SyncManager = {
    isSyncing: false,
    lastSyncTime: null,
    offlineQueue: [],
    
    sync: () => {
        if (SyncManager.isSyncing) return;
        const btn = document.getElementById('syncBtn');
        SyncManager.isSyncing = true;
        if (btn) btn.classList.add('active');
        Utils.showToast('☁️ Синхронизация...', 'sync');
        
        // Имитация синхронизации
        setTimeout(() => {
            DataManager.save();
            window.notifications.checkCritical();
            SyncManager.isSyncing = false;
            if (btn) btn.classList.remove('active');
            SyncManager.lastSyncTime = new Date();
            const statusEl = document.getElementById('syncStatus');
            statusEl.textContent = '☁️ синхр. ' + SyncManager.lastSyncTime.toLocaleTimeString();
            statusEl.className = 'sync-status online';
            Utils.showToast('✅ Синхронизация завершена', 'sync');
        }, 1500);
    },
    
    // Обработка офлайн-запросов
    addToQueue: (action, data) => {
        SyncManager.offlineQueue.push({ action, data, timestamp: Date.now() });
        localStorage.setItem('bars_offline_queue', JSON.stringify(SyncManager.offlineQueue));
    },
    
    processQueue: () => {
        if (!navigator.onLine) return;
        const queue = JSON.parse(localStorage.getItem('bars_offline_queue') || '[]');
        if (queue.length === 0) return;
        
        // Обработка очереди
        queue.forEach(item => {
            console.log('Processing offline item:', item);
            // Здесь должна быть реальная отправка на сервер
        });
        
        localStorage.removeItem('bars_offline_queue');
        SyncManager.offlineQueue = [];
    }
};

// Обработка онлайн/офлайн событий
window.addEventListener('online', () => {
    Utils.showToast('🌐 Интернет восстановлен', 'sync');
    if (AuthManager.currentRole) {
        SyncManager.sync();
        SyncManager.processQueue();
    }
});

window.addEventListener('offline', () => {
    Utils.showToast('📡 Нет интернета. Данные сохраняются локально.', 'error');
    document.getElementById('syncStatus').textContent = '📡 офлайн';
    document.getElementById('syncStatus').className = 'sync-status offline';
});

window.sync = SyncManager;