const CACHE_NAME = "version-1";
// const urlsToCache = ["index.html", "offline.html"];

const self = this;

//Install SW - open and add things to cache
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log("Opened cache")
    // await cache.addAll(urlsToCache) // ok
    await cache.add(new Request("offline.html", {cache:'reload'})) // ok
    // Setting {cache: 'reload'} in the new request will ensure that the response
    // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
  })());
});

//Listen for requests - offline page
self.addEventListener("fetch", (event) => {//listener ouvindo todos os fetch requests
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === "navigate") { //A mode for suporting navigation. The navigate value is intended to be used only by html navigation. A navigate request is created only while navigationg between documents
    event.respondWith(
      (async () => {
        // First, try to use the navigation preload response if it's supported.
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is likely
          // due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log("Fetch failed; returning offline page instead.", error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match("offline.html");
          return cachedResponse;
        }
      })()
    );
  }
  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there
  // were no service worker involvement.
});

//Activate the SW
self.addEventListener("activate", (event) => {
  // Enable navigation preload if it's supported.
  event.waitUntil((async () => {
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable(); //
    }
  })());
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});
