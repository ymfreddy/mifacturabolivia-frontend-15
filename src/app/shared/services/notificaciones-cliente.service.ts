import { Injectable } from '@angular/core';
import {
    AngularFirestore,
    AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { NotificacionCliente } from '../models/notificacion.model';
import { SessionService } from 'src/app/shared/security/session.service';



@Injectable({
  providedIn: 'root'
})
export class NotificacionesClienteService {

    itemsCollection: AngularFirestoreCollection<NotificacionCliente>;
    constructor(private db: AngularFirestore, private sessionService: SessionService) {
        console.log('verificando mensajes para el usuario: '+this.sessionService.getSessionUserData().username);
      this.itemsCollection = db.collection('notificaciones-cliente', (ref) => ref
      .where('nit','==',this.sessionService.getSessionUserData().empresaNit)
      .where('usuario','==',this.sessionService.getSessionUserData().username)
      .where('leido','==',false));
      console.log(this.itemsCollection);
    }

    generateId(){
        return this.db.createId();
      }

    getAll(){
        console.log('leyendo lista de notificaciones-cliente');
        return this.itemsCollection.valueChanges();
      }

      create(item: NotificacionCliente): any {
        return this.itemsCollection.doc(item.id).set({ ...item });
      }

      update(item: NotificacionCliente): Promise<void> {
        return this.itemsCollection.doc(item.id).update(item);
      }

      deleteByIdNotificacion(idNotificacion: string) {
        this.db.collection('notificaciones-cliente', (ref) => ref
        .where('idNotificacion','==',idNotificacion)).valueChanges().subscribe(items => {
            items.map((item: any) => {
                this.db.doc(`notificaciones-cliente/${item.id}`).delete()
                    .catch(error => {console.log(error); })
                    .then(() => console.log(`Deleting notificaicon (${item.id})`));
            });
        });
      }
}
