// File: firebase-messaging-sw.js

// Import library FCM khusus untuk Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Config yang sama dengan yang ada di index.html kamu
const firebaseConfig = {
    apiKey: "AIzaSyDxabPizF0ShqaQSaJ142Rapxa9JcNq65o",
    authDomain: "amalin-app.firebaseapp.com",
    projectId: "amalin-app",
    storageBucket: "amalin-app.firebasestorage.app",
    messagingSenderId: "745183481034",
    appId: "1:745183481034:web:23b7ba95bf02c355c8f833"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Fungsi untuk menangani pesan yang masuk saat PWA ditutup di *background*
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Menerima pesan background ', payload);
    
    // Konfigurasi tampilan Notifikasi Push di Layar HP
    const notificationTitle = payload.notification.title || 'Amalin Reminder';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png', // Pastikan kamu punya logo PWA-mu
        badge: '/icon.png',
        vibrate: [200, 100, 200], // Getar-jeda-getar untuk efek mendesak (Penyelamat Streak)
        data: {
            url: '/' // Saat di-klik, buka halaman utama
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Aksi ketika user mengetap notifikasi di bar notif HP mereka
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Arahkan ke URL PWA Amalin
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
