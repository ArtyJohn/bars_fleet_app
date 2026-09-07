// js/export.js - Экспорт данных
const ExportManager = {
    exportAll: () => {
        const data = {
            cars: DataManager.cars,
            persons: DataManager.persons,
            weapons: DataManager.weapons,
            items: DataManager.items,
            history: DataManager.history,
            refs: DataManager.refs,
            repairs: DataManager.repairs,
            exported: new Date().toISOString(),
            version: '8.0'
        };
        const json = JSON.stringify(data, null, 2);
        Utils.downloadFile(json, `bars_data_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
        Utils.showToast('📤 Данные экспортированы');
    },
    
    exportToExcel: () => {
        let csv = 'Учетная система роты ЛК\n';
        csv += `Экспорт от: ${new Date().toLocaleString()}\n\n`;
        csv += '=== АВТОПАРК ===\n';
        csv += '№;Рег.номер;Модель;СТС;Пробег;Остаток;Статус\n';
        DataManager.cars.forEach((c, i) => {
            csv += `${i+1};${c.reg};${c.model};${c.sts || ''};${c.mileage};${c.remainder};${c.status}\n`;
        });
        csv += '\n';
        csv += '=== ЛИЧНЫЙ СОСТАВ ===\n';
        csv += '№;ФИО;Должность;Подразделение;Звание;Телефон\n';
        DataManager.persons.forEach((p, i) => {
            csv += `${i+1};${p.fio};${p.position};${p.department};${p.rank};${p.phone || ''}\n`;
        });
        csv += '\n';
        csv += '=== ВООРУЖЕНИЕ ===\n';
        csv += '№;Тип;Бортовой №;Статус;Неисправность;Заявка\n';
        DataManager.weapons.forEach((w, i) => {
            csv += `${i+1};${w.type};${w.number};${w.status};${w.fault || ''};${w.lastRequest || ''}\n`;
        });
        csv += '\n';
        csv += '=== СКЛАД ===\n';
        csv += '№;Наименование;Артикул;Тип;Кол-во;Ед.изм.;Склад;Примечание\n';
        DataManager.items.forEach((item, i) => {
            csv += `${i+1};${item.name};${item.article || ''};${item.type || ''};${item.quantity};${item.unit};${item.storage || ''};${item.note || ''}\n`;
        });
        csv += '\n';
        csv += '=== ИСТОРИЯ ТО ===\n';
        csv += '№;Дата;Автомобиль;Модель;Пробег;Тип ТО;Примечание\n';
        const sorted = [...DataManager.history].sort((a, b) => b.id - a.id);
        sorted.forEach((h, i) => {
            csv += `${i+1};${h.date};${h.reg};${h.model};${h.mileage};${h.toType};${h.note || ''}\n`;
        });
        Utils.downloadFile(csv, `bars_full_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8');
        Utils.showToast('📊 Все данные выгружены в Excel');
    }
};

window.exportData = ExportManager;