import { Injectable } from '@angular/core';
import {
    AngularFirestore,
    AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

    //itemsCollection: AngularFirestoreCollection<Notificacion>;
    constructor(private db: AngularFirestore) {
      //this.itemsCollection = db.collection('notificaciones');
    }

    getAll(limite: number){
        console.log('leyendo lista de notificaciones');
        return this.db.collection('notificaciones',
            (ref) => ref.orderBy('fecha', 'desc').limit(limite)
        ).valueChanges();
    }

    getByIds(ids: string[]){
        console.log(ids);
        return this.db.collection('notificaciones', (ref) =>
        ref.where('id','in', ids).orderBy('fecha', 'desc')).valueChanges();
      }

      create(item: Notificacion): any {
        return this.db.collection('notificaciones').doc(item.id).set({ ...item });
      }

      generateId(){
        return this.db.createId();
      }

      update(item: Notificacion): Promise<void> {
        return this.db.collection('notificaciones').doc(item.id).update(item);
      }

      delete(id: string): Promise<void> {
        return this.db.collection('notificaciones').doc(id).delete();
      }

   /* itemsCollection!: AngularFirestoreCollection<Notificacion>;

    notificaciones!: Observable<any[]>;

  constructor(private firestore: AngularFirestore,
    private sessionService: SessionService) {
     }

     obtenerNotificaciones() {
        return this.firestore.collection('notificaciones',
            (ref) => ref.orderBy('fecha', 'desc')
        ).valueChanges();
    }

    obtenerNotificacionesUsuario() {
        return this.firestore.collection(
            'notificaciones',
            (ref) =>
                ref.where(
                    'nit',
                    '==',
                    this.sessionService.getSessionUserData().empresaNit
                ).where('leido',
                '==',
                false)
        ).valueChanges();
    }*/


}
