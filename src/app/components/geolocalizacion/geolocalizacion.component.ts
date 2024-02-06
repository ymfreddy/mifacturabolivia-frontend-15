import {
    Component,
    OnInit,
    ViewChild,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import { GMap } from 'primeng/gmap';
import { sv } from 'src/app/shared/constants/sv';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { VisitaPosicion } from 'src/app/shared/models/visita.model';
import { ElementRef, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-geolocalizacion',
    templateUrl: './geolocalizacion.component.html',
    styleUrls: ['./geolocalizacion.component.scss'],
})
export class GeolocalizacionComponent implements OnInit {
    @Input() lectura!: boolean;
    @Output() puntoSeleccionado!: EventEmitter<any>;
    @Input() alto!: number;
    @ViewChild('gmap') elmap?: GMap;
    @ViewChild('searchPlace') searchField?: ElementRef;

    opcion: any;
    marcadores: any[] = [];
    dialogVisible!: boolean;
    nombreMarcador: string = 'punto-marcado';
    selectedPosition: any;
    infoWindow: any;

    constructor(private informationService: InformationService,
        private cd: ChangeDetectorRef) {
        this.puntoSeleccionado = new EventEmitter();
        this.alto=500;
    }

    ngOnInit() {
        this.opcion = {
            center: { lat: -16.498969044960674, lng: -68.1379568531729 },
            zoom: 16,
        };

        this.infoWindow = new google.maps.InfoWindow();
    }

    ngAfterViewInit(): void {
        const searchBox = new google.maps.places.SearchBox(this.searchField?.nativeElement);
        if (this.elmap?.map){
            this.elmap?.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.searchField?.nativeElement);
        }

        searchBox.addListener('places_changed', () => {
            this.cd.detectChanges();
            const places = searchBox.getPlaces();
            if (places?.length === 0) {
                return;
            }

            const bounds = new google.maps.LatLngBounds();
            places?.forEach((place) => {
                if (!place.geometry || !place.geometry.location) {
                    return;
                }
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            this.elmap?.map.fitBounds(bounds);
        });

        setTimeout(() => {
            if (this.elmap?.getMap()){
                this.getCurrentPosition(this.elmap?.getMap());
            }
        }, 300);
    }

    getCurrentPosition(map: any) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    console.log('posicion actual!!!!');
                    map.setCenter({
                        lat: Number(position.coords.latitude),
                        lng: Number(position.coords.longitude),
                    });
                },
                () => {
                    console.log('error!!!');
                }
            );
        }
    }

    eventoClic(event: any) {
        if (!this.lectura) {
            if (this.marcadores.length == 0) {
                this.dialogVisible = true;
                this.selectedPosition = event.latLng;
            } else {
                this.informationService.showInfo(
                    'Ya existe una posición marcada'
                );
            }
        }
    }

    eventoMover(event: any) {
        this.enviarPuntoSeleccionado();
    }

    eventoCentrar() {
        if (this.marcadores.length > 0) {
            const punto: google.maps.Marker = this.marcadores[0];
            this.elmap?.map.setCenter(punto.getPosition());
        }
    }

    eventoClicMarcador(event: any) {
        let isMarker = event.overlay.getTitle != undefined;
        if (isMarker) {
            console.log(event.overlay);
            let title = event.overlay.getTitle();
            this.infoWindow.setContent('' + title + '');
            this.infoWindow.open(event.map, event.overlay);
            //event.map.setCenter(event.overlay.getPosition());
            this.informationService.showInfo(title);
        } else {
            this.informationService.showInfo('Shape Selected');
        }
    }

    adicionarMarcador() {
        this.dialogVisible = false;
        this.marcarPunto(
            this.selectedPosition.lat(),
            this.selectedPosition.lng(),
            this.nombreMarcador,
            true,
            false
        );
        this.enviarPuntoSeleccionado();
    }

    marcarPunto(lat: number, lng: number, titulo: string, dragable: boolean, center:boolean) {
        console.log('punto establecido: ' + lat + ',' + lng);
        if (lat && lng) {
            this.marcadores.push(
                new google.maps.Marker({
                    position: {
                        lat: lat,
                        lng: lng,
                    },
                    title: titulo,
                    draggable: dragable,
                })
            );
            if (center){
                this.elmap?.map.setCenter({lat: lat, lng: lng,},);
            }
        }
    }

    enviarPuntoSeleccionado() {
        const punto: google.maps.Marker = this.marcadores[0];
        this.puntoSeleccionado.emit(punto.getPosition());
    }

    marcarPuntos(puntos: VisitaPosicion[]) {
        this.marcadores = [];
        puntos = puntos.filter(
            (value, index, self) =>
                index ===
                self.findIndex(
                    (t) =>
                        t.latitud === value.latitud &&
                        t.longitud === value.longitud &&
                        t.interesado === value.interesado
                )
        );
        puntos.forEach((element) => {
            if (element.latitud && element.longitud) {
                this.marcadores.push(
                    new google.maps.Marker({
                        position: {
                            lat: element.latitud,
                            lng: element.longitud,
                        },
                        title:
                            'CLIENTE: ' +
                            element.interesado +
                            ', ESTADO: ' +
                            element.estadoVisita,
                        draggable: false,
                        icon: {
                            url:
                                'assets/images/' +
                                this.getIconMarker(element.idEstadoVisita),
                        },
                    })
                );
            }
        });
    }

    getIconMarker(idEstado: number) {
        if (idEstado == sv.ESTADO_VISITA_ASIGNADA)
            return 'marcador-visita-asignada.png';
        if (idEstado == sv.ESTADO_VISITA_INICIADA)
            return 'marcador-visita-iniciada.png';
        if (idEstado == sv.ESTADO_VISITA_FINALIZADA)
            return 'marcador-visita-finalizada.png';
        if (idEstado == sv.ESTADO_VISITA_CANCELADA)
            return 'marcador-visita-cancelada.png';
        return 'marcador-visita.png';
    }
}
