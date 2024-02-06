import { Component, OnInit, ViewChild } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Visita, VisitaPosicion } from 'src/app/shared/models/visita.model';
import { VisitasService } from 'src/app/shared/services/visitas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { BusquedaVisita } from 'src/app/shared/models/busqueda-visita.model';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { HelperService } from '../../../../shared/helpers/helper.service';
import { sv } from 'src/app/shared/constants/sv';
import { Interesado } from 'src/app/shared/models/interesado.model';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { BusquedaUsuario } from 'src/app/shared/models/busqueda-usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { BusquedaInteresado } from 'src/app/shared/models/busqueda-interesado.model';
import { InteresadosService } from 'src/app/shared/services/interesados.service';
import { CancelarVisitaComponent } from '../../../../components/cancelar-visita/cancelar-visita.component';
import { DetalleVisitaComponent } from '../../../../components/detalle-visita/detalle-visita.component';
import { GeolocalizacionComponent } from 'src/app/components/geolocalizacion/geolocalizacion.component';

@Component({
    selector: 'app-lista-visitas',
    templateUrl: './lista-visitas.component.html',
    styleUrls: ['./lista-visitas.component.scss'],
})
export class ListaVisitasComponent implements OnInit {
    @ViewChild(GeolocalizacionComponent) child!:GeolocalizacionComponent;
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaVisita;

    items!: Visita[];
    listaEstadosVisita: Parametrica[] = [];
    listaUsuarios: Usuario[] = [];
    listaInteresados: Interesado[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    visitaSeleccionada!: Visita;
    itemsMenuFactura!: MenuItem[];
    itemsMenuVisita!: MenuItem[];
    constructor(
        private fb: FormBuilder,
        private visitasService: VisitasService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private interesadosService: InteresadosService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private datepipe: DatePipe,
        private usuarioService: UsuariosService,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        this.itemsMenuVisita = [
            {
                label: 'Opciones Visita',
                items: [
                    {
                        label: 'Iniciar',
                        icon: 'pi pi-play',
                        command: () => {
                            this.opcionVisitaIniciar();
                        },
                    },
                    {
                        label: 'Finalizar',
                        icon: 'pi pi-check-circle',
                        command: () => {
                            this.opcionVisitaFinalizar();
                        },
                    },
                    {
                        label: 'Cancelar',
                        icon: 'pi pi-times-circle',
                        command: () => {
                            this.opcionVisitaCancelar();
                        },
                    },
                    {
                        label: 'Ver Detalle',
                        icon: 'pi pi-list',
                        command: () => {
                            this.opcionVisitaDetalle();
                        },
                    },
                ],
            },
        ];

        if (this.sessionService.getBusquedaVisita() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaVisita();
        }

        const busqueda: BusquedaUsuario = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            resumen: true,
            idTipoUsuario: adm.TIPO_USUARIO_ASESOR,
        };
        this.usuarioService.get(busqueda).subscribe({
            next: (res) => {
                this.listaUsuarios = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        const busqueda2: BusquedaInteresado = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            resumen: true,
        };
        /*this.interesadosService.get(busqueda2).subscribe({
            next: (res) => {
                this.listaInteresados = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });*/

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.ESTADO_VISITA)
            .subscribe((data) => {
                this.listaEstadosVisita = data as unknown as Parametrica[];
            });

        let fechaInicio = this.helperService.getDate(
            this.busquedaMemoria?.fechaInicio
        );
        let fechaFin = this.helperService.getDate(
            this.busquedaMemoria?.fechaFin
        );

        const esAsesor =
            this.sessionService.getSessionUserData().idTipoUsuario ==
            adm.TIPO_USUARIO_ASESOR;

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: [this.sessionService.getSessionEmpresaId()],
            idEstadoVisita: [this.busquedaMemoria?.idEstadoVisita],
            idUsuario: [
                {
                    value: esAsesor
                        ? this.sessionService.getSessionUserData().id
                        : this.busquedaMemoria?.idUsuario,
                    disabled: esAsesor,
                },
            ],
            idInteresado: [this.busquedaMemoria?.idInteresado],
            fechaInicio: [fechaInicio, Validators.required],
            fechaFin: [fechaFin, Validators.required],
        });

        if (this.busquedaMemoria) {
            this.loadData();
        }
    }

    loadData(): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        // validar rango fecha
        if (
            this.criteriosBusquedaForm.controls['fechaFin'].value.getTime() -
                this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() <
            0
        ) {
            this.informationService.showWarning(
                'La fecha inicio no debe ser menor a la fecha fin'
            );
            return;
        }

        const dias = Math.round(
            Math.abs(
                (this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() -
                    this.criteriosBusquedaForm.controls[
                        'fechaFin'
                    ].value.getTime()) /
                    adm.UN_DIA
            )
        );
        if (dias > 31) {
            this.informationService.showWarning(
                'El rango de fechas debe ser menor o igual a 31 días'
            );
            return;
        }

        this.blockedPanel = true;
        const criterios: BusquedaVisita = {
            ...this.criteriosBusquedaForm.value,
            idUsuario: this.criteriosBusquedaForm.controls['idUsuario'].value,
        };
        this.visitasService.get(criterios).subscribe({
            next: (res) => {
                this.adicionarBusquedaMemoria();
                this.items = res.content;
                this.marcarPosicionesClientes();
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }


    marcarPosicionesClientes(){
        const puntos: VisitaPosicion[] = this.items.map((x) => {
            return { latitud: x.latitud, longitud: x.longitud, interesado:x.interesado, idEstadoVisita:x.idEstadoVisita, estadoVisita:x.estadoVisita };
          });
        this.child.marcarPuntos(puntos);
    }

    adicionarBusquedaMemoria() {
        const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;
        const criterios: BusquedaVisita = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idUsuario: this.criteriosBusquedaForm.controls['idUsuario'].value,
            idInteresado:
                this.criteriosBusquedaForm.controls['idInteresado'].value,
            fechaInicio:
                this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            idEstadoVisita:
                this.criteriosBusquedaForm.controls['idEstadoVisita'].value,
        };
        this.sessionService.setBusquedaVisita(criterios);
    }

    newItem() {
        this.router.navigate(['/adm/asignacion-visita']);
    }

    esEditable(idEstado: number) {
        return idEstado == sv.ESTADO_VISITA_ASIGNADA;
    }

    editItem(item: Visita) {
        /*this.visitasService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
                this.sessionService.setRegistroVisita(item);
                this.router.navigate(['/adm/visita-por-pasos']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });*/
    }

    deleteItem(item: Visita) {
        this.confirmationService.confirm({
            message:
                'Esta seguro de eliminar la visita de ' +
                item.interesado +
                ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.visitasService.delete(item).subscribe({
                    next: (res) => {
                        this.items = this.items.filter((x) => x.id !== item.id);
                        this.informationService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            },
        });
    }

    opcionVisitaIniciar() {
        if (
            this.visitaSeleccionada.idEstadoVisita != sv.ESTADO_VISITA_ASIGNADA
        ) {
            this.informationService.showWarning(
                'Solo puede iniciar visitas asignadas'
            );
            return;
        }
        this.confirmationService.confirm({
            message:
                'Esta seguro de iniciar la visita a ' +
                this.visitaSeleccionada?.interesado +
                ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.visitasService.init(this.visitaSeleccionada).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.loadData();
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            },
        });
    }

    opcionVisitaDetalle() {
        if (
            this.visitaSeleccionada.idEstadoVisita !=
                sv.ESTADO_VISITA_FINALIZADA
        ) {
            this.informationService.showInfo(
                'Solo puede ver el detalle de visitas finalizadas'
            );
            return;
        }
        //obtener detalle visita
        this.visitasService.getDetail(this.visitaSeleccionada.id).subscribe({
            next: (res) => {
                this.visitaSeleccionada.detalle = res.content;
                const ref = this.dialogService.open(DetalleVisitaComponent, {
                    header: 'Detalle visita '+this.visitaSeleccionada.interesado,
                    width: '500px',
                    data: this.visitaSeleccionada,
                });
                ref.onClose.subscribe((res) => {});
            },
            error: (err) => {
                console.log(err);
                this.informationService.showError(err.error.message);
            },
        });
    }

    opcionVisitaFinalizar() {
        if (
            this.visitaSeleccionada.idEstadoVisita != sv.ESTADO_VISITA_INICIADA
        ) {
            this.informationService.showWarning(
                'Solo puede finalizar visitas iniciadas'
            );
            return;
        }
        //obtener detalle visita
        this.visitasService.getDetail(this.visitaSeleccionada.id).subscribe({
            next: (res) => {
                this.visitaSeleccionada.detalle = res.content;
                const ref = this.dialogService.open(DetalleVisitaComponent, {
                    header: 'Detalle visita '+this.visitaSeleccionada.interesado,
                    width: '500px',
                    data: this.visitaSeleccionada,
                });
                ref.onClose.subscribe((res) => {if (res){this.loadData();}});
            },
            error: (err) => {
                console.log(err);
                const ref = this.dialogService.open(DetalleVisitaComponent, {
                    header: 'Detalle visita '+this.visitaSeleccionada.interesado,
                    width: '500px',
                    data: this.visitaSeleccionada,
                });
                ref.onClose.subscribe((res) => {if (res){this.loadData();}});
            },
        });
    }

    opcionVisitaCancelar() {
        if (
            this.visitaSeleccionada.idEstadoVisita != sv.ESTADO_VISITA_ASIGNADA
        ) {
            this.informationService.showWarning(
                'Solo puede cancelar visitas asignadas'
            );
            return;
        }
        const ref = this.dialogService.open(CancelarVisitaComponent, {
            header: 'Cancelar Visita',
            width: '500px',
            data: this.visitaSeleccionada,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    public onSubmit(): void {
        this.loadData();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    getClaseEstado(idEstado: number) {
        if (idEstado == sv.ESTADO_VISITA_ASIGNADA)
            return 'mr-2 visita-asignada';
        if (idEstado == sv.ESTADO_VISITA_INICIADA)
            return 'mr-2 visita-iniciada';
        if (idEstado == sv.ESTADO_VISITA_FINALIZADA)
            return 'mr-2 visita-finalizada';
        if (idEstado == sv.ESTADO_VISITA_CANCELADA)
            return 'mr-2 visita-cancelada';
        return 'mr-2 ';
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    opcionesVisita(menu: any, event: any, item: Visita) {
        this.visitaSeleccionada = item;
        menu.toggle(event);
    }

    handleChange(e:any) {
        var index = e.index;
        if (index==1){
            setTimeout(() => {
                this.child.eventoCentrar();
            }, 500);
        }
    }
}
