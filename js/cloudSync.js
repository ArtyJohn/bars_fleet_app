// ================================================================
//  cloudSync.js - ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ (БЕЗ ТОКЕНОВ!)
//  Использует бесплатный сервис JSONBin.io
// ================================================================

const CloudSync = {
    // Базовый URL API JSONBin
    API_URL: 'https://api.jsonbin.io/v3/b',
    
    // Название хранилища (можно изменить)
    BIN_NAME: 'bars_fleet_data',
    
    // ================================================================
    //  КНОПКА: СОХРАНИТЬ В ОБЛАКО
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
            
            // Проверяем, есть ли уже сохранённый ID
            const binId = localStorage.getItem('cloud_bin_id');
            
            let response;
            
            if (binId) {
                // Обновляем существующее хранилище
                response = await fetch(`${CloudSync.API_URL}/${binId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Bin-Name': CloudSync.BIN_NAME
                    },
                    body: JSON.stringify(data)
                });
            } else {
                // Создаём новое хранилище
                response = await fetch(CloudSync.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Bin-Name': CloudSync.BIN_NAME
                    },
                    body: JSON.stringify(data)
                });
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка сохранения');
            }
            
            const result = await response.json();
            
            // Сохраняем ID для будущих загрузок
            if (!binId) {
                localStorage.setItem('cloud_bin_id', result.id);
            }
            localStorage.setItem('cloud_last_sync', new Date().toISOString());
            
            Utils.showToast('✅ Данные сохранены в облако!', 'sync');
            
            // Запись в историю
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
    //  КНОПКА: ЗАГРУЗИТЬ ИЗ ОБЛАКА
    // ================================================================
    async download() {
        try {
            Utils.showToast('☁️ Загрузка из облака...', 'sync');
            
            const binId = localStorage.getItem('cloud_bin_id');
            
            if (!binId) {
                throw new Error('Нет сохранённых данных в облаке.\nНажмите сначала "Сохранить в облако" с устройства, где есть данные.');
            }
            
            const response = await fetch(`${CloudSync.API_URL}/${binId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Данные в облаке не найдены.\nВозможно, они были удалены.');
                }
                throw new Error(`Ошибка ${response.status}`);
            }
            
            const result = await response.json();
            const data = result.record;
            
            if (!data.cars) {
                throw new Error('Некорректный формат данных');
            }
            
            // Применяем данные
            CloudSync.applyData(data);
            
            Utils.showToast('✅ Данные загружены из облака!', 'sync');
            
            // Запись в историю
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
        
        // Обновляем статусы автомобилей
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
        
        // Загружаем данные
        DataManager.cars = data.cars;
        DataManager.persons = data.persons || [];
        DataManager.weapons = data.weapons || [];
        DataManager.items = data.items || [];
        DataManager.history = data.history || [];
        DataManager.refs = data.refs || {};
        DataManager.repairs = data.repairs || [];
        
        DataManager.save();
        window.app.updateDashboard();
        
        // Показываем информацию о последнем обновлении
        if (data.lastUser) {
            Utils.showToast(`👤 Последнее обновление: ${data.lastUser} (${data.timestamp || 'неизвестно'})`, 'sync');
        } else {
            Utils.showToast('✅ Данные обновлены из облака', 'sync');
        }
    },
    
    // ================================================================
    //  КНОПКА: ИНФОРМАЦИЯ О ДАННЫХ В ОБЛАКЕ
    // ================================================================
    async info() {
        try {
            const binId = localStorage.getItem('cloud_bin_id');
            
            if (!binId) {
                alert('❌ Нет сохранённых данных в облаке.\n\n' +
                      'Нажмите сначала "Сохранить в облако" с устройства, где есть данные.');
                return;
            }
            
            const response = await fetch(`${CloudSync.API_URL}/${binId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    alert('❌ Данные в облаке не найдены.\n' +
                          'Возможно, они были удалены. Нажмите "Сохранить в облако" заново.');
                } else {
                    alert(`❌ Ошибка ${response.status}`);
                }
                return;
            }
            
            const result = await response.json();
            const data = result.record;
            
            const message = 
                `📊 ДАННЫЕ В ОБЛАКЕ\n` +
                `─────────────────────\n` +
                `🚗 Автомобилей: ${data.cars?.length || 0}\n` +
                `👥 Личного состава: ${data.persons?.length || 0}\n` +
                `🔫 Вооружения: ${data.weapons?.length || 0}\n` +
                `📦 ТМЦ: ${data.items?.length || 0}\n` +
                `📋 Записей ТО: ${data.history?.length || 0}\n` +
                `🛠 Заявок: ${data.repairs?.length || 0}\n` +
                `─────────────────────\n` +
                `🕐 Обновлено: ${data.timestamp || 'неизвестно'}\n` +
                `👤 Последний пользователь: ${data.lastUser || 'неизвестен'}\n` +
                `─────────────────────\n` +
                `📌 ID хранилища: ${binId.substring(0, 10)}...`;
            
            alert(message);
            
        } catch (error) {
            alert('❌ Ошибка: ' + error.message);
        }
    },
    
    // ================================================================
    //  КНОПКА: ПРОВЕРИТЬ СОЕДИНЕНИЕ
    // ================================================================
    async testConnection() {
        try {
            Utils.showToast('🔌 Проверка соединения...', 'sync');
            
            const response = await fetch(CloudSync.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Bin-Name': 'test_connection'
                },
                body: JSON.stringify({ test: 'ok', timestamp: new Date().toISOString() })
            });
            
            if (response.ok) {
                const result = await response.json();
                // Удаляем тестовое хранилище
                await fetch(`${CloudSync.API_URL}/${result.id}`, {
                    method: 'DELETE'
                });
                Utils.showToast('✅ Соединение с облаком работает!', 'sync');
                return true;
            } else {
                Utils.showToast('❌ Нет соединения с облаком', 'error');
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
            localStorage.removeItem('cloud_bin_id');
            localStorage.removeItem('cloud_last_sync');
            Utils.showToast('✅ Настройки очищены');
        }
    }
};

// Сохраняем в глобальную область
window.cloudSync = CloudSync;
console.log('☁️ CloudSync загружен');
