// js/refs.js - Справочники
const RefsManager = {
    toggle: () => {
        const panel = document.getElementById('refsPanel');
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) RefsManager.render();
    },
    
    render: () => {
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
            const items = DataManager.refs[g.key] || [];
            const showItems = items.slice(0, 5);
            const hiddenCount = items.length - 5;
            const isAdmin = AuthManager.currentRole === 'admin';
            
            return `
                <div class="ref-group">
                    <div class="ref-label">
                        <span>${g.label}</span>
                        ${isAdmin ? `<button class="btn-small" onclick="window.refs.add('${g.key}')" style="font-size:9px;padding:1px 6px;">➕</button>` : ''}
                    </div>
                    <div class="ref-list">
                        ${showItems.map(item => `
                            <div class="ref-item">
                                <span>${item}</span>
                                ${isAdmin ? `<span class="del" onclick="window.refs.delete('${g.key}','${item}')">✕</span>` : ''}
                            </div>
                        `).join('')}
                        ${hiddenCount > 0 ? `<div style="color:#4a6a3a;font-size:10px;padding:2px 0;">+ еще ${hiddenCount}</div>` : ''}
                        ${items.length === 0 ? '<div style="color:#8b949e;font-size:10px;padding:2px 0;">Пусто</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    add: (key) => {
        const value = prompt('Введите новое значение:');
        if (value && value.trim()) {
            if (!DataManager.refs[key]) DataManager.refs[key] = [];
            DataManager.refs[key].push(value.trim());
            DataManager.save();
            RefsManager.render();
            Utils.showToast('✅ Добавлено: ' + value.trim());
            window.sync.sync();
        }
    },
    
    delete: (key, value) => {
        if (confirm('Удалить "' + value + '"?')) {
            DataManager.refs[key] = DataManager.refs[key].filter(v => v !== value);
            DataManager.save();
            RefsManager.render();
            Utils.showToast('🗑️ Удалено');
            window.sync.sync();
        }
    }
};

window.refs = RefsManager;