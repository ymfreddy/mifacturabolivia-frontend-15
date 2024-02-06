import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionService } from 'src/app/shared/security/session.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';

@Injectable({
  providedIn: 'root'
})
export class PushService {
    constructor(private http: HttpClient,
      private sessionService: SessionService,
      private informationService: InformationService,
      private helperService: HelperService) { }

    registrarUsuarioToken(idUsuario: number, token: string): Observable<any> {
      const solicitud = {
        idUsuario: idUsuario,
        tokenEquipo: token,
      };
      console.log(solicitud);
      const apiUrl = `${environment.api.util}/notificaciones/tokens`;
      return this.http.post<any>(apiUrl, solicitud);
    }

    requestPermission() {
      const messaging = getMessaging();
      console.log(messaging);
      getToken(messaging,
        { vapidKey: environment.firebase.vapidKey }).then(
          (currentToken) => {
            if (currentToken) {
              console.log("Hurraaa!!! we got the token.....");
              console.log(currentToken);
              // registrar token
              this.registrarUsuarioToken(this.sessionService.getSessionUserData().id, currentToken).subscribe({
                next: (res) => {
                  //console.log(res);
                },
                error: (err) => {
                }
              });

            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
        }).catch((err) => {
           console.log('An error occurred while retrieving token. ', err);
       });
    }

    listen() {
      const messaging = getMessaging();
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        if (payload){
            this.informationService.showInfo(payload.notification?.title!);
        }
      });
    }
  }
