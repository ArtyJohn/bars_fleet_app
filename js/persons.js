// js/persons.js - Управление личным составом
const PersonsManager = {
    render: () => {
        const tbody = document.getElementById('personsTable');
        tbody.innerHTML = '';
        
        if (DataManager.persons.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#8b949e;padding:12px;">Нет данных</td></tr>`;
            return;
        }
        
        DataManager.persons.forEach((p, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${p.fio}</strong></td>
                <td>${p.position}</td>
                <td>${p.department}</td>
                <td>${p.rank}</td>
                <td>${p.phone || '—'}</td>
                <td>
                    <button onclick="window.persons.edit(${p.id})" style="background:none;border:none;color:#4a6a3a;cursor:pointer;">✏️</button>
                    <button onclick="window.persons.delete(${p.id})" style="background:none;border:none;color:#f85149;cursor:pointer;">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    
    showAddModal: () => {
        const exploitants = DataManager.refs.exploitants || [];
        const html = `
            <div class="modal-title">👤 Добавить военнослужащего</div>
            <div class="form-group">
                <label>ФИО <span class="required">*</span></label>
                <input id="pFio" placeholder="Фамилия Имя Отчество" list="exploitantsList">
                <datalist id="exploitantsList">${exploitants.map(e => `<option value="${e}">`).join('')}</datalist>
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Должность</label>
                <select id="pPosition">${(DataManager.refs.positions || []).map(p => `<option value="${p}">${p}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Подразделение</label>
                <select id="pDept">${(DataManager.refs.departments || []).map(d => `<option value="${d}">${d}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Звание</label>
                <select id="pRank">${(DataManager.refs.ranks || []).map(r => `<option value="${r}">${r}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input id="pPhone" placeholder="+7 (926) 723-79-59" oninput="Utils.formatPhone(this)">
                <span style="font-size:10px;color:#4a6a3a;">Формат: +7 (XXX) XXX-XX-XX</span>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.persons.save()">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    save: () => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const fio = document.getElementById('pFio').value.trim();
        const position = document.getElementById('pPosition').value;
        const department = document.getElementById('pDept').value;
        const rank = document.getElementById('pRank').value;
        const phone = document.getElementById('pPhone').value.trim();
        
        const error = Utils.validateRequired(fio, 'ФИО');
        if (error) {
            Utils.showValidationError(document.getElementById('pFio'), error);
            return;
        }
        
        DataManager.persons.push({
            id: DataManager.getNextId(DataManager.persons),
            fio,
            position,
            department,
            rank,
            phone
        });
        
        DataManager.save();
        Utils.closeModal();
        window.app.updateDashboard();
        Utils.showToast('✅ Военнослужащий добавлен');
        window.sync.sync();
        window.notifications.add('info', `👤 Добавлен военнослужащий ${fio}`);
    },
    
    edit: (id) => {
        const person = DataManager.getPersonById(id);
        if (!person) return;
        
        const exploitants = DataManager.refs.exploitants || [];
        const html = `
            <div class="modal-title">✏️ Редактировать военнослужащего</div>
            <div class="form-group">
                <label>ФИО <span class="required">*</span></label>
                <input id="pFio" value="${person.fio}" list="exploitantsList">
                <datalist id="exploitantsList">${exploitants.map(e => `<option value="${e}">`).join('')}</datalist>
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Должность</label>
                <select id="pPosition">${(DataManager.refs.positions || []).map(p => `<option value="${p}" ${p===person.position?'selected':''}>${p}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Подразделение</label>
                <select id="pDept">${(DataManager.refs.departments || []).map(d => `<option value="${d}" ${d===person.department?'selected':''}>${d}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Звание</label>
                <select id="pRank">${(DataManager.refs.ranks || []).map(r => `<option value="${r}" ${r===person.rank?'selected':''}>${r}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input id="pPhone" value="${person.phone || ''}" oninput="Utils.formatPhone(this)">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.persons.saveEdit(${person.id})">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    saveEdit: (id) => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const fio = document.getElementById('pFio').value.trim();
        const position = document.getElementById('pPosition').value;
        const department = document.getElementById('pDept').value;
        const rank = document.getElementById('pRank').value;
        const phone = document.getElementById('pPhone').value.trim();
        
        const error = Utils.validateRequired(fio, 'ФИО');
        if (error) {
            Utils.showValidationError(document.getElementById('pFio'), error);
            return;
        }
        
        const person = DataManager.getPersonById(id);
        if (person) {
            person.fio = fio;
            person.position = position;
            person.department = department;
            person.rank = rank;
            person.phone = phone;
            DataManager.save();
            Utils.closeModal();
            window.app.updateDashboard();
            Utils.showToast('✅ Данные обновлены');
            window.sync.sync();
        }
    },
    
    delete: (id) => {
        if (confirm('Удалить этого военнослужащего?')) {
            DataManager.persons = DataManager.persons.filter(p => p.id !== id);
            DataManager.save();
            window.app.updateDashboard();
            Utils.showToast('🗑️ Запись удалена');
            window.sync.sync();
        }
    }
};

window.persons = PersonsManager;