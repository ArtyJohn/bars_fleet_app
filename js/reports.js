// js/reports.js - Отчёты
const ReportsManager = {
    showDialog: () => {
        const html = `
            <div class="modal-title">📊 Выбор данных для отчёта</div>
            <div class="form-group">
                <label>Выберите данные:</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptCars" checked> 🚗 Автопарк</label>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptPersons" checked> 👥 Личный состав</label>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptWeapons" checked> 🔫 Вооружение</label>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptStock" checked> 📦 Склад</label>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="rptHistory" checked> 📋 История ТО</label>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="Utils.closeModal()">Отмена</button>
                <button class="btn-primary" onclick="window.reports.generate()">📊 Сформировать отчёт</button>
                <button class="btn-primary" onclick="window.reports.generateExcel()">📊 Выгрузить в Excel</button>
            </div>
        `;
        Utils.openModal(html);
    },
    
    generate: () => {
        Utils.closeModal();
        let html = `
            <html><head><meta charset="UTF-8"><style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; color: #1a1e1a; border-bottom: 2px solid #4a6a3a; padding-bottom: 10px; }
                h2 { color: #4a6a3a; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                th { background: #1a1e1a; color: white; padding: 6px; text-align: left; border: 1px solid #333; }
                td { padding: 4px 6px; border: 1px solid #ccc; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
                .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
                .stat { background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center; }
                .stat .num { font-size: 24px; font-weight: bold; color: #4a6a3a; }
                .stat .label { font-size: 12px; color: #666; }
            </style></head>
            <body>
                <h1>📊 ОТЧЁТ ПО ПОДРАЗДЕЛЕНИЮ</h1>
                <p style="text-align:center;">Дата формирования: ${new Date().toLocaleString()}</p>
                <div class="summary">
                    <div class="stat"><div class="num">${DataManager.cars.length}</div><div class="label">🚗 Автомобилей</div></div>
                    <div class="stat"><div class="num">${DataManager.persons.length}</div><div class="label">👥 Личного состава</div></div>
                    <div class="stat"><div class="num">${DataManager.weapons.length}</div><div class="label">🔫 Единиц вооружения</div></div>
                    <div class="stat"><div class="num">${DataManager.items.length}</div><div class="label">📦 Позиций на складе</div></div>
                </div>
        `;
        
        const rptCars = document.getElementById('rptCars').checked;
        const rptPersons = document.getElementById('rptPersons').checked;
        const rptWeapons = document.getElementById('rptWeapons').checked;
        const rptStock = document.getElementById('rptStock').checked;
        const rptHistory = document.getElementById('rptHistory').checked;
        
        if (rptCars && DataManager.cars.length > 0) {
            html += `<h2>🚗 Автопарк (${DataManager.cars.length})</h2>
            <table><thead><tr><th>№</th><th>Рег.номер</th><th>Модель</th><th>Пробег</th><th>Остаток</th><th>Статус</th></tr></thead><tbody>`;
            DataManager.cars.forEach((c, i) => {
                html += `<tr><td>${i+1}</td><td>${c.reg}</td><td>${c.model}</td><td>${c.mileage}</td><td>${c.remainder}</td><td>${c.status}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
        
        if (rptPersons && DataManager.persons.length > 0) {
            html += `<h2>👥 Личный состав (${DataManager.persons.length})</h2>
            <table><thead><tr><th>№</th><th>ФИО</th><th>Должность</th><th>Подразделение</th><th>Звание</th></tr></thead><tbody>`;
            DataManager.persons.forEach((p, i) => {
                html += `<tr><td>${i+1}</td><td>${p.fio}</td><td>${p.position}</td><td>${p.department}</td><td>${p.rank}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
        
        if (rptWeapons && DataManager.weapons.length > 0) {
            html += `<h2>🔫 Вооружение (${DataManager.weapons.length})</h2>
            <table><thead><tr><th>№</th><th>Тип</th><th>Бортовой №</th><th>Статус</th><th>Неисправность</th></tr></thead><tbody>`;
            DataManager.weapons.forEach((w, i) => {
                html += `<tr><td>${i+1}</td><td>${w.type}</td><td>${w.number}</td><td>${w.status}</td><td>${w.fault || '—'}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
        
        if (rptStock && DataManager.items.length > 0) {
            html += `<h2>📦 Склад (${DataManager.items.length})</h2>
            <table><thead><tr><th>№</th><th>Наименование</th><th>Артикул</th><th>Кол-во</th><th>Ед. изм.</th><th>Склад</th></tr></thead><tbody>`;
            DataManager.items.forEach((item, i) => {
                html += `<tr><td>${i+1}</td><td>${item.name}</td><td>${item.article || '—'}</td><td>${item.quantity}</td><td>${item.unit}</td><td>${item.storage || '—'}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
        
        if (rptHistory && DataManager.history.length > 0) {
            html += `<h2>📋 История ТО (${DataManager.history.length})</h2>
            <table><thead><tr><th>№</th><th>Дата</th><th>Автомобиль</th><th>Пробег</th><th>Тип ТО</th></tr></thead><tbody>`;
            const sorted = [...DataManager.history].sort((a, b) => b.id - a.id);
            sorted.forEach((h, i) => {
                html += `<tr><td>${i+1}</td><td>${h.date}</td><td>${h.reg}</td><td>${h.mileage}</td><td>${h.toType}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
        
        html += `
                <div class="footer">Учетная система роты ЛК • ${new Date().toLocaleString()}</div>
                <script>window.print(); setTimeout(window.close, 1000);<\/script>
            </body></html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        Utils.showToast('📊 Отчёт сформирован');
    },
    
    generateExcel: () => {
        Utils.closeModal();
        const rptCars = document.getElementById('rptCars').checked;
        const rptPersons = document.getElementById('rptPersons').checked;
        const rptWeapons = document.getElementById('rptWeapons').checked;
        const rptStock = document.getElementById('rptStock').checked;
        const rptHistory = document.getElementById('rptHistory').checked;
        
        let csv = 'Учетная система роты ЛК\n';
        csv += `Отчёт от: ${new Date().toLocaleString()}\n\n`;
        
        if (rptCars && DataManager.cars.length > 0) {
            csv += '=== АВТОПАРК ===\n';
            csv += '№;Рег.номер;Модель;Пробег;Остаток;Статус\n';
            DataManager.cars.forEach((c, i) => {
                csv += `${i+1};${c.reg};${c.model};${c.mileage};${c.remainder};${c.status}\n`;
            });
            csv += '\n';
        }
        
        if (rptPersons && DataManager.persons.length > 0) {
            csv += '=== ЛИЧНЫЙ СОСТАВ ===\n';
            csv += '№;ФИО;Должность;Подразделение;Звание;Телефон\n';
            DataManager.persons.forEach((p, i) => {
                csv += `${i+1};${p.fio};${p.position};${p.department};${p.rank};${p.phone || ''}\n`;
            });
            csv += '\n';
        }
        
        if (rptWeapons && DataManager.weapons.length > 0) {
            csv += '=== ВООРУЖЕНИЕ ===\n';
            csv += '№;Тип;Бортовой №;Статус;Неисправность\n';
            DataManager.weapons.forEach((w, i) => {
                csv += `${i+1};${w.type};${w.number};${w.status};${w.fault || ''}\n`;
            });
            csv += '\n';
        }
        
        if (rptStock && DataManager.items.length > 0) {
            csv += '=== СКЛАД ===\n';
            csv += '№;Наименование;Артикул;Тип;Кол-во;Ед.изм.;Склад;Примечание\n';
            DataManager.items.forEach((item, i) => {
                csv += `${i+1};${item.name};${item.article || ''};${item.type || ''};${item.quantity};${item.unit};${item.storage || ''};${item.note || ''}\n`;
            });
            csv += '\n';
        }
        
        if (rptHistory && DataManager.history.length > 0) {
            csv += '=== ИСТОРИЯ ТО ===\n';
            csv += '№;Дата;Автомобиль;Модель;Пробег;Тип ТО;Примечание\n';
            const sorted = [...DataManager.history].sort((a, b) => b.id - a.id);
            sorted.forEach((h, i) => {
                csv += `${i+1};${h.date};${h.reg};${h.model};${h.mileage};${h.toType};${h.note || ''}\n`;
            });
            csv += '\n';
        }
        
        Utils.downloadFile(csv, `report_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
        Utils.showToast('📊 Отчёт выгружен в Excel');
    },
    
    print: () => {
        const html = `
            <html><head><meta charset="UTF-8"><style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; color: #1a1e1a; border-bottom: 2px solid #4a6a3a; padding-bottom: 10px; }
                .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
                .stat { background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center; }
                .stat .num { font-size: 24px; font-weight: bold; color: #4a6a3a; }
                .stat .label { font-size: 12px; color: #666; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
            </style></head>
            <body>
                <h1>📊 ОТЧЁТ ПО ПОДРАЗДЕЛЕНИЮ</h1>
                <p style="text-align:center;">Дата формирования: ${new Date().toLocaleString()}</p>
                <div class="summary">
                    <div class="stat"><div class="num">${DataManager.cars.length}</div><div class="label">🚗 Автомобилей</div></div>
                    <div class="stat"><div class="num">${DataManager.persons.length}</div><div class="label">👥 Личного состава</div></div>
                    <div class="stat"><div class="num">${DataManager.weapons.length}</div><div class="label">🔫 Единиц вооружения</div></div>
                    <div class="stat"><div class="num">${DataManager.items.length}</div><div class="label">📦 Позиций на складе</div></div>
                </div>
                <div class="footer">Учетная система роты ЛК • ${new Date().toLocaleString()}</div>
                <script>window.print(); setTimeout(window.close, 1000);<\/script>
            </body></html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        Utils.showToast('🖨️ Отправлено на печать');
    }
};

window.reports = ReportsManager;