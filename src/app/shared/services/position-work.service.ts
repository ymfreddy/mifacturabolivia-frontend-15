import { ApplicationRef, Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { concat, first, interval } from 'rxjs';
import { InformationService } from '../helpers/information.service';
import { Posicion } from '../models/posicion.model';
import { SessionService } from '../security/session.service';

@Injectable({
    providedIn: 'root',
})
export class PositionWorkService {
    itemsCollection!: AngularFirestoreCollection<Posicion>;
    constructor(private appRef: ApplicationRef, private sessionService: SessionService,   private firestore: AngularFirestore,private informationService: InformationService) {

        const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
        const everyTenSecond$ = interval(10 * 1000);
        const everyTenSecondOnceAppIsStable$ = concat(
            appIsStable$,
            everyTenSecond$
        );

        everyTenSecondOnceAppIsStable$.subscribe(async () => {
            try {
                console.log('iniciar geolocalizacion');
                this.getCurrentPosition();
            } catch (err) {
                console.error('Failed to get position:', err);
            }
        });
    }

    getCurrentPosition() {
        console.log('service worker : '+this.sessionService.getGps());
        if (this.sessionService.getGps()) {
            if (!navigator.geolocation) {
                this.informationService.showWarning('Permiso gps denegado');
                return;
            }
            /*const options = {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 3000,
            };*/

            // verificar si existe en la colleccion
            if (!this.itemsCollection){
                this.cargarPosiciones();
                console.log('carga posiciones');
            }


            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    console.log(
                        'lat: ' +
                            position.coords.latitude +
                            ', lgt: ' +
                            position.coords.longitude
                    );
                    const punto: Posicion = {
                        usuario:
                            this.sessionService.getSessionUserData().username,
                        nit: this.sessionService.getSessionUserData()
                            .empresaNit,
                        fecha: new Date().getTime(),
                        lat: position.coords.latitude,
                        lgt: position.coords.longitude,
                    };
                    this.registrarPosicion(punto);
                },
                (error: any) => {
                    console.log(
                        'error gps: ' + JSON.stringify(error).toString()
                    );
                    this.informationService.showError(
                        'Error al establecer su posición'
                    );
                }
                //,options
            );
        }
    }


    cargarPosiciones(){
        this.itemsCollection = this.firestore.collection(
            'positions',
            (ref) =>
                ref.where(
                    'nit',
                    '==',
                    this.sessionService.getSessionUserData().empresaNit
                ).where('usuario',
                '==',
                this.sessionService.getSessionUserData().username)
        );
    }


    registrarPosicion(posicion: Posicion) {
        if (this.itemsCollection){
            this.itemsCollection.get().subscribe((querySnapshot) => {
                console.log('Total users: ', querySnapshot.size);
                let existeId;
                querySnapshot.forEach((documentSnapshot) => {
                    if (
                        documentSnapshot.data().usuario == posicion.usuario &&
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
                        .update({ lat: posicion.lat, lgt: posicion.lgt })
                        .then((res) => console.log('posicion actualizada'));
                }
            });
        }
    }
}
