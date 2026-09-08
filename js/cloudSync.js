// js/cloudSync.js - Российская облачная синхронизация
const CloudSync = {
    // ⚠️ ВСТАВЬТЕ ВАШ URL ИЗ CALCAL.RU
    STORAGE_URL: 'https://calcal.ru/j/9yPyEJU',
    
    // ================================================================
    //  СОХРАНИТЬ В ОБЛАКО
    // ================================================================
    async upload() {
        try {
            Utils.showToast('☁️ Сохранение в облако...', 'sync');
            
            const data = {
                cars: DataManager.cars,
                persons: DataManager.persons,
                weapons: DataManager.weapons,
                items: DataManager.items,
                history: DataManager.history,
                refs: DataManager.refs,
                repairs: DataManager.repairs,
                timestamp: new Date().toLocaleString('ru-RU'),
                version: '8.0',
                lastUser: AuthManager.currentUser?.label || 'Гость'
            };
            
            // Обновляем данные через PUT
            const response = await fetch(CloudSync.STORAGE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Ошибка сохранения: ' + response.status);
            }
            
            Utils.showToast('✅ Данные сохранены в облако!', 'sync');
            
            if (window.historyLog) {
                window.historyLog.add('sync', 
                    `📤 Данные загружены в облако (авто: ${DataManager.cars.length}, люди: ${DataManager.persons.length})`
                );
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            Utils.showToast('❌ ' + error.message, 'error');
            return false;
        }
    },
    
    // ================================================================
    //  ЗАГРУЗИТЬ ИЗ ОБЛАКА
    // ================================================================
    async download() {
        try {
            Utils.showToast('☁️ Загрузка из облака...', 'sync');
            
            const response = await fetch(CloudSync.STORAGE_URL);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Данные в облаке не найдены');
                }
                throw new Error('Ошибка загрузки: ' + response.status);
            }
            
            const data = await response.json();
            
            if (!data.cars) {
                throw new Error('Некорректный формат данных');
            }
            
            // Применяем данные
            CloudSync.applyData(data);
            
            Utils.showToast('✅ Данные загружены из облака!', 'sync');
            
            if (window.historyLog) {
                window.historyLog.add('sync', 
                    `📥 Данные загружены из облака (авто: ${data.cars.length}, люди: ${data.persons.length})`
                );
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            Utils.showToast('❌ ' + error.message, 'error');
            return false;
        }
    },
    
    // ================================================================
    //  ПРИМЕНЕНИЕ ДАННЫХ
    // ================================================================
    applyData(data) {
        if (!data.cars) return;
        
        data.cars = data.cars.map(c => {
            c.remainder = c.plan_to - c.mileage;
            if (c.remainder < 0) {
                c.status = '🔴';
                c.criticality = '🔴 КРИТИЧНО';
                c.notification = '⚠️ ПРОСРОЧЕНО!';
            } else if (c.remainder <= 500) {
                c.status = '🟠';
                c.criticality = '🟠 ВЫСОКИЙ';
                c.notification = '⏰ Осталось ≤ 500 км';
            } else if (c.remainder <= 1000) {
                c.status = '🟡';
                c.criticality = '🟡 СРЕДНИЙ';
                c.notification = '📅 Осталось ≤ 1000 км';
            } else {
                c.status = '🟢';
                c.criticality = '🟢 НИЗКИЙ';
                c.notification = '✅ Всё в порядке';
            }
            return c;
        });
        
        DataManager.cars = data.cars;
        DataManager.persons = data.persons || [];
        DataManager.weapons = data.weapons || [];
        DataManager.items = data.items || [];
        DataManager.history = data.history || [];
        DataManager.refs = data.refs || {};
        DataManager.repairs = data.repairs || [];
        
        DataManager.save();
        window.app.updateDashboard();
        
        if (data.lastUser) {
            Utils.showToast(`👤 Последнее обновление: ${data.lastUser} (${data.timestamp || 'неизвестно'})`, 'sync');
        }
    },
    
    // ================================================================
    //  ИНФОРМАЦИЯ
    // ================================================================
    async info() {
        try {
            const response = await fetch(CloudSync.STORAGE_URL);
            
            if (!response.ok) {
                alert('❌ Данные в облаке не найдены');
                return;
            }
            
            const data = await response.json();
            
            const message = 
                `📊 ДАННЫЕ В ОБЛАКЕ\n` +
                `─────────────────────\n` +
                `🚗 Автомобилей: ${data.cars?.length || 0}\n` +
                `👥 Личного состава: ${data.persons?.length || 0}\n` +
                `🔫 Вооружения: ${data.weapons?.length || 0}\n` +
                `📦 ТМЦ: ${data.items?.length || 0}\n` +
                `─────────────────────\n` +
                `🕐 Обновлено: ${data.timestamp || 'неизвестно'}\n` +
                `👤 Последний пользователь: ${data.lastUser || 'неизвестен'}`;
            
            alert(message);
            
        } catch (error) {
            alert('❌ Ошибка: ' + error.message);
        }
    },
    
    // ================================================================
    //  ПРОВЕРИТЬ СОЕДИНЕНИЕ
    // ================================================================
    async testConnection() {
        try {
            Utils.showToast('🔌 Проверка соединения...', 'sync');
            
            const response = await fetch(CloudSync.STORAGE_URL);
            
            if (response.ok || response.status === 404) {
                Utils.showToast('✅ Соединение с облаком работает!', 'sync');
                return true;
            } else {
                Utils.showToast('❌ Ошибка соединения: ' + response.status, 'error');
                return false;
            }
            
        } catch (error) {
            Utils.showToast('❌ Ошибка соединения: ' + error.message, 'error');
            return false;
        }
    }
};

window.cloudSync = CloudSync;
console.log('☁️ CloudSync загружен');
