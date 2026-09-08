// ================================================================
//  gistSync.js - СИНХРОНИЗАЦИЯ ЧЕРЕЗ GITHUB GIST
// ================================================================

const GistSync = {
    // Получаем настройки из config.js
    get GIST_ID() {
        return window.CONFIG?.GIST_ID || '';
    },
    
    get GITHUB_TOKEN() {
        return window.CONFIG?.GITHUB_TOKEN || '';
    },
    
    // Проверяем, всё ли настроено
    isConfigured() {
        if (!this.GIST_ID || this.GIST_ID === 'ЗАМЕНИТЕ_НА_ВАШ_ID') {
            return false;
        }
        if (!this.GITHUB_TOKEN || this.GITHUB_TOKEN === 'ЗАМЕНИТЕ_НА_ВАШ_ТОКЕН') {
            return false;
        }
        return true;
    },
    
    // ================================================================
    //  КНОПКА: СОХРАНИТЬ ДАННЫЕ В GIST
    // ================================================================
    async upload() {
        // Проверяем настройки
        if (!this.isConfigured()) {
            alert('❌ ОШИБКА: Сначала настройте Gist!\n\n' +
                  '1. Откройте файл js/config.js\n' +
                  '2. Вставьте ваш GIST_ID и GITHUB_TOKEN\n' +
                  '3. Сохраните файл и обновите страницу');
            return false;
        }
        
        try {
            // Показываем сообщение
            Utils.showToast('☁️ Сохранение в GitHub Gist...', 'sync');
            
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
                version: '8.0'
            };
            
            // Отправляем в GitHub
            const response = await fetch(`https://api.github.com/gists/${this.GIST_ID}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    files: {
                        'bars_fleet_data.json': {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });
            
            // Проверяем ответ
            if (!response.ok) {
                const error = await response.json();
                
                // Понятные сообщения об ошибках
                if (response.status === 401) {
                    throw new Error('❌ Неверный токен! Проверьте GITHUB_TOKEN в config.js');
                }
                if (response.status === 404) {
                    throw new Error('❌ Gist не найден! Проверьте GIST_ID в config.js');
                }
                if (response.status === 403) {
                    throw new Error('❌ Нет прав! В токене должна быть галочка "gist"');
                }
                throw new Error(`Ошибка ${response.status}: ${error.message}`);
            }
            
            // Успех!
            Utils.showToast('✅ Данные сохранены в GitHub Gist!', 'sync');
            
            // Записываем в историю
            if (window.historyLog) {
                window.historyLog.add('sync', 
                    `📤 Данные загружены в Gist (авто: ${DataManager.cars.length}, люди: ${DataManager.persons.length})`
                );
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка:', error);
            Utils.showToast('❌ ' + error.message, 'error');
            return false;
        }
    },
    
    // ================================================================
    //  КНОПКА: ЗАГРУЗИТЬ ДАННЫЕ ИЗ GIST
    // ================================================================
    async download() {
        // Проверяем настройки
        if (!this.isConfigured()) {
            alert('❌ ОШИБКА: Сначала настройте Gist!\n\n' +
                  '1. Откройте файл js/config.js\n' +
                  '2. Вставьте ваш GIST_ID и GITHUB_TOKEN\n' +
                  '3. Сохраните файл и обновите страницу');
            return false;
        }
        
        try {
            // Показываем сообщение
            Utils.showToast('☁️ Загрузка из GitHub Gist...', 'sync');
            
            // Загружаем данные
            const response = await fetch(`https://api.github.com/gists/${this.GIST_ID}`, {
                headers: {
                    'Authorization': `token ${this.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                if (response.status === 404) {
                    throw new Error('❌ Gist не найден! Проверьте GIST_ID');
                }
                throw new Error(`Ошибка ${response.status}: ${error.message}`);
            }
            
            const gist = await response.json();
            const content = gist.files['bars_fleet_data.json']?.content;
            
            if (!content) {
                throw new Error('❌ Файл bars_fleet_data.json не найден в Gist');
            }
            
            const data = JSON.parse(content);
            
            if (!data.cars) {
                throw new Error('❌ Некорректный формат данных');
            }
            
            // Применяем данные
            this.applyData(data);
            Utils.showToast('✅ Данные загружены из Gist!', 'sync');
            
            // Записываем в историю
            if (window.historyLog) {
                window.historyLog.add('sync', 
                    `📥 Данные загружены из Gist (авто: ${data.cars.length}, люди: ${data.persons.length})`
                );
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка:', error);
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
    },
    
    // ================================================================
    //  КНОПКА: ИНФОРМАЦИЯ О ДАННЫХ В GIST
    // ================================================================
    async info() {
        if (!this.isConfigured()) {
            alert('❌ Gist не настроен! Сначала заполните config.js');
            return;
        }
        
        try {
            const response = await fetch(`https://api.github.com/gists/${this.GIST_ID}`, {
                headers: {
                    'Authorization': `token ${this.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const gist = await response.json();
            const content = gist.files['bars_fleet_data.json']?.content;
            
            if (content) {
                const data = JSON.parse(content);
                const message = 
                    `📊 ДАННЫЕ В GIST\n` +
                    `─────────────────────\n` +
                    `🚗 Автомобилей: ${data.cars?.length || 0}\n` +
                    `👥 Личного состава: ${data.persons?.length || 0}\n` +
                    `🔫 Вооружения: ${data.weapons?.length || 0}\n` +
                    `📦 ТМЦ на складе: ${data.items?.length || 0}\n` +
                    `📋 Записей ТО: ${data.history?.length || 0}\n` +
                    `🛠 Заявок: ${data.repairs?.length || 0}\n` +
                    `─────────────────────\n` +
                    `🕐 Обновлено: ${data.timestamp || 'неизвестно'}`;
                
                alert(message);
                return data;
            }
            
            alert('❌ Данные в Gist не найдены');
            return null;
            
        } catch (error) {
            alert('❌ Ошибка: ' + error.message);
            return null;
        }
    }
};

// Сохраняем в глобальную область
window.gistSync = GistSync;
console.log('☁️ GistSync загружен');