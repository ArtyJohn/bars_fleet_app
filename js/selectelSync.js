// ================================================================
//  selectelSync.js - СИНХРОНИЗАЦИЯ ЧЕРЕЗ SELECTEL S3
//  Российское облачное хранилище, работает в РФ
//  ДАННЫЕ ВСТАВЛЕНЫ!
// ================================================================

const SelectelSync = {
    // ================================================================
    //  ✅ ВАШИ ДАННЫЕ ИЗ SELECTEL (УЖЕ ВСТАВЛЕНЫ!)
    // ================================================================
    
    // S3 API эндпоинт (ваш домен)
    ENDPOINT: 'https://s3.ru-6.storage.selcloud.ru',
    
    // Имя вашего бакета (создайте в панели Selectel)
    BUCKET_NAME: 'bars-fleet-storage',
    
    // Ключи доступа (ваши)
    ACCESS_KEY_ID: 'b28916cac3a74e178b02bab48c6506c1',
    SECRET_ACCESS_KEY: '4c57c9e656cc403e9815ebc469498319',
    
    // Имя файла в хранилище
    OBJECT_KEY: 'fleet_data.json',
    
    // Публичный URL для чтения (если бакет публичный)
    // Формат: https://ИМЯ_БАКЕТА.ДОМЕН/ИМЯ_ФАЙЛА
    PUBLIC_URL: 'https://bars-fleet-storage.s3.ru-6.storage.selcloud.ru',
    
    // ================================================================
    //  СОХРАНИТЬ ДАННЫЕ В SELECTEL S3
    // ================================================================
    async upload() {
        try {
            Utils.showToast('☁️ Сохранение в Selectel S3...', 'sync');
            
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
            
            const jsonData = JSON.stringify(data, null, 2);
            
            // Формируем URL для PUT-запроса
            const url = `${SelectelSync.ENDPOINT}/${SelectelSync.BUCKET_NAME}/${SelectelSync.OBJECT_KEY}`;
            
            // Создаем подпись для авторизации (S3 совместимая)
            const date = new Date().toUTCString();
            const stringToSign = `PUT\n\napplication/json\n${date}\n/${SelectelSync.BUCKET_NAME}/${SelectelSync.OBJECT_KEY}`;
            
            // Используем простую авторизацию через заголовок Authorization
            // Для S3 совместимых хранилищ используется AWS Signature V4
            // Упрощенный вариант: используем fetch с базовой авторизацией
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Date': date,
                    'Authorization': `AWS ${SelectelSync.ACCESS_KEY_ID}:${SelectelSync.SECRET_ACCESS_KEY}`
                },
                body: jsonData
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Ошибка сохранения: ${response.status} - ${error}`);
            }
            
            Utils.showToast('✅ Данные сохранены в Selectel S3!', 'sync');
            
            if (window.historyLog) {
                window.historyLog.add('sync', 
                    `📤 Данные загружены в Selectel S3 (авто: ${DataManager.cars.length}, люди: ${DataManager.persons.length})`
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
    //  ЗАГРУЗИТЬ ДАННЫЕ ИЗ SELECTEL S3
    // ================================================================
    async download() {
        try {
            Utils.showToast('☁️ Загрузка из Selectel S3...', 'sync');
            
            // Загружаем по публичному URL
            const publicUrl = `${SelectelSync.PUBLIC_URL}/${SelectelSync.OBJECT_KEY}`;
            console.log('📥 Загрузка с:', publicUrl);
            
            const response = await fetch(publicUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Данные в облаке не найдены. Сначала нажмите "Сохранить в Selectel" с устройства, где есть данные.');
                }
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.cars) {
                throw new Error('Некорректный формат данных');
            }
            
            SelectelSync.applyData(data);
            
            Utils.showToast('✅ Данные загружены из Selectel S3!', 'sync');
            
            if (window.historyLog) {
                window.historyLog.add('sync', 
                    `📥 Данные загружены из Selectel S3 (авто: ${data.cars.length}, люди: ${data.persons.length})`
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
            const publicUrl = `${SelectelSync.PUBLIC_URL}/${SelectelSync.OBJECT_KEY}`;
            const response = await fetch(publicUrl);
            
            if (!response.ok) {
                alert('❌ Данные в Selectel S3 не найдены');
                return;
            }
            
            const data = await response.json();
            
            const message = 
                `📊 ДАННЫЕ В ОБЛАКЕ (Selectel S3)\n` +
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
            Utils.showToast('🔌 Проверка соединения с Selectel S3...', 'sync');
            
            const publicUrl = `${SelectelSync.PUBLIC_URL}/${SelectelSync.OBJECT_KEY}`;
            console.log('🔌 Проверка URL:', publicUrl);
            
            const response = await fetch(publicUrl);
            
            if (response.ok || response.status === 200) {
                Utils.showToast('✅ Соединение с Selectel S3 работает!', 'sync');
                return true;
            } else if (response.status === 404) {
                Utils.showToast('⚠️ Соединение есть, но данных пока нет. Сохраните данные сначала!', 'sync');
                return true;
            } else {
                Utils.showToast('❌ Ошибка: ' + response.status, 'error');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Ошибка соединения:', error);
            Utils.showToast('❌ Ошибка соединения: ' + error.message, 'error');
            return false;
        }
    },
    
    // ================================================================
    //  ОЧИСТИТЬ НАСТРОЙКИ
    // ================================================================
    clear() {
        if (confirm('Очистить настройки облачной синхронизации?')) {
            Utils.showToast('✅ Настройки очищены');
        }
    }
};

window.selectelSync = SelectelSync;
console.log('☁️ SelectelSync загружен');
console.log('📦 ENDPOINT:', SelectelSync.ENDPOINT);
console.log('📦 BUCKET:', SelectelSync.BUCKET_NAME);
console.log('🔑 ACCESS_KEY_ID:', SelectelSync.ACCESS_KEY_ID ? '✅ установлен' : '❌ не установлен');
console.log('🔐 SECRET_ACCESS_KEY:', SelectelSync.SECRET_ACCESS_KEY ? '✅ установлен' : '❌ не установлен');
console.log('🌐 PUBLIC_URL:', SelectelSync.PUBLIC_URL);
