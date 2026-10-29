// Serves the decrypted formalbio site from Cache Storage under <scope>/app/.
var VERSION = new URL(self.location.href).searchParams.get("v");
var CACHE = "formalbio-" + VERSION;
var SCOPE = new URL(self.registration.scope);
var APP = SCOPE.pathname + "app/";

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== SCOPE.origin || url.pathname.indexOf(APP) !== 0 || event.request.method !== "GET") return;
  event.respondWith(caches.open(CACHE).then(function (cache) {
    var path = url.pathname.slice(-1) === "/" ? url.pathname + "index.html" : url.pathname;
    return cache.match(url.origin + path, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (event.request.mode === "navigate") {
        var rel = path.slice(APP.length);
        return Response.redirect(SCOPE.pathname + "?next=" + encodeURIComponent(rel), 302);
      }
      return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
    });
  }));
});
