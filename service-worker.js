// 오프라인 캐싱 전략:
// - 자주 바뀌는 파일(레퍼토리, 앱 코드)은 "네트워크 우선" -> 항상 최신 내용을 받아오고,
//   오프라인일 때만 캐시된 걸 대신 보여줌
// - 거의 안 바뀌는 파일(체스판 라이브러리, 이미지)은 "캐시 우선" -> 빠르고 데이터 절약
const CACHE_NAME = "opening-trainer-v2";

const NETWORK_FIRST_FILES = ["index.html", "style.css", "trainer.js", "repertoire.js", "manifest.json"];

const CACHE_ASSETS = [
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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
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

function isNetworkFirst(pathname) {
  return NETWORK_FIRST_FILES.some((f) => pathname.endsWith(f)) || pathname.endsWith("/");
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (isNetworkFirst(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
      );
    })
  );
});
