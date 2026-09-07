// js/repairs.js - Управление заявками на ремонт
const RepairsManager = {
    render: () => {
        const tbody = document.getElementById('repairRequestsTable');
        tbody.innerHTML = '';
        
        if (DataManager.repairs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b949e;padding:12px;">Нет заявок</td></tr>`;
            return;
        }
        
        const sorted = [...DataManager.repairs].sort((a, b) => b.id - a.id);
        
        sorted.forEach((r, idx) => {
            const weapon = DataManager.getWeaponById(r.weaponId);
            const weaponName = weapon ? weapon.type + ' ' + weapon.number : '—';
            
            let statusClass = 'badge-orange';
            let statusText = '🟠 Открыта';
            if (r.status === 'Закрыта') {
                statusClass = 'badge-green';
                statusText = '🟢 Закрыта';
            } else if (r.status === 'Просрочена') {
                statusClass = 'badge-red';
                statusText = '🔴 Просрочена';
            }
            
            // Проверка просрочки
            if (r.status === 'Открыта' && r.deadline) {
                const deadline = new Date(r.deadline);
                if (deadline < new Date()) {
                    statusClass = 'badge-red';
                    statusText = '🔴 Просрочена';
                    r.status = 'Просрочена';
                    DataManager.save();
                }
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${r.date}</td>
                <td>${weaponName}</td>
                <td>${r.description}</td>
                <td>${r.responsible || '—'}</td>
                <td>${r.deadline || '—'}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${r.status === 'Открыта' ? `<button onclick="window.repairs.close(${r.id})" style="background:#2d3a2d;border:1px solid #4a6a3a;color:#e6edf3;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;">Закрыть</button>` : ''}
                    <button onclick="window.repairs.delete(${r.id})" style="background:none;border:none;color:#f85149;cursor:pointer;font-size:12px;">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    
    showAddModal: () => {
        const exploitants = DataManager.refs.exploitants || [];
        const html = `
            <div class="modal-title">📋 Новая заявка на ремонт</div>
            <div class="form-group">
                <label>Вооружение <span class="required">*</span></label>
                <select id="rrWeapon">
                    ${DataManager.weapons.map(w => `<option value="${w.id}">${w.type} — ${w.number}</option>`).join('')}
                </select>
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Описание неисправности <span class="required">*</span></label>
                <textarea id="rrDescription" placeholder="Подробное описание неисправности"></textarea>
                <div class="validation-error"></div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Дата и время <span class="required">*</span></label>
                    <input id="rrDate" type="datetime-local" value="${new Date().toISOString().slice(0,16)}">
                    <div class="validation-error"></div>
                </div>
                <div class="form-group">
                    <label>Срок выполнения</label>
                    <input id="rrDeadline" type="datetime-local">
                </div>
            </div>
            <div class="form-group">
                <label>Ответственный (ФИО + организация)</label>
                <input id="rrResponsible" placeholder="Например: Иванов И.И. (ООО РемСервис)" list="respList">
                <datalist id="respList">${exploitants.map(e => `<option value="${e}">`).join('')}</datalist>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.repairs.save()">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    showAddModalForWeapon: (weaponId) => {
        const w = DataManager.getWeaponById(weaponId);
        const exploitants = DataManager.refs.exploitants || [];
        const html = `
            <div class="modal-title">📋 Новая заявка для ${w ? w.type + ' ' + w.number : ''}</div>
            <div class="form-group">
                <label>Описание неисправности <span class="required">*</span></label>
                <textarea id="rrDescription" placeholder="Подробное описание неисправности"></textarea>
                <div class="validation-error"></div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Дата и время <span class="required">*</span></label>
                    <input id="rrDate" type="datetime-local" value="${new Date().toISOString().slice(0,16)}">
                    <div class="validation-error"></div>
                </div>
                <div class="form-group">
                    <label>Срок выполнения</label>
                    <input id="rrDeadline" type="datetime-local">
                </div>
            </div>
            <div class="form-group">
                <label>Ответственный (ФИО + организация)</label>
                <input id="rrResponsible" placeholder="Например: Иванов И.И. (ООО РемСервис)" list="respList">
                <datalist id="respList">${exploitants.map(e => `<option value="${e}">`).join('')}</datalist>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.repairs.saveForWeapon(${weaponId})">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    save: () => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const weaponId = parseInt(document.getElementById('rrWeapon').value);
        const description = document.getElementById('rrDescription').value.trim();
        const date = document.getElementById('rrDate').value;
        const deadline = document.getElementById('rrDeadline').value;
        const responsible = document.getElementById('rrResponsible').value.trim();
        
        let isValid = true;
        
        if (!weaponId) {
            Utils.showValidationError(document.getElementById('rrWeapon'), 'Выберите вооружение');
            isValid = false;
        }
        
        const descError = Utils.validateRequired(description, 'Описание');
        if (descError) {
            Utils.showValidationError(document.getElementById('rrDescription'), descError);
            isValid = false;
        }
        
        const dateError = Utils.validateRequired(date, 'Дата');
        if (dateError) {
            Utils.showValidationError(document.getElementById('rrDate'), dateError);
            isValid = false;
        }
        
        if (!isValid) return;
        
        const displayDate = new Date(date).toLocaleString('ru-RU');
        
        const newRequest = {
            id: Utils.generateId(),
            weaponId: weaponId,
            date: displayDate,
            description: description,
            responsible: responsible || '',
            deadline: deadline ? new Date(deadline).toLocaleString('ru-RU') : '',
            status: 'Открыта'
        };
        
        DataManager.repairs.push(newRequest);
        DataManager.save();
        
        const w = DataManager.getWeaponById(weaponId);
        if (w) {
            w.status = 'В ремонте';
            w.fault = description;
            w.lastRequest = 'Заявка №' + newRequest.id.toString().slice(-6);
            DataManager.save();
        }
        
        Utils.closeModal();
        window.app.updateDashboard();
        window.weapons.render();
        RepairsManager.render();
        Utils.showToast('✅ Заявка добавлена');
        window.sync.sync();
        window.notifications.add('info', `📋 Новая заявка на ремонт для ${w ? w.type + ' ' + w.number : ''}`);
    },
    
    saveForWeapon: (weaponId) => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const description = document.getElementById('rrDescription').value.trim();
        const date = document.getElementById('rrDate').value;
        const deadline = document.getElementById('rrDeadline').value;
        const responsible = document.getElementById('rrResponsible').value.trim();
        
        let isValid = true;
        
        const descError = Utils.validateRequired(description, 'Описание');
        if (descError) {
            Utils.showValidationError(document.getElementById('rrDescription'), descError);
            isValid = false;
        }
        
        const dateError = Utils.validateRequired(date, 'Дата');
        if (dateError) {
            Utils.showValidationError(document.getElementById('rrDate'), dateError);
            isValid = false;
        }
        
        if (!isValid) return;
        
        const displayDate = new Date(date).toLocaleString('ru-RU');
        
        const newRequest = {
            id: Utils.generateId(),
            weaponId: weaponId,
            date: displayDate,
            description: description,
            responsible: responsible || '',
            deadline: deadline ? new Date(deadline).toLocaleString('ru-RU') : '',
            status: 'Открыта'
        };
        
        DataManager.repairs.push(newRequest);
        DataManager.save();
        
        const w = DataManager.getWeaponById(weaponId);
        if (w) {
            w.status = 'В ремонте';
            w.fault = description;
            w.lastRequest = 'Заявка №' + newRequest.id.toString().slice(-6);
            DataManager.save();
        }
        
        Utils.closeModal();
        window.app.updateDashboard();
        window.weapons.render();
        RepairsManager.render();
        Utils.showToast('✅ Заявка добавлена');
        window.sync.sync();
        window.notifications.add('info', `📋 Новая заявка на ремонт для ${w ? w.type + ' ' + w.number : ''}`);
    },
    
    close: (requestId) => {
        if (confirm('Закрыть эту заявку?')) {
            const req = DataManager.getRepairById(requestId);
            if (req) {
                req.status = 'Закрыта';
                DataManager.save();
                
                const openReqs = DataManager.repairs.filter(r => r.weaponId === req.weaponId && r.status === 'Открыта');
                if (openReqs.length === 0) {
                    const w = DataManager.getWeaponById(req.weaponId);
                    if (w && w.status === 'В ремонте') {
                        w.status = 'Исправно';
                        w.fault = '';
                        DataManager.save();
                    }
                }
                window.app.updateDashboard();
                window.weapons.render();
                RepairsManager.render();
                Utils.showToast('✅ Заявка закрыта');
                window.sync.sync();
            }
        }
    },
    
    delete: (requestId) => {
        if (confirm('Удалить эту заявку?')) {
            const req = DataManager.getRepairById(requestId);
            if (req) {
                const weaponId = req.weaponId;
                DataManager.repairs = DataManager.repairs.filter(r => r.id !== requestId);
                DataManager.save();
                
                const openReqs = DataManager.repairs.filter(r => r.weaponId === weaponId && r.status === 'Открыта');
                if (openReqs.length === 0) {
                    const w = DataManager.getWeaponById(weaponId);
                    if (w && w.status === 'В ремонте') {
                        w.status = 'Исправно';
                        w.fault = '';
                        DataManager.save();
                    }
                }
                window.app.updateDashboard();
                window.weapons.render();
                RepairsManager.render();
                Utils.showToast('🗑️ Заявка удалена');
                window.sync.sync();
            }
        }
    }
};

window.repairs = RepairsManager;