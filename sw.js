const CACHE = 'cards-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png', './app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Не кэшируем API
  if (e.request.url.includes('/api/')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
    if (resp && resp.status === 200 && resp.type === 'basic') { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
    return resp;
  }).catch(() => caches.match('./index.html'))));
});

// Push-уведомления
self.addEventListener('push', event => {
  let data = { title: 'Cards', body: 'Пора повторить карточки!' };
  try { if (event.data) data = event.data.json(); } catch(e) {}
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then(clientList => {
    for (const client of clientList) { if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus(); }
    if (clients.openWindow) return clients.openWindow(event.notification.data.url || '/');
  }));
});