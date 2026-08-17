// 오프라인 캐싱: 첫 접속 이후에는 인터넷 없이도 앱이 열리도록 함
const CACHE_NAME = "opening-trainer-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./trainer.js",
  "./repertoire.js",
  "./manifest.json",
  "./lib/jquery-3.6.0.min.js",
  "./lib/chess.js",
  "./lib/chessboard-1.0.0.min.js",
  "./lib/chessboard-1.0.0.min.css",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./lib/img/chesspieces/wikipedia/wP.png",
  "./lib/img/chesspieces/wikipedia/wN.png",
  "./lib/img/chesspieces/wikipedia/wB.png",
  "./lib/img/chesspieces/wikipedia/wR.png",
  "./lib/img/chesspieces/wikipedia/wQ.png",
  "./lib/img/chesspieces/wikipedia/wK.png",
  "./lib/img/chesspieces/wikipedia/bP.png",
  "./lib/img/chesspieces/wikipedia/bN.png",
  "./lib/img/chesspieces/wikipedia/bB.png",
  "./lib/img/chesspieces/wikipedia/bR.png",
  "./lib/img/chesspieces/wikipedia/bQ.png",
  "./lib/img/chesspieces/wikipedia/bK.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }).catch(() => cached)
      );
    })
  );
});
