'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "a536935b12e2a189521d0611906e1714",
"assets/assets/Images/logo_1.jpg": "94660c0b018ce10eb59a9e98cc898dc4",
"assets/assets/Images/logo_2.jpg": "95f0249614810e7c033229b345b6786e",
"assets/assets/Images/logo_3.jpg": "7a71d0028e9eb383b66b4cd48754e604",
"assets/FontManifest.json": "c312b60ee9b88a2496771be0b539a8cd",
"assets/fonts/FireSans/FiraSansCondensed-Black.ttf": "4ecc662bac705302e394e563d39e00fd",
"assets/fonts/FireSans/FiraSansCondensed-BlackItalic.ttf": "0964f5241d78442e861131e24e5e26f8",
"assets/fonts/FireSans/FiraSansCondensed-Bold.ttf": "bb5fa4e75a4d91a0489e9e1011b1d070",
"assets/fonts/FireSans/FiraSansCondensed-BoldItalic.ttf": "90ff7000d3cfdafd54bda5b7649c69f1",
"assets/fonts/FireSans/FiraSansCondensed-ExtraBold.ttf": "790bac4b2ac39799f8a747bdf68a7cd2",
"assets/fonts/FireSans/FiraSansCondensed-ExtraBoldItalic.ttf": "57e2a163cd90a26a519a7077c5a1a8fe",
"assets/fonts/FireSans/FiraSansCondensed-ExtraLight.ttf": "d55292f0df70064e6218b5f5d91d1934",
"assets/fonts/FireSans/FiraSansCondensed-ExtraLightItalic.ttf": "16972bd7652834b3da7b2ccabd4a8ddf",
"assets/fonts/FireSans/FiraSansCondensed-Italic.ttf": "4624264ca30882a2cf1af5f090527ce2",
"assets/fonts/FireSans/FiraSansCondensed-Light.ttf": "b18f7282668681f572850589590bd20b",
"assets/fonts/FireSans/FiraSansCondensed-LightItalic.ttf": "24f302e7df486c9a62fd2006d146fb56",
"assets/fonts/FireSans/FiraSansCondensed-Medium.ttf": "61aa84b919d3110141509e18362e667f",
"assets/fonts/FireSans/FiraSansCondensed-MediumItalic.ttf": "513deabb733a59e10022bb8dec15957a",
"assets/fonts/FireSans/FiraSansCondensed-Regular.ttf": "d53f5839d7be3435e0c84f8eae29d7c6",
"assets/fonts/FireSans/FiraSansCondensed-SemiBold.ttf": "114d3bec24e49f9afde79dac37759a91",
"assets/fonts/FireSans/FiraSansCondensed-SemiBoldItalic.ttf": "1c682f897a1f2f5d1399900126932f55",
"assets/fonts/FireSans/FiraSansCondensed-Thin.ttf": "503918abd007e91543bd6ceb3d49095d",
"assets/fonts/FireSans/FiraSansCondensed-ThinItalic.ttf": "7e570c1f6f050f89baafb30786bbc754",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "a5048dd9dfd3fef8776ae1449f21d1a2",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "8f2f292aabff04ad209c26f2a6e25531",
"/": "8f2f292aabff04ad209c26f2a6e25531",
"main.dart.js": "ba4bf3a57884ea9a5ea9e8d5282dabe6",
"manifest.json": "9d4eb24b0fda051fca603250e831ae38",
"version.json": "f701318340b44de22105cb3525f959ee"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}