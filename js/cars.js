// js/cars.js - Управление автомобилями
const CarsManager = {
    render: () => {
        const filterReg = document.getElementById('filterReg').value.toLowerCase();
        const filterModel = document.getElementById('filterModel').value.toLowerCase();
        
        let filtered = DataManager.cars;
        if (filterReg) filtered = filtered.filter(c => c.reg.toLowerCase().includes(filterReg));
        if (filterModel) filtered = filtered.filter(c => c.model.toLowerCase().includes(filterModel));
        
        const tbody = document.getElementById('carsTable');
        tbody.innerHTML = '';
        document.getElementById('carsCount').textContent = filtered.length;
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b949e;padding:12px;">Нет автомобилей</td></tr>`;
            return;
        }
        
        filtered.forEach((c, idx) => {
            let badgeClass = 'badge-green';
            if (c.remainder < 0) badgeClass = 'badge-red';
            else if (c.remainder <= 500) badgeClass = 'badge-orange';
            else if (c.remainder <= 1000) badgeClass = 'badge-yellow';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${c.reg}</strong></td>
                <td>${c.model}</td>
                <td>${c.sts || '—'}</td>
                <td>${c.mileage}</td>
                <td>${c.remainder}</td>
                <td><span class="badge ${badgeClass}">${c.status}</span></td>
                <td><span class="clickable" onclick="window.cars.showCard(${c.id})">👁</span></td>
            `;
            tr.addEventListener('dblclick', function() { CarsManager.showCard(c.id); });
            tbody.appendChild(tr);
        });
    },
    
    applyFilters: () => CarsManager.render(),
    
    resetFilters: () => {
        document.getElementById('filterReg').value = '';
        document.getElementById('filterModel').value = '';
        CarsManager.render();
    },
    
    showAddModal: () => {
        const exploitants = DataManager.refs.exploitants || [];
        const html = `
            <div class="modal-title">🚗 Добавить автомобиль</div>
            <div class="form-group">
                <label>Регистрационный номер <span class="required">*</span></label>
                <input id="fReg" placeholder="Например: А001АА77">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Модель <span class="required">*</span></label>
                <input id="fModel" placeholder="Например: Toyota Camry">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>СТС</label>
                <input id="fSts" placeholder="Номер СТС">
            </div>
            <div class="form-group">
                <label>Ответственный <span class="required">*</span></label>
                <input id="fResp" placeholder="ФИО ответственного">
                <div class="validation-error"></div>
            </div>
            <div class="form-group">
                <label>Водитель</label>
                <input id="fDriver" placeholder="ФИО водителя" list="driversList">
                <datalist id="driversList">${exploitants.map(d => `<option value="${d}">`).join('')}</datalist>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Пробег (км)</label>
                    <input id="fMileage" type="number" value="0">
                </div>
                <div class="form-group">
                    <label>Последнее ТО (км)</label>
                    <input id="fLastTO" type="number" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Плановое ТО (км)</label>
                    <input id="fPlanTO" type="number" value="2000">
                </div>
                <div class="form-group">
                    <label>Тип ТС</label>
                    <select id="fType">${(DataManager.refs.carTypes || []).map(t => `<option value="${t}">${t}</option>`).join('')}</select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Подразделение</label>
                    <select id="fDept">${(DataManager.refs.departments || []).map(d => `<option value="${d}">${d}</option>`).join('')}</select>
                </div>
                <div class="form-group">
                    <label>Статус ТС</label>
                    <select id="fStatus">${(DataManager.refs.statuses || []).map(s => `<option value="${s}">${s}</option>`).join('')}</select>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.cars.save()">Сохранить</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    save: () => {
        const container = document.getElementById('modalBody');
        Utils.clearValidationErrors(container);
        
        let isValid = true;
        
        const reg = document.getElementById('fReg').value.trim().toUpperCase();
        const model = document.getElementById('fModel').value.trim();
        const sts = document.getElementById('fSts').value.trim();
        const responsible = document.getElementById('fResp').value.trim();
        const driver = document.getElementById('fDriver').value.trim();
        const mileage = parseInt(document.getElementById('fMileage').value) || 0;
        const last_to = parseInt(document.getElementById('fLastTO').value) || 0;
        const plan_to = parseInt(document.getElementById('fPlanTO').value) || 2000;
        const type = document.getElementById('fType').value;
        const dept = document.getElementById('fDept').value;
        const tsStatus = document.getElementById('fStatus').value;
        
        // Валидация
        const regError = Utils.validateRequired(reg, 'Регистрационный номер');
        if (regError) {
            Utils.showValidationError(document.getElementById('fReg'), regError);
            isValid = false;
        } else {
            if (DataManager.cars.some(c => c.reg === reg)) {
                Utils.showValidationError(document.getElementById('fReg'), 'Автомобиль с таким номером уже существует');
                isValid = false;
            }
        }
        
        const modelError = Utils.validateRequired(model, 'Модель');
        if (modelError) {
            Utils.showValidationError(document.getElementById('fModel'), modelError);
            isValid = false;
        }
        
        const respError = Utils.validateRequired(responsible, 'Ответственный');
        if (respError) {
            Utils.showValidationError(document.getElementById('fResp'), respError);
            isValid = false;
        }
        
        if (!isValid) return;
        
        const remainder = plan_to - mileage;
        let status = '🟢', criticality = '🟢 НИЗКИЙ', notification = '✅ Всё в порядке';
        if (remainder < 0) {
            status = '🔴';
            criticality = '🔴 КРИТИЧНО';
            notification = '⚠️ ПРОСРОЧЕНО!';
        } else if (remainder <= 500) {
            status = '🟠';
            criticality = '🟠 ВЫСОКИЙ';
            notification = '⏰ Осталось ≤ 500 км';
        } else if (remainder <= 1000) {
            status = '🟡';
            criticality = '🟡 СРЕДНИЙ';
            notification = '📅 Осталось ≤ 1000 км';
        }
        
        const newCar = {
            id: DataManager.getNextId(DataManager.cars),
            reg,
            model,
            sts,
            responsible,
            driver: driver || responsible,
            mileage,
            last_to,
            plan_to,
            remainder,
            status,
            mark: '⏳ Ожидается',
            criticality,
            notification,
            type,
            dept,
            tsStatus
        };
        
        DataManager.cars.push(newCar);
        DataManager.save();
        Utils.closeModal();
        window.app.updateDashboard();
        Utils.showToast('✅ Автомобиль добавлен');
        window.sync.sync();
        window.notifications.add('info', `🚗 Добавлен автомобиль ${reg} (${model})`);
    },
    
    showCard: (id) => {
        const car = DataManager.getCarById(id);
        if (!car) return;
        
        const html = `
            <div class="modal-title">🚗 Карточка автомобиля</div>
            <div class="car-card">
                <div class="field"><span class="label">Рег.номер</span><span class="value">${car.reg}</span></div>
                <div class="field"><span class="label">Модель</span><span class="value">${car.model}</span></div>
                <div class="field"><span class="label">СТС</span><span class="value">${car.sts || '—'}</span></div>
                <div class="field"><span class="label">Ответственный</span><span class="value">${car.responsible}</span></div>
                <div class="field"><span class="label">Водитель</span><span class="value">${car.driver || '—'}</span></div>
                <div class="field"><span class="label">Пробег</span><span class="value">${car.mileage} км</span></div>
                <div class="field"><span class="label">Последнее ТО</span><span class="value">${car.last_to} км</span></div>
                <div class="field"><span class="label">Плановое ТО</span><span class="value">${car.plan_to} км</span></div>
                <div class="field"><span class="label">Тип ТС</span><span class="value">${car.type}</span></div>
                <div class="field"><span class="label">Подразделение</span><span class="value">${car.dept}</span></div>
                <div class="field"><span class="label">Статус</span><span class="value">${car.tsStatus}</span></div>
                <div class="field"><span class="label">Критичность</span><span class="value">${car.criticality}</span></div>
                <div class="field"><span class="label">Уведомление</span><span class="value">${car.notification}</span></div>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="window.cars.printCard(${car.id})">🖨️ Печать</button>
                <button class="btn-primary" onclick="window.cars.exportCard(${car.id})">📊 Excel</button>
                <button class="btn-secondary" onclick="Utils.closeModal()">Закрыть</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    printCard: (id) => {
        const car = DataManager.getCarById(id);
        if (!car) return;
        
        const html = `
            <html><head><meta charset="UTF-8"><style>
                body { font-family: Arial, sans-serif; margin: 30px; }
                h1 { text-align: center; color: #1a1e1a; border-bottom: 2px solid #4a6a3a; padding-bottom: 10px; }
                .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 500px; margin: 0 auto; }
                .field { display: flex; padding: 6px 0; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; width: 150px; color: #555; }
                .value { flex: 1; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 11px; }
            </style></head>
            <body>
                <h1>🚗 Карточка автомобиля</h1>
                <div class="card">
                    <div class="field"><span class="label">Рег.номер</span><span class="value">${car.reg}</span></div>
                    <div class="field"><span class="label">Модель</span><span class="value">${car.model}</span></div>
                    <div class="field"><span class="label">СТС</span><span class="value">${car.sts || '—'}</span></div>
                    <div class="field"><span class="label">Ответственный</span><span class="value">${car.responsible}</span></div>
                    <div class="field"><span class="label">Водитель</span><span class="value">${car.driver || '—'}</span></div>
                    <div class="field"><span class="label">Пробег</span><span class="value">${car.mileage} км</span></div>
                    <div class="field"><span class="label">Последнее ТО</span><span class="value">${car.last_to} км</span></div>
                    <div class="field"><span class="label">Плановое ТО</span><span class="value">${car.plan_to} км</span></div>
                    <div class="field"><span class="label">Тип ТС</span><span class="value">${car.type}</span></div>
                    <div class="field"><span class="label">Подразделение</span><span class="value">${car.dept}</span></div>
                    <div class="field"><span class="label">Статус</span><span class="value">${car.tsStatus}</span></div>
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
        const car = DataManager.getCarById(id);
        if (!car) return;
        
        let csv = 'Поле;Значение\n';
        csv += `Рег.номер;${car.reg}\n`;
        csv += `Модель;${car.model}\n`;
        csv += `СТС;${car.sts || '—'}\n`;
        csv += `Ответственный;${car.responsible}\n`;
        csv += `Водитель;${car.driver || '—'}\n`;
        csv += `Пробег;${car.mileage} км\n`;
        csv += `Последнее ТО;${car.last_to} км\n`;
        csv += `Плановое ТО;${car.plan_to} км\n`;
        csv += `Тип ТС;${car.type}\n`;
        csv += `Подразделение;${car.dept}\n`;
        csv += `Статус;${car.tsStatus}\n`;
        
        Utils.downloadFile(csv, `car_${car.reg}_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
        Utils.showToast('📊 Карточка выгружена в Excel');
    }
};

window.cars = CarsManager;