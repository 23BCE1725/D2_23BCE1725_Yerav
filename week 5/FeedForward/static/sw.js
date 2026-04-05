self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FeedForward';
  const options = {
    body: data.body || '',
    icon: '/static/images/favicon.svg',
    badge: '/static/images/favicon.svg',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data.url;
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
