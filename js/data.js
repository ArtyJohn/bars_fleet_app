// js/data.js - Управление данными
const DataManager = {
    prefix: 'bars_',
    
    // Данные
    cars: [],
    persons: [],
    weapons: [],
    items: [],
    history: [],
    notifications: [],
    repairs: [],
    refs: {},
    
    // Роли и пароли (с хешированием)
    roles: {
        admin: { name: 'Командир', passwordHash: '', label: '👑 Командир' },
        starshiy: { name: 'Старшина', passwordHash: '', label: '⭐ Старшина' },
        mehanik: { name: 'Механик', passwordHash: '', label: '🔧 Механик' },
        voditel: { name: 'Водитель', passwordHash: '', label: '🚗 Водитель' },
        oruzhie: { name: 'Оружейник', passwordHash: '', label: '🔫 Оружейник' },
        klad: { name: 'Кладовщик', passwordHash: '', label: '📦 Кладовщик' }
    },
    
    // Простой хеш (в реальном проекте использовать bcrypt)
    hashPassword: (password) => {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(36);
    },
    
    initRoles: () => {
        const defaultPasswords = {
            admin: 'admin2026',
            starshiy: 'bars2026',
            mehanik: 'mehanik2026',
            voditel: 'voditel2026',
            oruzhie: 'oruzhie2026',
            klad: 'klad2026'
        };
        
        Object.keys(DataManager.roles).forEach(role => {
            if (!DataManager.roles[role].passwordHash) {
                DataManager.roles[role].passwordHash = DataManager.hashPassword(defaultPasswords[role]);
            }
        });
    },
    
    // Начальные данные
    defaultData: {
        cars: [
            { id: 1, reg: 'Е390НУ977', model: 'Foton Tunland G9', sts: '1234567890', responsible: 'Ремнев Артем Сергеевич', driver: 'Ремнев Артем Сергеевич', mileage: 5359, last_to: 2000, plan_to: 12000, type: 'Легковой', dept: 'Штаб', tsStatus: 'В эксплуатации' },
            { id: 2, reg: 'Е420НУ977', model: 'Foton Tunland G9', sts: '0987654321', responsible: 'Федоров Богдан Владимирович', driver: 'Федоров Богдан Владимирович', mileage: 7485, last_to: 2000, plan_to: 12000, type: 'Легковой', dept: 'Инструкторский состав', tsStatus: 'В эксплуатации' },
            { id: 3, reg: 'Е391НУ977', model: 'Foton Tunland G9', sts: '1122334455', responsible: 'Магомедов Магомед Насрудинович', driver: 'Никифоров Роман Владимирович', mileage: 0, last_to: 2000, plan_to: 12000, type: 'Легковой', dept: 'Штаб', tsStatus: 'В эксплуатации' },
            { id: 4, reg: 'Е445НУ977', model: 'Foton Tunland G9', sts: '5544332211', responsible: 'Магомедов Магомед Насрудинович', driver: 'Магомедов Магомед Насрудинович', mileage: 144, last_to: 0, plan_to: 2000, type: 'Легковой', dept: 'Снабжение', tsStatus: 'В эксплуатации' },
            { id: 5, reg: 'Е474НУ977', model: 'Foton Tunland G9', sts: '6677889900', responsible: 'Зятиков Илья Михайлович', driver: 'Зятиков Илья Михайлович', mileage: 4185, last_to: 2000, plan_to: 12000, type: 'Легковой', dept: 'Штаб', tsStatus: 'В эксплуатации' },
            { id: 6, reg: 'Е370НУ977', model: 'Foton Tunland G9', sts: '7788990011', responsible: 'Блинов Сергей Денисович', driver: 'Блинов Сергей Денисович', mileage: 75, last_to: 0, plan_to: 2000, type: 'Легковой', dept: 'Инструкторский состав', tsStatus: 'В эксплуатации' },
            { id: 7, reg: 'Е556НУ977', model: 'Foton Tunland G9', sts: '8899001122', responsible: 'Тимофеев Антон Владимирович', driver: 'Тимофеев Антон Владимирович', mileage: 339, last_to: 0, plan_to: 2000, type: 'Легковой', dept: 'Снабжение', tsStatus: 'В эксплуатации' }
        ],
        persons: [
            { id: 1, fio: 'Ремнев Артем Сергеевич', position: 'Старшина', department: 'Штаб', rank: 'Старшина', phone: '+7 (999) 123-45-67' },
            { id: 2, fio: 'Магомедов Магомед Насрудинович', position: 'Водитель', department: 'Снабжение', rank: 'Сержант', phone: '+7 (999) 234-56-78' },
            { id: 3, fio: 'Федоров Богдан Владимирович', position: 'Водитель', department: 'Инструкторский состав', rank: 'Ефрейтор', phone: '+7 (999) 345-67-89' },
            { id: 4, fio: 'Зятиков Илья Михайлович', position: 'Командир', department: 'Штаб', rank: 'Капитан', phone: '+7 (999) 456-78-90' },
            { id: 5, fio: 'Блинов Сергей Денисович', position: 'Водитель', department: 'Инструкторский состав', rank: 'Ефрейтор', phone: '+7 (999) 567-89-01' },
            { id: 6, fio: 'Тимофеев Антон Владимирович', position: 'Водитель', department: 'Снабжение', rank: 'Сержант', phone: '+7 (999) 678-90-12' },
            { id: 7, fio: 'Никифоров Роман Владимирович', position: 'Водитель', department: 'Штаб', rank: 'Ефрейтор', phone: '+7 (999) 789-01-23' }
        ],
        weapons: [
            { id: 1, type: 'Барьер', number: 'Б-001', symbol: 'Б-1', coordinates: '55.75, 37.62', status: 'Исправно', fault: '', lastRequest: '' },
            { id: 2, type: 'Барьер', number: 'Б-002', symbol: 'Б-2', coordinates: '55.76, 37.63', status: 'В ремонте', fault: 'Неисправен блок наведения', lastRequest: 'Заявка №1 от 01.09.2026' },
            { id: 3, type: 'Звездочет', number: 'З-001', symbol: 'З-1', coordinates: '55.77, 37.64', status: 'Исправно', fault: '', lastRequest: '' },
            { id: 4, type: 'Звездочет', number: 'З-002', symbol: 'З-2', coordinates: '55.78, 37.65', status: 'Неисправно', fault: 'Сбой системы охлаждения', lastRequest: 'Заявка №2 от 05.09.2026' }
        ],
        items: [
            { id: 1, name: 'Масло моторное 5W-30', article: 'M-001', type: 'Расходные материалы', unit: 'л', quantity: 50, storage: 'Склад №1', note: 'Для двигателей' },
            { id: 2, name: 'Фильтр масляный', article: 'F-001', type: 'Запасные части', unit: 'шт.', quantity: 30, storage: 'Склад №1', note: '' },
            { id: 3, name: 'Тормозные колодки', article: 'T-001', type: 'Запасные части', unit: 'компл.', quantity: 15, storage: 'Склад №2', note: 'Для легковых' },
            { id: 4, name: 'Свечи зажигания', article: 'S-001', type: 'Запасные части', unit: 'шт.', quantity: 100, storage: 'Склад №2', note: '' },
            { id: 5, name: 'Набор гаечных ключей', article: 'I-001', type: 'Инструмент', unit: 'компл.', quantity: 10, storage: 'Склад №3', note: '' }
        ],
        history: [
            { id: 1, date: '13.08.2026', reg: 'Е391НУ977', model: 'Foton Tunland G9', mileage: 1998, toType: 'ТО-0 (2 000 км)', note: '' },
            { id: 2, date: '12.08.2026', reg: 'Е390НУ977', model: 'Foton Tunland G9', mileage: 1999, toType: 'ТО-0 (2 000 км)', note: '' },
            { id: 3, date: '14.08.2026', reg: 'Е474НУ977', model: 'Foton Tunland G9', mileage: 1986, toType: 'ТО-0 (2 000 км)', note: '' }
        ],
        repairs: [
            { id: 1, weaponId: 2, date: '01.09.2026, 10:30', description: 'Неисправен блок наведения, требуется замена', responsible: 'Иванов И.И. (ООО РемСервис)', deadline: '10.09.2026, 18:00', status: 'Открыта' },
            { id: 2, weaponId: 4, date: '05.09.2026, 14:20', description: 'Сбой системы охлаждения, перегрев при работе', responsible: 'Петров П.П. (АО ТехРемонт)', deadline: '15.09.2026, 18:00', status: 'Открыта' },
            { id: 3, weaponId: 1, date: '25.08.2026, 09:00', description: 'Плановое ТО, замена расходников', responsible: 'Сидоров С.С. (ООО РемСервис)', deadline: '30.08.2026, 18:00', status: 'Закрыта' }
        ],
        refs: {
            carTypes: ['Легковой', 'Грузовой', 'Спецтехника'],
            departments: ['Штаб', 'Снабжение', 'Полетная группа', 'Инструкторский состав', 'Ремонтная рота'],
            statuses: ['В эксплуатации', 'В ремонте', 'Резерв', 'Списано'],
            toTypes: ['ТО-0 (2 000 км)', 'ТО-1 (10 000 км)', 'ТО-2 (20 000 км)', 'ТО-3 (30 000 км)', 'ТО-4 (40 000 км)', 'ТО-5 (50 000 км)', 'ТО-6 (60 000 км)', 'ТО-7 (70 000 км)', 'ТО-8 (80 000 км)', 'ТО-9 (90 000 км)', 'ТО-10 (100 000 км)'],
            exploitants: ['Ремнев Артем Сергеевич', 'Магомедов Магомед Насрудинович', 'Федоров Богдан Владимирович', 'Зарипов Айнур Ильдарович', 'Циденов Михаил Олегович', 'Тимофеев Антон Владимирович', 'Никифоров Роман Владимирович', 'Абрамов Владислав Александрович', 'Блинов Сергей Денисович', 'Шишков Сергей Александрович', 'Зятиков Илья Михайлович'],
            positions: ['Командир', 'Заместитель командира', 'Старшина', 'Механик', 'Водитель', 'Оружейник', 'Кладовщик', 'Связист', 'Разведчик'],
            ranks: ['Рядовой', 'Ефрейтор', 'Младший сержант', 'Сержант', 'Старший сержант', 'Старшина', 'Прапорщик', 'Старший прапорщик', 'Лейтенант', 'Старший лейтенант', 'Капитан', 'Майор', 'Подполковник', 'Полковник'],
            units: ['шт.', 'компл.', 'л', 'кг', 'м', 'км', 'шт.', 'уп.', 'кор.', 'пач.'],
            weaponTypes: ['Барьер', 'Звездочет'],
            weaponStatuses: ['Исправно', 'В ремонте', 'Неисправно', 'На хранении', 'Списано'],
            stockTypes: ['Расходные материалы', 'Запасные части', 'Инструмент', 'ГСМ', 'Спецодежда', 'Прочее']
        }
    },
    
    load: () => {
        const prefix = DataManager.prefix;
        
        const savedCars = localStorage.getItem(prefix + 'cars');
        const savedPersons = localStorage.getItem(prefix + 'persons');
        const savedWeapons = localStorage.getItem(prefix + 'weapons');
        const savedItems = localStorage.getItem(prefix + 'items');
        const savedHistory = localStorage.getItem(prefix + 'history');
        const savedNotifs = localStorage.getItem(prefix + 'notifs');
        const savedRepairs = localStorage.getItem(prefix + 'repairs');
        const savedRefs = localStorage.getItem(prefix + 'refs');
        
        // Если есть сохранённые данные - загружаем их, иначе - начальные
        DataManager.cars = savedCars ? JSON.parse(savedCars) : JSON.parse(JSON.stringify(DataManager.defaultData.cars));
        DataManager.persons = savedPersons ? JSON.parse(savedPersons) : JSON.parse(JSON.stringify(DataManager.defaultData.persons));
        DataManager.weapons = savedWeapons ? JSON.parse(savedWeapons) : JSON.parse(JSON.stringify(DataManager.defaultData.weapons));
        DataManager.items = savedItems ? JSON.parse(savedItems) : JSON.parse(JSON.stringify(DataManager.defaultData.items));
        DataManager.history = savedHistory ? JSON.parse(savedHistory) : JSON.parse(JSON.stringify(DataManager.defaultData.history));
        DataManager.notifications = savedNotifs ? JSON.parse(savedNotifs) : [];
        DataManager.repairs = savedRepairs ? JSON.parse(savedRepairs) : JSON.parse(JSON.stringify(DataManager.defaultData.repairs));
        DataManager.refs = savedRefs ? JSON.parse(savedRefs) : JSON.parse(JSON.stringify(DataManager.defaultData.refs));
        
        // Загружаем хеши паролей
        const savedRoles = localStorage.getItem(prefix + 'roles');
        if (savedRoles) {
            try {
                const parsed = JSON.parse(savedRoles);
                Object.keys(parsed).forEach(role => {
                    if (DataManager.roles[role]) {
                        DataManager.roles[role].passwordHash = parsed[role].passwordHash;
                    }
                });
            } catch (e) {}
        }
        
        DataManager.initRoles();
        DataManager.save();
        
        // Обновляем статусы автомобилей
        DataManager.cars = DataManager.cars.map(c => {
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
        
        DataManager.save();
    },
    
    save: () => {
        const prefix = DataManager.prefix;
        localStorage.setItem(prefix + 'cars', JSON.stringify(DataManager.cars));
        localStorage.setItem(prefix + 'persons', JSON.stringify(DataManager.persons));
        localStorage.setItem(prefix + 'weapons', JSON.stringify(DataManager.weapons));
        localStorage.setItem(prefix + 'items', JSON.stringify(DataManager.items));
        localStorage.setItem(prefix + 'history', JSON.stringify(DataManager.history));
        localStorage.setItem(prefix + 'notifs', JSON.stringify(DataManager.notifications));
        localStorage.setItem(prefix + 'repairs', JSON.stringify(DataManager.repairs));
        localStorage.setItem(prefix + 'refs', JSON.stringify(DataManager.refs));
        
        // Сохраняем хеши паролей
        const rolesToSave = {};
        Object.keys(DataManager.roles).forEach(role => {
            rolesToSave[role] = {
                passwordHash: DataManager.roles[role].passwordHash
            };
        });
        localStorage.setItem(prefix + 'roles', JSON.stringify(rolesToSave));
    },
    
    resetAll: () => {
        if (confirm('⚠️ ВНИМАНИЕ! Это действие удалит ВСЕ данные!\n\nВы уверены?')) {
            if (confirm('Последнее подтверждение: удалить все данные?')) {
                const prefix = DataManager.prefix;
                const keys = [
                    prefix + 'cars', prefix + 'persons', prefix + 'weapons',
                    prefix + 'items', prefix + 'history', prefix + 'notifs',
                    prefix + 'repairs', prefix + 'refs', prefix + 'roles'
                ];
                keys.forEach(key => localStorage.removeItem(key));
                
                // Загружаем начальные данные
                DataManager.cars = JSON.parse(JSON.stringify(DataManager.defaultData.cars));
                DataManager.persons = JSON.parse(JSON.stringify(DataManager.defaultData.persons));
                DataManager.weapons = JSON.parse(JSON.stringify(DataManager.defaultData.weapons));
                DataManager.items = JSON.parse(JSON.stringify(DataManager.defaultData.items));
                DataManager.history = JSON.parse(JSON.stringify(DataManager.defaultData.history));
                DataManager.repairs = JSON.parse(JSON.stringify(DataManager.defaultData.repairs));
                DataManager.refs = JSON.parse(JSON.stringify(DataManager.defaultData.refs));
                DataManager.notifications = [];
                
                DataManager.initRoles();
                DataManager.save();
                
                window.app.updateDashboard();
                Utils.showToast('🗑️ Все данные сброшены к начальным');
            }
        }
    },
    
    getCarById: (id) => DataManager.cars.find(c => c.id === id),
    getPersonById: (id) => DataManager.persons.find(p => p.id === id),
    getWeaponById: (id) => DataManager.weapons.find(w => w.id === id),
    getItemById: (id) => DataManager.items.find(i => i.id === id),
    getRepairById: (id) => DataManager.repairs.find(r => r.id === id),
    
    getNextId: (array) => array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1
};

window.DataManager = DataManager;