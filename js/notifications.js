// js/notifications.js - Уведомления
const NotificationManager = {
    toggle: () => {
        const panel = document.getElementById('notifPanel');
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            DataManager.notifications.forEach(n => n.read = true);
            DataManager.save();
            NotificationManager.updateBadge();
            NotificationManager.render();
        }
    },
    
    add: (type, message, data = {}) => {
        const notif = {
            id: Utils.generateId(),
            type: type,
            message: message,
            data: data,
            time: new Date().toLocaleString(),
            read: false
        };
        DataManager.notifications.unshift(notif);
        if (DataManager.notifications.length > 100) {
            DataManager.notifications = DataManager.notifications.slice(0, 100);
        }
        DataManager.save();
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Барс-Москва', {
                body: message,
                icon: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2694.png'
            });
        }
        
        NotificationManager.render();
        NotificationManager.updateBadge();
    },
    
    render: () => {
        const div = document.getElementById('notifList');
        if (DataManager.notifications.length === 0) {
            div.innerHTML = '<div style="color:#8b949e;padding:8px;text-align:center;font-size:12px;">Нет уведомлений</div>';
            return;
        }
        div.innerHTML = DataManager.notifications.slice(0, 30).map(n => `
            <div class="notif-item">
                <span class="${n.type}">${n.message}</span>
                <span class="time">${n.time}</span>
                <button class="dismiss" onclick="window.notifications.dismiss(${n.id})">✕</button>
            </div>
        `).join('');
    },
    
    dismiss: (id) => {
        DataManager.notifications = DataManager.notifications.filter(n => n.id !== id);
        DataManager.save();
        NotificationManager.render();
        NotificationManager.updateBadge();
    },
    
    clear: () => {
        DataManager.notifications = [];
        DataManager.save();
        NotificationManager.render();
        NotificationManager.updateBadge();
        document.getElementById('notifPanel').classList.remove('active');
        Utils.showToast('Уведомления очищены');
    },
    
    updateBadge: () => {
        const unread = DataManager.notifications.filter(n => !n.read).length;
        const btn = document.getElementById('notifBtn');
        const existing = btn.querySelector('.badge-notif');
        if (existing) existing.remove();
        if (unread > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge-notif';
            badge.textContent = unread > 9 ? '9+' : unread;
            btn.appendChild(badge);
        }
    },
    
    checkCritical: () => {
        // Проверка просроченных ТО
        DataManager.cars.forEach(c => {
            if (c.remainder < 0) {
                const exists = DataManager.notifications.some(n => 
                    n.message.includes(c.reg) && n.message.includes('ПРОСРОЧЕНО')
                );
                if (!exists) {
                    NotificationManager.add(
                        'critical',
                        `🚨 ${c.reg}: ПРОСРОЧЕНО ТО на ${Math.abs(c.remainder)} км!`,
                        { car: c }
                    );
                }
            }
        });
        
        // Проверка приближающегося ТО
        DataManager.cars.forEach(c => {
            if (c.remainder >= 0 && c.remainder <= 500) {
                const exists = DataManager.notifications.some(n => 
                    n.message.includes(c.reg) && n.message.includes('Скоро ТО')
                );
                if (!exists) {
                    NotificationManager.add(
                        'warning',
                        `⚠️ ${c.reg}: Скоро ТО! Осталось ${c.remainder} км`,
                        { car: c }
                    );
                }
            }
        });
        
        // Проверка вооружения в ремонте
        DataManager.weapons.forEach(w => {
            if (w.status === 'В ремонте' || w.status === 'Неисправно') {
                const exists = DataManager.notifications.some(n => 
                    n.message.includes(w.number) && (n.message.includes('ремонте') || n.message.includes('Неисправен'))
                );
                if (!exists) {
                    NotificationManager.add(
                        'warning',
                        `🔴 ${w.type} ${w.number}: ${w.status} (${w.fault || 'без описания'})`,
                        { weapon: w }
                    );
                }
            }
        });
        
        // Проверка остатков на складе
        DataManager.items.forEach(i => {
            if (i.quantity < 5) {
                const exists = DataManager.notifications.some(n => 
                    n.message.includes(i.name) && n.message.includes('заканчивается')
                );
                if (!exists) {
                    NotificationManager.add(
                        'warning',
                        `📦 ${i.name}: заканчивается (осталось ${i.quantity} ${i.unit})`,
                        { item: i }
                    );
                }
            }
        });
    }
};

window.notifications = NotificationManager;