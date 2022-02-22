const CACHE_NAME = "version-1" 
const urlsToCache = ['index.html', 'offline.html']

const self = this

//Install SW - open and add things to cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME) //o cache é aberto uma vez e permanece aberto durante os updates da pagina.
        .then((cache)=>{
            console.log('Opened cache') //para reiniciar o cache, é necessário esvaziar o cache na aba de aplicativo > armazenamento. 
            return cache.addAll(urlsToCache) // o index.html e o offline html são adicionados ao cache. Para verificar o que está presente dentro dele, va em aplicação > armazenamento em cache
        })
    )
})

//Listen for requests - offline page
self.addEventListener('fetch', (event) => { //listener ouvindo todos os fetch requests
    event.respondWith( //metodo para inserir uma promisse à um fetch ouvido
        caches.match(event.request) //requests: img, api call, another img ...
        .then(()=>{
            return fetch(event.request) //for all requests, we fetch them again. on our case we never wat to store the data about the api. For exemplo, when we search for new york, we always want to get new data, so we always want to repeat the request for that specific thing, an then, if it cannot fetch the data, that means that there ir no internet connection, and the . catch will be executed, calling the offline.html
            .catch(()=>caches.match('offline.html'))
        })
    )
})

//Activate the SW
self.addEventListener('activate', (event) => {
    const cacheWhiteList = []
    cacheWhiteList.push(CACHE_NAME)
    event.waitUntil(
        caches.keys()
        .then((cacheNames)=>Promise.all(
            cacheNames.map((cacheName) => {
                if(!cacheWhiteList.includes(cacheName)){// if the cacheWhiteList does not include the cacheName, it will delete the cacheName
                    return caches.delete(cacheName)
                }
                return''
            })
        ))
        
    )
})