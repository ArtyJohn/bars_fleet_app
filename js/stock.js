// js/stock.js - Управление складом
const StockManager = {
    render: () => {
        const search = document.getElementById('stockSearch').value.toLowerCase();
        const typeFilter = document.getElementById('stockTypeFilter').value;
        const storageFilter = document.getElementById('stockStorageFilter').value;
        
        let filtered = DataManager.items;
        if (search) {
            filtered = filtered.filter(i => 
                i.name.toLowerCase().includes(search) || 
                (i.article || '').toLowerCase().includes(search)
            );
        }
        if (typeFilter !== 'all') {
            filtered = filtered.filter(i => (i.type || 'Прочее') === typeFilter);
        }
        if (storageFilter !== 'all') {
            filtered = filtered.filter(i => (i.storage || 'Без склада') === storageFilter);
        }
        
        const tbody = document.getElementById('stockTable');
        tbody.innerHTML = '';
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#8b949e;padding:12px;">Нет ТМЦ</td></tr>`;
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
                    <button onclick="window.stock.edit(${item.id})" style="background:none;border:none;color:#4a6a3a;cursor:pointer;">✏️</button>
                    <button onclick="window.stock.delete(${item.id})" style="background:none;border:none;color:#f85149;cursor:pointer;">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    
    updateFilters: () => {
        const typeSelect = document.getElementById('stockTypeFilter');
        const storageSelect = document.getElementById('stockStorageFilter');
        const types = ['all', ...new Set(DataManager.items.map(i => i.type || 'Прочее'))];
        const storages = ['all', ...new Set(DataManager.items.map(i => i.storage || 'Без склада'))];
        
        typeSelect.innerHTML = types.map(t => `<option value="${t}">${t === 'all' ? 'Все типы' : t}</option>`).join('');
        storageSelect.innerHTML = storages.map(s => `<option value="${s}">${s === 'all' ? 'Все склады' : s}</option>`).join('');
    },
    
    showAddModal: () => {
        const stockTypes = DataManager.refs.stockTypes || [];
        const html = `
            <div class="modal-title">📦 Добавить ТМЦ</div>
            <div class="form-group">
                <label>Наименование <span class="required">*</span></label>
                <input id="iName" placeholder="Наименование ТМЦ">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Артикул</label>
                <input id="iArticle" placeholder="Артикул">
            </div>
            <div class="form-group">
                <label>Тип</label>
                <select id="iType">${stockTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Единица измерения</label>
                <select id="iUnit">${(DataManager.refs.units || []).map(u => `<option value="${u}">${u}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Количество</label>
                <input id="iQuantity" type="number" value="0">
            </div>
            <div class="form-group">
                <label>Склад</label>
                <input id="iStorage" placeholder="Номер склада">
            </div>
            <div class="form-group">
                <label>Примечание</label>
                <input id="iNote" placeholder="Дополнительная информация">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.stock.save()">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    save: () => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const name = document.getElementById('iName').value.trim();
        const article = document.getElementById('iArticle').value.trim();
        const type = document.getElementById('iType').value;
        const unit = document.getElementById('iUnit').value;
        const quantity = parseInt(document.getElementById('iQuantity').value) || 0;
        const storage = document.getElementById('iStorage').value.trim();
        const note = document.getElementById('iNote').value.trim();
        
        const error = Utils.validateRequired(name, 'Наименование');
        if (error) {
            Utils.showValidationError(document.getElementById('iName'), error);
            return;
        }
        
        DataManager.items.push({
            id: DataManager.getNextId(DataManager.items),
            name,
            article,
            type,
            unit,
            quantity,
            storage,
            note
        });
        
        DataManager.save();
        Utils.closeModal();
        window.app.updateDashboard();
        StockManager.updateFilters();
        Utils.showToast('✅ ТМЦ добавлено');
        window.sync.sync();
        window.notifications.add('info', `📦 Добавлен ТМЦ: ${name} (${quantity} ${unit})`);
    },
    
    edit: (id) => {
        const item = DataManager.getItemById(id);
        if (!item) return;
        
        const stockTypes = DataManager.refs.stockTypes || [];
        const html = `
            <div class="modal-title">✏️ Редактировать ТМЦ</div>
            <div class="form-group">
                <label>Наименование <span class="required">*</span></label>
                <input id="iName" value="${item.name}">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Артикул</label>
                <input id="iArticle" value="${item.article || ''}">
            </div>
            <div class="form-group">
                <label>Тип</label>
                <select id="iType">${stockTypes.map(t => `<option value="${t}" ${t===item.type?'selected':''}>${t}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Единица измерения</label>
                <select id="iUnit">${(DataManager.refs.units || []).map(u => `<option value="${u}" ${u===item.unit?'selected':''}>${u}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Количество</label>
                <input id="iQuantity" type="number" value="${item.quantity}">
            </div>
            <div class="form-group">
                <label>Склад</label>
                <input id="iStorage" value="${item.storage}">
            </div>
            <div class="form-group">
                <label>Примечание</label>
                <input id="iNote" value="${item.note || ''}">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.stock.saveEdit(${item.id})">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    saveEdit: (id) => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const name = document.getElementById('iName').value.trim();
        const article = document.getElementById('iArticle').value.trim();
        const type = document.getElementById('iType').value;
        const unit = document.getElementById('iUnit').value;
        const quantity = parseInt(document.getElementById('iQuantity').value) || 0;
        const storage = document.getElementById('iStorage').value.trim();
        const note = document.getElementById('iNote').value.trim();
        
        const error = Utils.validateRequired(name, 'Наименование');
        if (error) {
            Utils.showValidationError(document.getElementById('iName'), error);
            return;
        }
        
        const item = DataManager.getItemById(id);
        if (item) {
            item.name = name;
            item.article = article;
            item.type = type;
            item.unit = unit;
            item.quantity = quantity;
            item.storage = storage;
            item.note = note;
            DataManager.save();
            Utils.closeModal();
            window.app.updateDashboard();
            StockManager.updateFilters();
            Utils.showToast('✅ Данные обновлены');
            window.sync.sync();
        }
    },
    
    delete: (id) => {
        if (confirm('Удалить эту позицию?')) {
            DataManager.items = DataManager.items.filter(i => i.id !== id);
            DataManager.save();
            window.app.updateDashboard();
            StockManager.updateFilters();
            Utils.showToast('🗑️ Запись удалена');
            window.sync.sync();
        }
    }
};

window.stock = StockManager;