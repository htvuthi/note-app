// use a cacheName for cache versioning
let cacheName = 'v1:static';

// during the install phase you usually want to cache static assets
self.addEventListener('install', function(e) {
    // once the SW is installed, go ahead and fetch the resources to make this work offline
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll([
                './',
                '../src/App.jsx',
                '../src/App.css',
                '../src/index.js',
                '../src/components/Main.jsx',
                '../src/components/Sidebar.jsx'

            ]).then(function() {
                self.skipWaiting();
            });
        })
    );
});

// when the browser fetches a url
self.addEventListener('fetch', function(event) {
    // either respond with the cached object or go ahead and fetch the actual url
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                // retrieve from cache
                return response;
            }
            // fetch as normal
            return fetch(event.request);
        })
    );
});

self.addEventListener('sync', function(event) {
    if (event.tag == 'BackgroundSync') {
        event.waitUntil(doSomeStuff());
    }
});

insertIntoDatabase =  (dataObject) =>  {
    let indexedDBOpenRequest = window.indexedDB.open('order',  1)
    indexedDBOpenRequest.onupgradeneeded = function () {
        this.result.createObjectStore('order_requests', {
            autoIncrement:  true })
    }

    indexedDBOpenRequest.onsuccess = function () {
        let db = this.result
        let transaction = db.transaction("order_requests", "readwrite");
        let storeObj = transaction.objectStore("order_requests");
        storeObj.add(dataObject);
    }
    indexedDBOpenRequest.onerror = function (error) {
        console.error('IndexedDB error:', error)
    }
}

const URL = "http://localhost:5000";

// get data from indexedb
function getOrderData(){
    var indexedDBOpenRequest = indexedDB.open('order',  1)
    indexedDBOpenRequest.onsuccess = function () {
        let db = this.result
        let transaction = db.transaction("order_requests", "readwrite");
        let storeObj = transaction.objectStore("order_requests");
        var cursorRequest = storeObj.openCursor();
        cursorRequest.onsuccess = function(evt) {
            var cursor = evt.target.result;
            if (cursor) {
                console.log("cursor.value", cursor.value)
                sendTableOrder(cursor.value, cursor.key)
                cursor.continue();
            }
        };
    }
    indexedDBOpenRequest.onerror = function (error) {
        console.error('IndexedDB error:', error)
    }
}

// order sent to the server
function sendTableOrder(data, index){
    fetch(URL + 'orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }).then((response) => {
        if(response){
            deleteFromIndexdb(index)
        }
    });
}

// delete data from indexedb, that sent to server
function deleteFromIndexdb(index){
    let indexedDBOpenRequest = indexedDB.open('order',  1)
    indexedDBOpenRequest.onsuccess = function () {
        let db = this.result
        let transaction = db.transaction("order_requests", "readwrite");
        let storeObj = transaction.objectStore("order_requests");
        storeObj.delete(index)
    }
}

self.addEventListener('sync', function(event) {
    if (event.tag == 'order') {
        event.waitUntil(getOrderData());
    }
});

