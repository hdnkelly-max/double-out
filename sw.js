// TOPS service worker: makes the game installable. Network first, so updates always land; no offline cache of the game itself.
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{});
