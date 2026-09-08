// ================================================================
//  cloudSync.js - СИНХРОНИЗАЦИЯ ЧЕРЕЗ PASTEBIN
//  Работает в России, без сложных ключей
// ================================================================

const CloudSync = {
    // ================================================================
    //  ⚠️ ВСТАВЬТЕ ВАШ API КЛЮЧ ИЗ PASTEBIN
    // ================================================================
    API_KEY: '82iMRQi741PEciDvJC1fHHWHqMwdAjlS',
    
    // Имя файла в Pastebin
    BIN_NAME: 'bars_fleet_data',
    
    // ================================================================
    //  СОХРАНИТЬ В ОБЛАКО
    // ================================================================
    async upload() {
        try {
            Utils.showToast('☁️ Сохранение в облако...', 'sync');
            
            // Собираем данные
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
            
            // Превращаем в JSON строку
            const jsonData = JSON.stringify(data, null, 2);
            
            // Сохраняем в localStorage как резервную копию
            localStorage.setItem('cloud_backup', jsonData);
            
            // Проверяем, есть ли уже сохранённый паст
            const pasteKey = localStorage.getItem('pastebin_key');
            
            let response;
            
            if (pasteKey) {
                // Обновляем существующий паст
                response = await fetch('https://pastebin.com/api/api_post.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        api_dev_key: CloudSync.API_KEY,
                        api_option: 'edit',
                        api_paste_key: pasteKey,
                        api_paste_code: jsonData,
                        api_paste_name: CloudSync.BIN_NAME,
                        api_paste_format: 'json'
                    })
                });
            } else {
                // Создаём новый паст
                response = await fetch('https://pastebin.com/api/api_post.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        api_dev_key: CloudSync.API_KEY,
                        api_option: 'paste',
                        api_paste_code: jsonData,
                        api_paste_name: CloudSync.BIN_NAME,
                        api_paste_format: 'json',
                        api_paste_private: '1' // приватный
                    })
                });
            }
            
            const text = await response.text();
            
            if (text.startsWith('Bad API request')) {
                throw new Error('Ошибка API: ' + text);
            }
            
            if (!pasteKey) {
                // Сохраняем ключ паста для обновления
                localStorage.setItem('pastebin_key', text);
            }
            
            Utils.showToast('✅ Данные сохранены в облако (Pastebin)!', 'sync');
            
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
            
            const pasteKey = localStorage.getItem('pastebin_key');
            
            if (!pasteKey) {
                throw new Error('Нет сохранённых данных в облаке.\nНажмите сначала "Сохранить в облако" с устройства, где есть данные.');
            }
            
            // Загружаем паст
            const response = await fetch(`https://pastebin.com/raw/${pasteKey}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Данные в облаке не найдены');
                }
                throw new Error('Ошибка загрузки: ' + response.status);
            }
            
            const jsonData = await response.text();
            const data = JSON.parse(jsonData);
            
            if (!data.cars) {
                throw new Error('Некорректный формат данных');
            }
            
            // Применяем данные
            CloudSync.applyData(data);
            
            Utils.showToast('✅ Данные загружены из облака (Pastebin)!', 'sync');
            
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
            const pasteKey = localStorage.getItem('pastebin_key');
            
            if (!pasteKey) {
                alert('❌ Нет сохранённых данных в облаке');
                return;
            }
            
            const response = await fetch(`https://pastebin.com/raw/${pasteKey}`);
            
            if (!response.ok) {
                alert('❌ Данные в облаке не найдены');
                return;
            }
            
            const jsonData = await response.text();
            const data = JSON.parse(jsonData);
            
            const message = 
                `📊 ДАННЫЕ В ОБЛАКЕ (Pastebin)\n` +
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
            
            // Просто проверяем, что API ключ работает
            const response = await fetch('https://pastebin.com/api/api_post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    api_dev_key: CloudSync.API_KEY,
                    api_option: 'list'
                })
            });
            
            if (response.ok) {
                Utils.showToast('✅ Соединение с облаком работает!', 'sync');
                return true;
            } else {
                const text = await response.text();
                if (text.includes('Bad API request')) {
                    Utils.showToast('❌ Неверный API ключ', 'error');
                } else {
                    Utils.showToast('❌ Ошибка: ' + response.status, 'error');
                }
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
            localStorage.removeItem('pastebin_key');
            localStorage.removeItem('cloud_backup');
            Utils.showToast('✅ Настройки очищены');
        }
    }
};

window.cloudSync = CloudSync;
console.log('☁️ CloudSync загружен');
