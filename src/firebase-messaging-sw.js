importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyDpb2pfiZvyM561-XJ3EKiXfD9t5RAvUZw",
    authDomain: "notificaciones-produccio-63424.firebaseapp.com",
    projectId: "notificaciones-produccio-63424",
    storageBucket: "notificaciones-produccio-63424.appspot.com",
    messagingSenderId: "393267250906",
    appId: "1:393267250906:web:2dcbc064bcb5a4e6ee47e3",
    measurementId: "G-635BR0KCBF"
});

const messaging = firebase.messaging();

/*messaging.onBackgroundMessage((message) => {
      const mensaje = {
            ... message.notification,
            icon:'assets/icons/icon-128x128.png',
            badge: 'assets/icons/icon-48x48.png',
            vibrate: [100, 50, 10, 20, 20]
      }
    console.log(mensaje);
    return self.registration.showNotification(message.notification.title, mensaje );
  });*/

self.addEventListener('notificationclick', event => {
    const url= `${self.location.origin}/#/adm/menu-principal`;
    console.log(url);
    event.notification.close();
    event.waitUntil(clients.openWindow(url));
 });
