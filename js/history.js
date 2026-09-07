// js/history.js - Журнал ТО
const HistoryManager = {
    render: () => {
        const div = document.getElementById('historyList');
        
        if (DataManager.history.length === 0) {
            div.innerHTML = `<div style="color:#8b949e;padding:10px;text-align:center;">Нет записей</div>`;
            return;
        }
        
        const sorted = [...DataManager.history].sort((a, b) => b.id - a.id);
        div.innerHTML = sorted.slice(0, 30).map(h => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1c2128;font-size:11px;">
                <div>
                    <span><strong>${h.reg}</strong> — ${h.model}</span>
                    <span style="color:#8b949e;font-size:10px;margin-left:8px;">${h.date} • ${h.mileage} км</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="color:#4a6a3a;">${h.toType}</span>
                    <button onclick="window.history.delete(${h.id})" style="background:none;border:none;color:#f85149;font-size:12px;cursor:pointer;">✕</button>
                </div>
            </div>
        `).join('');
    },
    
    showAddModal: () => {
        const html = `
            <div class="modal-title">📜 Добавить запись о ТО</div>
            <div class="form-group">
                <label>Автомобиль <span class="required">*</span></label>
                <select id="hCar">${DataManager.cars.map(c => `<option value="${c.id}">${c.reg} — ${c.model}</option>`).join('')}</select>
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Дата ТО <span class="required">*</span></label>
                <input id="hDate" type="date" value="${new Date().toISOString().slice(0,10)}">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Пробег (км) <span class="required">*</span></label>
                <input id="hMileage" type="number" placeholder="Пробег при ТО">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Тип ТО <span class="required">*</span></label>
                <select id="hType">${(DataManager.refs.toTypes || []).map(t => `<option value="${t}">${t}</option>`).join('')}</select>
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Примечание</label>
                <textarea id="hNote" placeholder="Дополнительная информация"></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.history.save()">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    save: () => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        const carId = parseInt(document.getElementById('hCar').value);
        const date = document.getElementById('hDate').value;
        const mileage = parseInt(document.getElementById('hMileage').value) || 0;
        const toType = document.getElementById('hType').value;
        const note = document.getElementById('hNote').value.trim();
        
        let isValid = true;
        
        if (!carId) {
            Utils.showValidationError(document.getElementById('hCar'), 'Выберите автомобиль');
            isValid = false;
        }
        
        const dateError = Utils.validateRequired(date, 'Дата');
        if (dateError) {
            Utils.showValidationError(document.getElementById('hDate'), dateError);
            isValid = false;
        }
        
        const mileageError = Utils.validateNumber(mileage, 'Пробег');
        if (mileageError) {
            Utils.showValidationError(document.getElementById('hMileage'), mileageError);
            isValid = false;
        }
        
        const toTypeError = Utils.validateRequired(toType, 'Тип ТО');
        if (toTypeError) {
            Utils.showValidationError(document.getElementById('hType'), toTypeError);
            isValid = false;
        }
        
        if (!isValid) return;
        
        const car = DataManager.getCarById(carId);
        if (!car) {
            Utils.showToast('Автомобиль не найден!', 'error');
            return;
        }
        
        DataManager.history.push({
            id: DataManager.getNextId(DataManager.history),
            date: date.split('-').reverse().join('.'),
            reg: car.reg,
            model: car.model,
            mileage,
            toType,
            note
        });
        
        if (mileage > car.last_to) {
            car.last_to = mileage;
            car.plan_to = mileage + 10000;
            car.remainder = car.plan_to - car.mileage;
            
            // Обновляем статус
            if (car.remainder < 0) {
                car.status = '🔴';
                car.criticality = '🔴 КРИТИЧНО';
                car.notification = '⚠️ ПРОСРОЧЕНО!';
            } else if (car.remainder <= 500) {
                car.status = '🟠';
                car.criticality = '🟠 ВЫСОКИЙ';
                car.notification = '⏰ Осталось ≤ 500 км';
            } else if (car.remainder <= 1000) {
                car.status = '🟡';
                car.criticality = '🟡 СРЕДНИЙ';
                car.notification = '📅 Осталось ≤ 1000 км';
            } else {
                car.status = '🟢';
                car.criticality = '🟢 НИЗКИЙ';
                car.notification = '✅ Всё в порядке';
            }
        }
        
        DataManager.save();
        Utils.closeModal();
        window.app.updateDashboard();
        Utils.showToast('✅ Запись о ТО добавлена');
        window.sync.sync();
        window.notifications.add('info', `📋 Добавлена запись ТО для ${car.reg} (${mileage} км)`);
    },
    
    delete: (id) => {
        if (confirm('Удалить эту запись?')) {
            DataManager.history = DataManager.history.filter(h => h.id !== id);
            DataManager.save();
            window.app.updateDashboard();
            Utils.showToast('Запись удалена');
            window.sync.sync();
        }
    }
};

window.history = HistoryManager;