// ================================================================
//  cloudSync.js - СИНХРОНИЗАЦИЯ ЧЕРЕЗ CALCAL.RU
//  С обходом CORS через прокси
// ================================================================

const CloudSync = {
    // ================================================================
    //  ✅ ВАШ URL ИЗ CALCAL.RU
    // ================================================================
    STORAGE_URL: 'https://calcal.ru/j/8Ays5qN',
    
    // ================================================================
    //  ПРОКСИ ДЛЯ ОБХОДА CORS (используем бесплатный)
    // ================================================================
    // Вариант 1: Используем corsproxy.io (бесплатно, работает в РФ)
    PROXY_URL: 'https://corsproxy.io/?',
    
    // ================================================================
    //  СОХРАНИТЬ В ОБЛАКО (через прокси)
    // ================================================================
    async upload() {
        try {
            Utils.showToast('☁️ Сохранение в облако...', 'sync');
            
            // Собираем все данные
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
            
            // Отправляем через прокси (PUT с обходом CORS)
            const response = await fetch(`${CloudSync.PROXY_URL}${CloudSync.STORAGE_URL}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }
            
            Utils.showToast('✅ Данные сохранены в облако (calcal.ru)!', 'sync');
            
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
    //  ЗАГРУЗИТЬ ИЗ ОБЛАКА (обычный GET, CORS не блокирует)
    // ================================================================
    async download() {
        try {
            Utils.showToast('☁️ Загрузка из облака...', 'sync');
            
            // GET-запросы обычно работают без CORS
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
            
            CloudSync.applyData(data);
            
            Utils.showToast('✅ Данные загружены из облака (calcal.ru)!', 'sync');
            
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
    //  ПРИМЕНЕНИЕ ЗАГРУЖЕННЫХ ДАННЫХ
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
    //  ИНФОРМАЦИЯ О ДАННЫХ
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
                `📊 ДАННЫЕ В ОБЛАКЕ (calcal.ru)\n` +
                `─────────────────────\n` +
                `🚗 Автомобилей: ${data.cars?.length || 0}\n` +
                `👥 Личного состава: ${data.persons?.length || 0}\n` +
                `🔫 Вооружения: ${data.weapons?.length || 0}\n` +
                `📦 ТМЦ: ${data.items?.length || 0}\n` +
                `📋 Записей ТО: ${data.history?.length || 0}\n` +
                `🛠 Заявок: ${data.repairs?.length || 0}\n` +
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
            Utils.showToast('🔌 Проверка соединения с calcal.ru...', 'sync');
            
            const response = await fetch(CloudSync.STORAGE_URL);
            
            if (response.ok || response.status === 200) {
                Utils.showToast('✅ Соединение с calcal.ru работает!', 'sync');
                return true;
            } else {
                Utils.showToast('❌ Ошибка: ' + response.status, 'error');
                return false;
            }
            
        } catch (error) {
            Utils.showToast('❌ Ошибка соединения: ' + error.message, 'error');
            return false;
        }
    },
    
    // ================================================================
    //  ОЧИСТИТЬ НАСТРОЙКИ
    // ================================================================
    clear() {
        if (confirm('Очистить настройки облачной синхронизации?')) {
            localStorage.removeItem('calcal_storage_url');
            Utils.showToast('✅ Настройки очищены');
        }
    }
};

window.cloudSync = CloudSync;
console.log('☁️ CloudSync загружен (calcal.ru)');
console.log('📦 STORAGE_URL:', CloudSync.STORAGE_URL);
