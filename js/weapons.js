// js/weapons.js - Управление вооружением
const WeaponsManager = {
    render: () => {
        const tbody = document.getElementById('weaponsTable');
        tbody.innerHTML = '';
        
        if (DataManager.weapons.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b949e;padding:12px;">Нет данных</td></tr>`;
            return;
        }
        
        DataManager.weapons.forEach((w, idx) => {
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
                <td><span class="clickable" onclick="window.weapons.showCard(${w.id})">👁</span></td>
            `;
            tr.addEventListener('dblclick', function() { WeaponsManager.showCard(w.id); });
            tbody.appendChild(tr);
        });
    },
    
    showAddModal: () => {
        const html = `
            <div class="modal-title">🔫 Добавить вооружение</div>
            <div class="form-group">
                <label>Тип <span class="required">*</span></label>
                <select id="wType">${(DataManager.refs.weaponTypes || []).map(t => `<option value="${t}">${t}</option>`).join('')}</select>
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Бортовой номер <span class="required">*</span></label>
                <input id="wNumber" placeholder="Например: Б-001">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Условное обозначение</label>
                <input id="wSymbol" placeholder="Например: Б-1">
            </div>
            <div class="form-group">
                <label>Координаты</label>
                <input id="wCoords" placeholder="Например: 55.75, 37.62">
            </div>
            <div class="form-group">
                <label>Статус</label>
                <select id="wStatus">${(DataManager.refs.weaponStatuses || []).map(s => `<option value="${s}">${s}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Неисправность</label>
                <textarea id="wFault" placeholder="Описание неисправности"></textarea>
            </div>
            <div class="form-group">
                <label>Последняя заявка</label>
                <input id="wLastRequest" placeholder="№ заявки">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.weapons.save()">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    save: () => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const type = document.getElementById('wType').value;
        const number = document.getElementById('wNumber').value.trim();
        const symbol = document.getElementById('wSymbol').value.trim();
        const coordinates = document.getElementById('wCoords').value.trim();
        const status = document.getElementById('wStatus').value;
        const fault = document.getElementById('wFault').value.trim();
        const lastRequest = document.getElementById('wLastRequest').value.trim();
        
        let isValid = true;
        
        if (!type) {
            Utils.showValidationError(document.getElementById('wType'), 'Выберите тип вооружения');
            isValid = false;
        }
        
        const numberError = Utils.validateRequired(number, 'Бортовой номер');
        if (numberError) {
            Utils.showValidationError(document.getElementById('wNumber'), numberError);
            isValid = false;
        } else {
            if (DataManager.weapons.some(w => w.number === number)) {
                Utils.showValidationError(document.getElementById('wNumber'), 'Вооружение с таким номером уже существует');
                isValid = false;
            }
        }
        
        if (!isValid) return;
        
        DataManager.weapons.push({
            id: DataManager.getNextId(DataManager.weapons),
            type,
            number,
            symbol,
            coordinates,
            status,
            fault,
            lastRequest
        });
        
        DataManager.save();
        Utils.closeModal();
        window.app.updateDashboard();
        Utils.showToast('✅ Вооружение добавлено');
        window.sync.sync();
        window.notifications.add('info', `🔫 Добавлен ${type} ${number}`);
    },
    
    showCard: (id) => {
        const w = DataManager.getWeaponById(id);
        if (!w) return;
        
        const weaponRepairs = DataManager.repairs.filter(r => r.weaponId === id);
        const openRepairs = weaponRepairs.filter(r => r.status === 'Открыта');
        const closedRepairs = weaponRepairs.filter(r => r.status === 'Закрыта');
        
        let criticality = '🟢 НИЗКИЙ';
        let critColor = 'green';
        if (w.status === 'Неисправно') { criticality = '🔴 КРИТИЧНЫЙ'; critColor = 'red'; }
        else if (w.status === 'В ремонте') { criticality = '🟠 СРЕДНИЙ'; critColor = 'orange'; }
        
        const html = `
            <div class="modal-title">🔫 Карточка вооружения — ${w.number}</div>
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
                    <button class="btn-small" onclick="window.repairs.showAddModalForWeapon(${w.id})" style="font-size:10px;">➕ Добавить заявку</button>
                    <button class="btn-small primary" onclick="window.weapons.edit(${w.id})" style="font-size:10px;">✏️ Редактировать</button>
                    <button class="btn-small danger" onclick="window.weapons.delete(${w.id})" style="font-size:10px;">🗑️ Удалить</button>
                </div>
            </div>
            
            <div style="border-top:1px solid #2d3a2d;padding-top:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong style="color:#4a6a3a;">📋 Заявки на ремонт (${weaponRepairs.length})</strong>
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
                            <span style="font-size:10px;color:#8b949e;">Ответственный: ${r.responsible || '—'} | Срок: ${r.deadline || '—'}</span>
                            <span style="font-size:10px;">${r.status === 'Открыта' ? '🟠 Открыта' : r.status === 'Просрочена' ? '🔴 Просрочена' : '🟢 Закрыта'}</span>
                        </div>
                        <div style="display:flex;gap:4px;">
                            ${r.status === 'Открыта' ? `<button onclick="window.repairs.close(${r.id})" style="background:#2d3a2d;border:1px solid #4a6a3a;color:#e6edf3;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;">Закрыть</button>` : ''}
                            <button onclick="window.repairs.delete(${r.id})" style="background:none;border:none;color:#f85149;cursor:pointer;font-size:12px;">✕</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="window.weapons.printCard(${w.id})">🖨️ Печать</button>
                <button class="btn-primary" onclick="window.weapons.exportCard(${w.id})">📊 Excel</button>
                <button class="btn-secondary" onclick="Utils.closeModal()">Закрыть</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    edit: (id) => {
        const w = DataManager.getWeaponById(id);
        if (!w) return;
        
        const html = `
            <div class="modal-title">✏️ Редактировать вооружение</div>
            <div class="form-group"><label>Тип *</label><select id="wType">${(DataManager.refs.weaponTypes || []).map(t => `<option value="${t}" ${t===w.type?'selected':''}>${t}</option>`).join('')}</select></div>
            <div class="form-group"><label>Бортовой номер *</label><input id="wNumber" value="${w.number}"></div>
            <div class="form-group"><label>Условное обозначение</label><input id="wSymbol" value="${w.symbol || ''}"></div>
            <div class="form-group"><label>Координаты</label><input id="wCoords" value="${w.coordinates || ''}"></div>
            <div class="form-group"><label>Статус</label><select id="wStatus">${(DataManager.refs.weaponStatuses || []).map(s => `<option value="${s}" ${s===w.status?'selected':''}>${s}</option>`).join('')}</select></div>
            <div class="form-group"><label>Неисправность</label><textarea id="wFault">${w.fault || ''}</textarea></div>
            <div class="form-group"><label>Последняя заявка</label><input id="wLastRequest" value="${w.lastRequest || ''}"></div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.weapons.saveEdit(${w.id})">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    saveEdit: (id) => {
        const w = DataManager.getWeaponById(id);
        if (!w) return;
        
        const type = document.getElementById('wType').value;
        const number = document.getElementById('wNumber').value.trim();
        const symbol = document.getElementById('wSymbol').value.trim();
        const coordinates = document.getElementById('wCoords').value.trim();
        const status = document.getElementById('wStatus').value;
        const fault = document.getElementById('wFault').value.trim();
        const lastRequest = document.getElementById('wLastRequest').value.trim();
        
        if (!type || !number) {
            Utils.showToast('Заполните тип и бортовой номер!', 'error');
            return;
        }
        
        w.type = type;
        w.number = number;
        w.symbol = symbol;
        w.coordinates = coordinates;
        w.status = status;
        w.fault = fault;
        w.lastRequest = lastRequest;
        
        DataManager.save();
        Utils.closeModal();
        window.app.updateDashboard();
        Utils.showToast('✅ Данные обновлены');
        window.sync.sync();
    },
    
    delete: (id) => {
        if (confirm('Удалить эту единицу вооружения?')) {
            DataManager.weapons = DataManager.weapons.filter(w => w.id !== id);
            DataManager.repairs = DataManager.repairs.filter(r => r.weaponId !== id);
            DataManager.save();
            Utils.closeModal();
            window.app.updateDashboard();
            Utils.showToast('🗑️ Запись удалена');
            window.sync.sync();
        }
    },
    
    printCard: (id) => {
        const w = DataManager.getWeaponById(id);
        if (!w) return;
        
        const weaponRepairs = DataManager.repairs.filter(r => r.weaponId === id);
        const openReqs = weaponRepairs.filter(r => r.status === 'Открыта');
        const closedReqs = weaponRepairs.filter(r => r.status === 'Закрыта');
        
        let criticality = 'Низкий';
        let critColor = '#27ae60';
        if (w.status === 'Неисправно') { criticality = 'Критичный'; critColor = '#e74c3c'; }
        else if (w.status === 'В ремонте') { criticality = 'Средний'; critColor = '#e67e22'; }
        
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
                .crit-red { color: #e74c3c; }
                .crit-orange { color: #e67e22; }
                .crit-green { color: #27ae60; }
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
                <div class="footer">Учетная система роты ЛК • ${new Date().toLocaleString()}</div>
                <script>window.print(); setTimeout(window.close, 1000);<\/script>
            </body></html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    },
    
    exportCard: (id) => {
        const w = DataManager.getWeaponById(id);
        if (!w) return;
        
        const weaponRepairs = DataManager.repairs.filter(r => r.weaponId === id);
        
        let criticality = 'Низкий';
        if (w.status === 'Неисправно') criticality = 'Критичный';
        else if (w.status === 'В ремонте') criticality = 'Средний';
        
        let csv = 'Поле;Значение\n';
        csv += `Тип;${w.type}\n`;
        csv += `Бортовой номер;${w.number}\n`;
        csv += `Условное обозначение;${w.symbol || '—'}\n`;
        csv += `Координаты;${w.coordinates || '—'}\n`;
        csv += `Статус;${w.status}\n`;
        csv += `Критичность;${criticality}\n`;
        csv += `Неисправность;${w.fault || '—'}\n`;
        csv += `Последняя заявка;${w.lastRequest || '—'}\n`;
        csv += '\n--- ЗАЯВКИ ---\n';
        csv += 'Дата;Описание;Статус\n';
        weaponRepairs.forEach(r => {
            csv += `${r.date};${r.description};${r.status}\n`;
        });
        
        Utils.downloadFile(csv, `weapon_${w.number}_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
        Utils.showToast('📊 Карточка выгружена в Excel');
    }
};

window.weapons = WeaponsManager;