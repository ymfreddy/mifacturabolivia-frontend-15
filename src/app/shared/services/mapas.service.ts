import { Injectable, Pipe } from '@angular/core';
import {
    AngularFirestore,
    AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Posicion } from '../models/posicion.model';
import { SessionService } from '../security/session.service';

@Injectable({
    providedIn: 'root',
})
export class MapasService {
    itemsCollection!: AngularFirestoreCollection<Posicion>;

    posiciones!: Observable<any[]>;
    constructor(
        private firestore: AngularFirestore,
        private sessionService: SessionService
    ) {
            this.itemsCollection = this.firestore.collection(
                'positions',
                (ref) =>
                    ref.where(
                        'nit',
                        '==',
                        this.sessionService.getSessionUserData().empresaNit
                    )
            );
    }

    obtenerPosiciones() {
        this.posiciones = this.itemsCollection.valueChanges();
        return this.posiciones;
    }

    registrarPosicion(idUsuario: number,  posicion: Posicion) {
        this.itemsCollection.get().subscribe((querySnapshot) => {
                this.itemsCollection
                    .doc(idUsuario.toString())
                    .update({ latitude: posicion.latitude, longitude: posicion.longitude })
                    .then((res) => console.log('posicion actualizada'));

        });

        /*this.itemsCollection.get().subscribe((querySnapshot) => {
            console.log('Total users: ', querySnapshot.size);
            let existeId;
            querySnapshot.forEach((documentSnapshot) => {
                if (
                    documentSnapshot.data().user == posicion.user &&
                    documentSnapshot.data().nit == posicion.nit
                ) {
                    existeId = documentSnapshot.id;
                }
            });

            if (!existeId) {
                this.itemsCollection
                    .add(posicion)
                    .then((res) => console.log('posicion adicionada'));
            } else {
                this.itemsCollection
                    .doc(existeId)
                    .update({ latitude: posicion.latitude, longitude: posicion.longitude })
                    .then((res) => console.log('posicion actualizada'));
            }
        });*/
    }
}
