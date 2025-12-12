// sw.js
const CACHE_NAME = 'site-static-v1.2'; // 更新名字以触发重新缓存
const ASSETS = [
    '/',                   // 根页面（视你的路由而定）
    '/index.min.js',
    '/beautifier.min.js',
    // '/offline.html'      // 如果你想在离线时返回一个离线页面，取消注释并把它加入到服务器
];

// Install - 预缓存资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting()) // 安装完成后立即激活（可选）
    );
});

// Activate - 清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve())
            )
        ).then(() => self.clients.claim()) // 立即接管所有页面（可选）
    );
});

// Fetch - cache-first + stale-while-revalidate
self.addEventListener('fetch', event => {
    const req = event.request;

    // 只处理 GET 请求（避免缓存 POST/PUT 等）
    if (req.method !== 'GET') return;

    // 对 navigation 请求（页面刷新/路由导航）可以优先返回缓存的 index.html 或提供离线页
    if (req.mode === 'navigate') {
        event.respondWith(
            caches.match('/').then(cachedResp => {
                // 优先返回缓存的 ，如果没有则去网络，再没有则返回离线页面（如果提供的话）
                return cachedResp || fetch(req).then(networkResp => {
                    // 可选：把最新的  更新到缓存
                    caches.open(CACHE_NAME).then(cache => cache.put('/', networkResp.clone()));
                    return networkResp;
                }).catch((e) => {
                  console.error(e)
                });
            })
        );
        return;
    }

    // 对静态文件采用 cache-first + 更新缓存的策略
    event.respondWith(
        caches.match(req).then(cached => {
            const networkFetch = fetch(req).then(networkResp => {
                // 更新缓存（异步，不阻塞响应）
                if (networkResp && networkResp.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        // 注意：对跨域请求，需要服务器设置 CORS 头，否则 put 会失败
                        try { cache.put(req, networkResp.clone()); } catch (e) { /* ignore */ }
                    });
                }
                return networkResp.clone ? networkResp : networkResp; // 网络响应返回
            }).catch(() => {
                // 网络失败时，如缓存不存在可返回一些回退（图片/静态资源/空响应等）
                if (req.destination === 'image') {
                    // 可返回占位图片：return caches.match('/images/fallback.png');
                    return new Response('', { status: 404, statusText: 'offline' });
                }
                return null;
            });

            // 如果有缓存就立即返回缓存，同时触发网络更新；否则等待网络返回
            return cached ? Promise.resolve(cached) : networkFetch;
        })
    );
});
