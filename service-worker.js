// service-worker.js - обновлённая версия
const CACHE_NAME = 'bars-cache-v8';
const STATIC_CACHE = 'bars-static-v8';
const DYNAMIC_CACHE = 'bars-dynamic-v8';

const urlsToCache = [
    'index.html',
    'manifest.json',
    'icon-72.png',
    'icon-96.png',
    'icon-128.png',
    'icon-144.png',
    'icon-152.png',
    'icon-192.png',
    'icon-384.png',
    'icon-512.png'
];

// Файлы JS для кеширования
const jsFiles = [
    'js/utils.js',
    'js/data.js',
    'js/auth.js',
    'js/notifications.js',
    'js/sync.js',
    'js/refs.js',
    'js/cars.js',
    'js/persons.js',
    'js/weapons.js',
    'js/repairs.js',
    'js/stock.js',
    'js/history.js',
    'js/reports.js',
    'js/export.js',
    'js/app.js'
];

// Устанавливаем Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('✅ Рота ЛК: статический кэш создан');
                return cache.addAll([...urlsToCache, ...jsFiles]);
            })
            .catch((err) => console.error('❌ Ошибка кэширования:', err))
    );
    self.skipWaiting();
});

// Активация - удаляем старые кэши
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('🗑️ Удалён старый кэш:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Стратегия: network-first для API, cache-first для статики
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Для API запросов используем network-first
    if (url.pathname.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Для статических ресурсов используем cache-first
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    // Обновляем кэш в фоне
                    fetch(event.request).then((fetchResponse) => {
                        if (fetchResponse && fetchResponse.status === 200) {
                            caches.open(STATIC_CACHE).then((cache) => {
                                cache.put(event.request, fetchResponse);
                            });
                        }
                    }).catch(() => {});
                    return response;
                }
                
                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(STATIC_CACHE)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
            .catch(() => {
                // Если ничего не найдено, показываем index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('index.html');
                }
                return new Response('Офлайн', { status: 503 });
            })
    );
});