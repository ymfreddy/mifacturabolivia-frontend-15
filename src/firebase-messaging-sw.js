importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");

firebase.initializeApp({
        apiKey: "AIzaSyA1Gjace5sf3EDNs8eWbeEzYLJt_epbQWw",
        authDomain: "notificaciones-piloto.firebaseapp.com",
        projectId: "notificaciones-piloto",
        storageBucket: "notificaciones-piloto.appspot.com",
        messagingSenderId: "504852196800",
        appId: "1:504852196800:web:ebaef769e33a9e81736c25",
        measurementId: "G-9Y67STEG0S"
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
