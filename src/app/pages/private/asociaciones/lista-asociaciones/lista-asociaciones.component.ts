import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Asociacion } from 'src/app/shared/models/asociacion.model';
import { AsociacionesService } from 'src/app/shared/services/asociaciones.service';
import { FormularioAsociacionComponent } from '../formulario-asociacion/formulario-asociacion.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, filter } from 'rxjs';
import {
    Cuis,
    DatosFacturacion,
    SucursalPuntoDatosFacturacion,
} from 'src/app/shared/models/datos-facturacion.model';
import { ActivarTipoEmisionComponent } from 'src/app/components/activar-tipo-emision/activar-tipo-emision.component';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { PuntosService } from 'src/app/shared/services/puntos.service';
import { PuntoVenta } from 'src/app/shared/models/punto.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { Router } from '@angular/router';
import { ActividadProductoSin } from 'src/app/shared/models/actividad-sfe.model';
import { FilesService } from 'src/app/shared/helpers/files.service';

@Component({
    selector: 'app-lista-asociaciones',
    templateUrl: './lista-asociaciones.component.html',
    styleUrls: ['./lista-asociaciones.component.scss'],
    providers: [DialogService],
})
export class ListaAsociacionesComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Asociacion[];
    itemDialog!: boolean;
    blockedPanel: boolean = false;
    listaDatosFacturacion: SucursalPuntoDatosFacturacion[] = [];

    itemsMenu!: MenuItem[];
    asociacionSeleccionada!: Asociacion;
    listaEmpresas: Empresa[] = [];
    nitEmpresa!: number;

    itemsMenuDatosFacturacion!: MenuItem[];
    datosFacturacionSeleccionada!: SucursalPuntoDatosFacturacion;
    constructor(
        private asociacionesService: AsociacionesService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private facturaService: FacturasService,
        private empresasService: EmpresasService,
        private helperService: HelperService,
        private puntosService: PuntosService,
        private sessionService: SessionService,
        private router: Router,
        private fileService: FilesService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.isSuperAdmin() || !this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.itemsMenu = [
            {
                label: 'Opciones Asociación',
                items: [
                    {
                        label: '1. Iniciar Sistema',
                        command: () => {
                            this.optAsoIniciarSistema();
                        },
                    },
                    {
                        label: '2. Obtener Parametricas Propias',
                        command: () => {
                            this.optAsoSincronizarParametricasAsociacion();
                        },
                    },
                    {
                        label: '3. Sincronizar todas las parametricas',
                        command: () => {
                            this.optAsoSincronizarParametricas();
                        },
                    },
                    {
                        label: '4. Descargar Actividades Sin',
                        command: () => {
                            this.optAsoDescargarActividadesProductosSin();
                        },
                    },
                ],
            },
        ];

        this.itemsMenuDatosFacturacion = [
            {
                label: 'Opciones Facturacion',
                items: [
                    {
                        label: '0. Iniciar Cuis Sucursal',
                        icon: 'pi pi-building',
                        command: () => {
                            this.optFacObtenerCuis(true);
                        },
                    },
                    {
                        label: '1. Sincronizar Sucursal-Puntos',
                        icon: 'pi pi-sync',
                        command: () => {
                            this.optFacSucursalPuntosSincronizar();
                        },
                    },
                    {
                        label: '2. Registrar Nuevo Punto',
                        icon: 'pi pi-cloud-upload',
                        command: () => {
                            this.optFacPuntoVentaRegistrar();
                        },
                    },
                    {
                        label: '3. Obtener Cuis',
                        icon: 'pi pi-bolt',
                        command: () => {
                            this.optFacObtenerCuis(false);
                        },
                    },
                    {
                        label: 'Cerrar Punto',
                        icon: 'pi pi-times',
                        command: () => {
                            this.optFacPuntoVentaCerrar();
                        },
                    },
                ],
            },
        ];

        this.empresasService.get().subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
                this.nitEmpresa =
                    this.sessionService.getSessionUserData().empresaNit;
                this.loadData();
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            this.listaDatosFacturacion = [];
            return;
        }

        this.loadData();
    }

    loadData(): void {
        this.listaDatosFacturacion = [];
        this.asociacionesService.getByNit(this.nitEmpresa).subscribe({
            next: (res) => {
                this.items = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    loadDataFacturacion(idEmpresa: number, codigoAsociacion: string): void {
        this.listaDatosFacturacion = [];
        // obtener puntos
        this.puntosService.getByIdEmpresa(idEmpresa).subscribe({
            next: (res0) => {
                const puntos: PuntoVenta[] = res0.content;
                // obtener cuises
                this.facturaService.getCuises(puntos[0].nit!).subscribe({
                    next: (res1) => {
                        const cuises: Cuis[] = res1.content;
                        // obtener datos facturacion
                        const solicitud = {
                            codigoAsociacion: codigoAsociacion,
                        };
                        this.asociacionesService
                            .getDatosFacturacion(solicitud)
                            .subscribe({
                                next: (res2) => {
                                    const listaFacturacion: DatosFacturacion[] = res2.content;
                                    puntos.forEach((punto) => {
                                        const cuis = cuises.find((x) =>
                                                x.codigoAsociacion === codigoAsociacion &&
                                                x.sucursal === punto.numeroSucursal &&
                                                x.puntoVenta ===punto.numeroPuntoVenta
                                        );
                                        const cufd = listaFacturacion.find((x) =>
                                                x.codigoAsociacion === codigoAsociacion &&
                                                x.sucursal ===  punto.numeroSucursal &&
                                                x.puntoVenta === punto.numeroPuntoVenta
                                        )
                                        const item: SucursalPuntoDatosFacturacion =
                                            {
                                                codigoAsociacion:codigoAsociacion,
                                                idEmpresa: punto.idEmpresa,
                                                nit: punto.nit!,
                                                idPuntoVenta: punto.id,
                                                sucursal:  punto.numeroSucursal,
                                                puntoVenta: punto.numeroPuntoVenta,
                                                nombre: punto.nombre,
                                                tipoPuntoVenta: punto.tipoPuntoVenta!,
                                                sincronizado: punto.sincronizado!,
                                                cuis: cuis?.cuis,
                                                fechaVigenciaCuis: cuis?.fechaVigencia,
                                                cufd: cufd?.cufd,
                                                fechaVigenciaCufd: cufd?.fechaVigencia,
                                                tipoEmision: cufd?.tipoEmision,
                                            };
                                        this.listaDatosFacturacion.push(item);
                                    });
                                },
                                error: (err) => {
                                    this.informationService.showError(
                                        err.error.message
                                    );
                                },
                            });
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioAsociacionComponent, {
            header: 'Nuevo',
            width: '80%',
            data: {},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Asociacion) {
        const ref = this.dialogService.open(FormularioAsociacionComponent, {
            header: 'Actualizar',
            width: '80%',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj) => obj.id == res.id);
                this.items[objIndex] = res;
            }
        });
    }

    deleteItem(item: Asociacion) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar el registro seleccionado?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.asociacionesService.delete(item).subscribe({
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

    opcionesDatosFacturacion(
        menu: any,
        event: any,
        item: SucursalPuntoDatosFacturacion
    ) {
        this.datosFacturacionSeleccionada = item;
        menu.toggle(event);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    opcionesAsociacion(menu: any, event: any, item: Asociacion) {
        this.asociacionSeleccionada = item;
        menu.toggle(event);
    }

    optAsoIniciarSistema() {
        this.blockedPanel = true;
        const request = {
            codigoAsociacion: this.asociacionSeleccionada.codigoAsociacion,
            sucursal: 0,
            //sucursal: this.sessionService.getSessionUserData().numeroSucursal,
            puntoVenta: 0,
        };
        this.facturaService.getCuis(request).subscribe({
            next: (res) => {
                this.informationService.showSuccess(
                    res.message +
                        '\n' +
                        this.helperService.jsonToString(res.content)
                );
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    optAsoSincronizarParametricasAsociacion() {
        this.blockedPanel = true;
        const request = {
            codigoAsociacion: this.asociacionSeleccionada.codigoAsociacion,
            sucursal: 0,
            //sucursal: this.sessionService.getSessionUserData().numeroSucursal,
            persistir: true,
        };
        this.facturaService
            .sincronizeParametricasAsociacion(request)
            .subscribe({
                next: (res) => {
                    this.informationService.showSuccess(res.message);
                    this.blockedPanel = false;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.blockedPanel = false;
                },
            });
    }

    optAsoSincronizarParametricas() {
        this.blockedPanel = true;
        const request = {
            codigoAsociacion: this.asociacionSeleccionada.codigoAsociacion,
            PuntoVenta: 0,
            persistir: true,
        };
        this.facturaService.sincronizeParametricas(request).subscribe({
            next: (res) => {
                this.informationService.showSuccess(res.message);
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    optAsoDescargarActividadesProductosSin() {
        this.blockedPanel = true;
        this.asociacionesService.getActividadesProductosByNit(this.nitEmpresa).subscribe({
            next: (res) => {
                console.log(res.content);
                const listaActividades : ActividadProductoSin[] = res.content;
                import('xlsx').then((xlsx) => {
                    var datos = listaActividades.map((x, index) => ({
                        codigoActividadSin: x.codigoActividadSin,
                        actividad: x.actividad,
                        codigoProductoSin: x.codigoProductoSin,
                        producto: x.producto,
                    }));

                    const header = Object.keys(listaActividades[0]); // columns name
                    let wscols = [];
                    for (var i = 0; i < header.length; i++) {  // columns length added
                        wscols.push({ wch: header[i].length + 5 })
                    }

                    let worksheet = xlsx.utils.json_to_sheet(datos);
                    worksheet["!cols"] = wscols;

                    const workbook = {
                        Sheets: { data: worksheet },
                        SheetNames: ['data'],
                    };
                    const excelBuffer: any = xlsx.write(workbook, {
                        bookType: 'xlsx',
                        type: 'array',
                    });
                    this.fileService.saveAsExcelFile(excelBuffer, 'actividades-productos-sin');
                    this.blockedPanel = false;
                });

            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    onRowSelect(event: any) {
        this.loadDataFacturacion(
            event.data.idEmpresa,
            event.data.codigoAsociacion
        );
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    // datos facturacion
    optFacChangeTipoEmision(item: SucursalPuntoDatosFacturacion) {
        if (!item.cufd) {
            this.informationService.showWarning('No existe un cufd generado para el cambio de tipo emisión');
            return;
        }
        const ref = this.dialogService.open(ActivarTipoEmisionComponent, {
            header: 'Cambiar Tipo Emisión',
            width: '400px',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.listaDatosFacturacion.findIndex((obj) => obj.idPuntoVenta == item.idPuntoVenta);
                this.listaDatosFacturacion[objIndex].tipoEmision = res.tipoEmision;
            }
        });
    }

    optFacSendMasivos(item: SucursalPuntoDatosFacturacion) {
        if (!item.cufd) {
            this.informationService.showWarning('No existe un cufd generado para el envio');
            return;
        }
        this.blockedPanel = true;
        const request = {
            codigoAsociacion: item.codigoAsociacion,
            sucursal: item.sucursal,
            puntoVenta: item.puntoVenta,
        };
        this.facturaService.sendMasivo(request).subscribe({
            next: (res) => {
                this.informationService.showSuccess(res.message);
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    optFacGetCufd(item: SucursalPuntoDatosFacturacion) {
        if (!item.sincronizado) {
            this.informationService.showWarning('El punto de venta no está sincronizado');
            return;
        }

        if (!item.cuis) {
            this.informationService.showWarning('No existe Cuis para la generación del cufd');
            return;
        }
        this.blockedPanel = true;
        const request = {
            codigoAsociacion: item.codigoAsociacion,
            sucursal: item.sucursal,
            puntoVenta: item.puntoVenta,
            generar: true,
        };
        this.facturaService.getCufd(request).subscribe({
            next: (res) => {
                this.informationService.showSuccess(res.message);
                let objIndex = this.listaDatosFacturacion.findIndex((obj) => obj.idPuntoVenta == item.idPuntoVenta);
                this.listaDatosFacturacion[objIndex].cufd = res.content.codigo;
                this.listaDatosFacturacion[objIndex].fechaVigenciaCufd = res.content.fechaVigencia;
                this.listaDatosFacturacion[objIndex].tipoEmision = this.listaDatosFacturacion[objIndex].tipoEmision?? 'EN LINEA'
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    optFacSucursalPuntosSincronizar() {
        this.confirmationService.confirm({
            message:
                'Esta seguro de sincronizar los puntos de venta de la sucursal ' +
                this.datosFacturacionSeleccionada.sucursal +
                ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const request = {
                    codigoAsociacion:
                        this.datosFacturacionSeleccionada.codigoAsociacion,
                    sucursal:
                        this.datosFacturacionSeleccionada.sucursal,
                    sincronizar: true,
                };
                this.facturaService.sincronizePuntos(request).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.loadDataFacturacion(
                            this.datosFacturacionSeleccionada.idEmpresa,
                            this.datosFacturacionSeleccionada.codigoAsociacion
                        );
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            },
        });
    }

    optFacPuntoVentaRegistrar() {
        if (this.datosFacturacionSeleccionada.sincronizado) {
            this.informationService.showInfo(
                'El punto de venta ya está sincronizado'
            );
            return;
        }

        this.confirmationService.confirm({
            message: 'Esta seguro de registrar el nuevo punto ' +this.datosFacturacionSeleccionada.puntoVenta +' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.blockedPanel = true;
                const request = {
                    codigoAsociacion: this.datosFacturacionSeleccionada.codigoAsociacion,
                    sucursal: this.datosFacturacionSeleccionada.sucursal,
                    puntoVenta: this.datosFacturacionSeleccionada.puntoVenta,
                };
                this.facturaService.sincronizarPunto(request).subscribe({
                    next: (res) => {
                        this.datosFacturacionSeleccionada.sincronizado = true
                        this.informationService.showSuccess(res.message);
                        this.blockedPanel = false;
                    },
                    error: (err) => {
                        console.log(err);
                        this.informationService.showError(err.error.message);
                        this.blockedPanel = false;
                    },
                });
            },
        });

    }

    optFacPuntoVentaCerrar() {
        if (!this.datosFacturacionSeleccionada.sincronizado) {
            this.informationService.showInfo('El punto de venta no está sincronizado');
            return;
        }

        this.blockedPanel = true;
        const request = {
            codigoAsociacion: this.datosFacturacionSeleccionada.codigoAsociacion,
            sucursal: this.datosFacturacionSeleccionada.sucursal,
            puntoVenta: this.datosFacturacionSeleccionada.puntoVenta,
        };
        this.facturaService.cerrarPunto(request).subscribe({
            next: (res) => {
                this.loadData();
                this.informationService.showSuccess(res.message);
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    optFacObtenerCuis(iniciar:boolean) {
        /*if (!this.datosFacturacionSeleccionada.sincronizado) {
            this.informationService.showInfo('El punto de venta no está sincronizado');
            return;
        }*/

        if (this.datosFacturacionSeleccionada.cuis) {
            this.informationService.showInfo('El punto de venta ya tiene CUIS');
            return;
        }

        this.blockedPanel = true;
        const request = {
            codigoAsociacion: this.datosFacturacionSeleccionada.codigoAsociacion,
            sucursal: this.datosFacturacionSeleccionada.sucursal,
            puntoVenta: iniciar ? 0 : this.datosFacturacionSeleccionada.puntoVenta,
        };
        this.facturaService.getCuis(request).subscribe({
            next: (res) => {
                this.informationService.showSuccess(
                    res.message +'\n' +this.helperService.jsonToString(res.content)
                );
                if (!iniciar){
                    this.datosFacturacionSeleccionada.cuis = res.content.codigo;
                    this.datosFacturacionSeleccionada.fechaVigenciaCuis = res.content.fechaVigencia;
                }
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    cambioTipoEmisionGlobal() {
        const ref = this.dialogService.open(ActivarTipoEmisionComponent, {
            header: 'Cambiar Tipo Emisión Global',
            width: '400px',
            data: null,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }
}
