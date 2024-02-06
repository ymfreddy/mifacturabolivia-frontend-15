import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { GMap } from 'primeng/gmap';
import { adm } from 'src/app/shared/constants/adm';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { BusquedaUsuario } from 'src/app/shared/models/busqueda-usuario.model';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { MapasService } from 'src/app/shared/services/mapas.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { SessionService } from '../../shared/security/session.service';
import { style } from '@angular/animations';

@Component({
  selector: 'app-seguimiento-mapa',
  templateUrl: './seguimiento-mapa.component.html',
  styleUrls: ['./seguimiento-mapa.component.scss']
})
export class SeguimientoMapaComponent implements OnInit {
  @Input() lectura!: boolean;
  @ViewChild('gmap') elmap?: GMap;
  @ViewChild('searchPlace') searchField?: ElementRef;

  idUsuarioSeleccionado!: number;

  options: any;
  marcadores: any[] = [];
  dialogVisible!: boolean;
  markerTitle!: string;
  selectedPosition: any;
  infoWindow: any;
  draggable!: boolean;

  listaUsuarios: Usuario[] = [];

  constructor(
      private informationService: InformationService,
      private sessionService: SessionService,
      private mapasService:MapasService,
      private usuarioService:UsuariosService
  ) {
      this.mapasService.obtenerPosiciones().subscribe((data)=>{
          this.verPosiciones(data);
      });
  }

  ngOnInit() {
      const busqueda: BusquedaUsuario ={
          idEmpresa: this.sessionService.getSessionEmpresaId(),
          resumen:true,
          idTipoUsuario:adm.TIPO_USUARIO_ASESOR
      };
      this.usuarioService.get(busqueda)
          .subscribe({
              next: (res) => {
                  this.listaUsuarios = res.content;
              },
              error: (err) => {
                  this.informationService.showError(err.error.message);
              },
          });

      this.options = { center: { lat: -16.498969044960674, lng: -68.1379568531729 },  zoom: 16, };
      this.infoWindow = new google.maps.InfoWindow();
  }

  ngAfterViewInit(): void {
    const searchBox = new google.maps.places.SearchBox(this.searchField?.nativeElement);
    if (this.elmap?.map){
        this.elmap?.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.searchField?.nativeElement);
    }

    searchBox.addListener('places_changed', () => {
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
          console.log(bounds);
      });
      setTimeout(() => {
        this.getCurrentPosition(this.elmap?.getMap());
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

  handleMapClick(event: any) {
      if (!this.lectura) {
          this.markerTitle =
              this.sessionService.getSessionUserData().username;
          this.dialogVisible = true;
          this.selectedPosition = event.latLng;
      }
  }

  handleOverlayClick(event: any) {
      let isMarker = event.overlay.getTitle != undefined;
      if (isMarker) {
          console.log(event.overlay);
          let title = event.overlay.getTitle();
          this.infoWindow.setContent('' + title + '');
          this.infoWindow.open(event.map, event.overlay);
          //event.map.setCenter(event.overlay.getPosition());
          this.informationService.showInfo('Asesor: '+title);
      } else {
          this.informationService.showInfo('Shape Selected');
      }
  }

  addMarker() {
      /*this.dialogVisible = false;
      const punto: Posicion = {
          user: this.markerTitle,
          nit: this.sessionService.getSessionUserData().empresaNit,
          date: new Date().getTime(),
          latitude: this.selectedPosition.lat(),
          longitude: this.selectedPosition.lng(),
      };
      this.mapasService.registrarPosicion(punto);*/
  }

  handleDragEnd(event: any) {
      //this.informationService.showInfo('Marker Dragged');
  }

  verPosiciones(operadores: any) {
    console.log(operadores);
      if (this.elmap && this.elmap.getMap()) {
          this.marcadores = [];
          operadores.forEach((element: any) => {
              this.marcadores.push(
                  new google.maps.Marker({
                      position: { lat: element.latitude, lng: element.longitude },
                      title: element.user,
                      draggable: false,

                      icon: {
                         url: "assets/images/marcador-asesor.png",
                         origin: new google.maps.Point(0, 0),
                         labelOrigin: new google.maps.Point(18,-10)
                       },
                      label: {
                        text: element.user,
                        color: "red",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }
                  })
              );
          });
      }
  }

  search(map: any) {
      if (!this.idUsuarioSeleccionado){
          this.informationService.showInfo('Debe seleccionar un asesor');
          return;
      }

      const usuario = this.listaUsuarios.find(x=>x.id==this.idUsuarioSeleccionado);
      console.log(usuario?.username);
      const existe = this.marcadores.filter((x:google.maps.Marker)=>x.getTitle()==usuario?.username);
      if(!existe || existe.length==0){
          this.informationService.showInfo('No existe la posición del asesor :'+ usuario?.nombreCompleto);
          return;
      }

      map.setZoom(16);
      console.log(existe[0].position);
      map.setCenter(existe[0].position);
  }

  zoomIn(map: any) {
      map.setZoom(map.getZoom() + 1);
  }

  zoomOut(map: any) {
      map.setZoom(map.getZoom() - 1);
  }

  clear() {
      this.marcadores = [];
  }
}
