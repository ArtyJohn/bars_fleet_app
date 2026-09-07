// js/historyLog.js - История изменений
const HistoryLogManager = {
    logs: [],
    maxLogs: 500,
    
    init: () => {
        const saved = localStorage.getItem('bars_history_log');
        if (saved) {
            try {
                HistoryLogManager.logs = JSON.parse(saved);
                if (!Array.isArray(HistoryLogManager.logs)) {
                    HistoryLogManager.logs = [];
                }
            } catch (e) {
                HistoryLogManager.logs = [];
            }
        } else {
            HistoryLogManager.logs = [];
        }
        HistoryLogManager.save();
        console.log('📜 История загружена, записей:', HistoryLogManager.logs.length);
    },
    
    save: () => {
        localStorage.setItem('bars_history_log', JSON.stringify(HistoryLogManager.logs));
    },
    
    add: (type, description, data = {}) => {
        const user = AuthManager.currentUser ? AuthManager.currentUser.label : 'Гость';
        const role = AuthManager.currentRole || 'guest';
        
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('ru-RU'),
            user: user,
            role: role,
            type: type,
            description: description,
            data: data
        };
        
        HistoryLogManager.logs.unshift(entry);
        
        if (HistoryLogManager.logs.length > HistoryLogManager.maxLogs) {
            HistoryLogManager.logs = HistoryLogManager.logs.slice(0, HistoryLogManager.maxLogs);
        }
        
        HistoryLogManager.save();
        console.log('📜 История:', entry);
        
        // Обновляем счётчик на странице
        const countEl = document.getElementById('historyLogCount');
        if (countEl) {
            countEl.textContent = HistoryLogManager.logs.length;
        }
    },
    
    get: (limit = 100, type = null) => {
        let logs = HistoryLogManager.logs;
        if (type) {
            logs = logs.filter(l => l.type === type);
        }
        return logs.slice(0, limit);
    },
    
    getByDate: (date) => {
        return HistoryLogManager.logs.filter(l => l.date.includes(date));
    },
    
    clear: () => {
        if (confirm('Удалить всю историю изменений?')) {
            HistoryLogManager.logs = [];
            HistoryLogManager.save();
            Utils.showToast('🗑️ История очищена');
            const countEl = document.getElementById('historyLogCount');
            if (countEl) countEl.textContent = '0';
            HistoryLogManager.render('historyLogList');
        }
    },
    
    render: (containerId = 'historyLogList') => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const logs = HistoryLogManager.logs.slice(0, 100);
        
        // Обновляем счётчик
        const countEl = document.getElementById('historyLogCount');
        if (countEl) {
            countEl.textContent = HistoryLogManager.logs.length;
        }
        
        if (logs.length === 0) {
            container.innerHTML = '<div style="color:#8b949e;padding:10px;text-align:center;">История изменений пуста</div>';
            return;
        }
        
        // Группируем по дате
        const grouped = {};
        logs.forEach(log => {
            const date = log.date.split(',')[0];
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(log);
        });
        
        const iconMap = {
            'car': '🚗',
            'person': '👤', 
            'weapon': '🔫',
            'stock': '📦',
            'history': '📋',
            'repair': '🛠',
            'refs': '📚',
            'auth': '🔐'
        };
        
        let html = '';
        Object.keys(grouped).forEach(date => {
            html += `<div style="margin-bottom:10px;">`;
            html += `<div style="font-weight:600;color:#4a6a3a;font-size:11px;border-bottom:1px solid #2d3a2d;padding-bottom:4px;margin-bottom:4px;">📅 ${date}</div>`;
            
            grouped[date].forEach(log => {
                const icon = iconMap[log.type] || '📌';
                const time = log.date.split(',')[1] || '';
                
                html += `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #1c2128;font-size:11px;">
                        <div style="display:flex;align-items:center;gap:6px;flex:1;">
                            <span>${icon}</span>
                            <span style="color:#8b949e;font-size:10px;">${time.trim()}</span>
                            <span style="color:#e6edf3;">${log.description}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#4a6a3a;flex-shrink:0;">
                            <span>${log.user}</span>
                            ${log.role !== 'admin' ? `<span style="color:#8b949e;font-size:8px;">(${log.role})</span>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }
};

// Инициализация
HistoryLogManager.init();

window.historyLog = HistoryLogManager;
console.log('✅ historyLog загружен');
