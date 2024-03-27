import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { FacturaResumen } from 'src/app/shared/models/factura-resumen.model';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject, filter } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PuntoVentaResumen, Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { AnularFacturaComponent } from 'src/app/components/anular-factura/anular-factura.component';
import { ContingenciaComponent } from 'src/app/components/contingencia/contingencia.component';
import { EnvioContingenciaComponent } from 'src/app/components/envio-contingencia/envio-contingencia.component';
import { adm } from 'src/app/shared/constants/adm';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { MenuItem } from 'primeng/api';
import * as printJS from 'print-js';
import { Router } from '@angular/router';
import { BusquedaFactura, BusquedaFacturaReporte } from 'src/app/shared/models/busqueda-factura.model';
import { DatePipe } from '@angular/common';
import { WhatsappFacturaComponent } from 'src/app/components/whatsapp-factura/whatsapp-factura.component';
import { Asociacion } from 'src/app/shared/models/session-usuario.model';
import { FacturaRecepcion } from 'src/app/shared/models/factura-recepcion.model';
import { sfe } from 'src/app/shared/constants/sfe';
import { PuntoTipoEmisionComponent } from '../../../../components/punto-tipo-emision/punto-tipo-emision.component';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { BusquedaUsuario } from 'src/app/shared/models/busqueda-usuario.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { FacturaErrorComponent } from 'src/app/components/factura-error/factura-error.component';
import { EnviarWhatsappComponent } from 'src/app/components/enviar-whatsapp/enviar-whatsapp.component';
import { RevertirFacturaComponent } from 'src/app/components/revertir-factura/revertir-factura.component';
import { Estudiante } from 'src/app/shared/models/estudiante.model';
import { EstudiantesService } from 'src/app/shared/services/estudiantes.service';
import { BusquedaEstudiante } from 'src/app/shared/models/busqueda-estudiante.model';
import { map } from 'rxjs/operators';
import { BusquedaCliente } from 'src/app/shared/models/busqueda-cliente.model';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';

@Component({
    selector: 'app-lista-facturas',
    templateUrl: './lista-facturas.component.html',
    styleUrls: ['./lista-facturas.component.scss'],
    providers: [DialogService],
})
export class ListaFacturasComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    clienteBusquedaForm!: FormGroup;
    estudianteBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaFactura;
    items!: FacturaResumen[];
    listaEstadosFactura: any[] = [
        { id: '0', nombre: '* NO ENVIADO AL SIN' },
        { id: '901', nombre: 'RECEPCION PENDIENTE' },
        { id: '902', nombre: 'RECEPCION RECHAZADA' },
        { id: '903', nombre: 'RECEPCION PROCESADA' },
        { id: '904', nombre: 'RECEPCION OBSERVADA' },
        { id: '905', nombre: 'ANULACION CONFIRMADA' },
        { id: '906', nombre: 'ANULACION RECHAZADA' },
        { id: '908', nombre: 'RECEPCION VALIDADA' },
        { id: '907', nombre: 'REVERSION DE ANULACION CONFIRMADA' },
    ];

    listaSucursales: Sucursal[] = [];
    listaPuntoVenta: PuntoVentaResumen[] = [];
    listaUsuarios: Usuario[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;
    opciones!: MenuItem[];
    opcionesEstudiantes!: MenuItem[];
    opcionesClientes!: MenuItem[];
    asociaciones: MenuItem[] = [];
    facturaSeleccionada!: FacturaResumen;
    itemsMenuFactura!: MenuItem[];
    listaAsociacion: Asociacion[] = [];

    listaEmpresas: Empresa[] = [];
    nitEmpresa!:number;
    idEmpresa!:number;

    blockSpace: RegExp = /[^\s]/;
    first: number = 0;

    listaEstudiantesFiltrados: Estudiante[] = [];
    listaEstudiantesSeleccionados: Estudiante[] = [];

    listaClientesFiltrados: Cliente[] = [];

    verDescargaArchivo=false;
    constructor(
        private fb: FormBuilder,
        private facturasService: FacturasService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private sucursalesService: SucursalesService,
        private utilidadesService: UtilidadesService,
        private helperService: HelperService,
        private router: Router,
        private datepipe: DatePipe,
        private fileService:FilesService,
        private usuarioService: UsuariosService,
        private empresasService: EmpresasService,
        private estudianteService: EstudiantesService,
        private clienteService: ClientesService
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        if (this.sessionService.getBusquedaFactura() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaFactura();
        }
        this.idEmpresa = this.busquedaMemoria?.idEmpresa ?? this.sessionService.getSessionEmpresaId();
        this.nitEmpresa = this.busquedaMemoria?.nitEmisor ?? this.sessionService.getSessionEmpresaNit();

        this.cargarOpcionesFacturas();
        // cargar parametricas
        this.cargarEmpresas();
        this.cargarAsociaciones();
        this.cargarSucursales();
        this.cargarUsuarios();
        // fn cargar usuarios

        let fechaInicio = this.helperService.getDate(this.busquedaMemoria?.fechaInicio);
        let fechaFin = this.helperService.getDate(this.busquedaMemoria?.fechaFin);

        const sectorIndividual = this.listaAsociacion && this.listaAsociacion.length===1;
        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa ,
            nitEmisor: this.nitEmpresa ,
            sucursal: [
                { value: this.busquedaMemoria?.sucursal, disabled: false },
            ],
            puntoVenta: [
                { value: this.busquedaMemoria?.puntoVenta, disabled: false },
            ],
            codigosEstados: [this.busquedaMemoria?.codigosEstados
                ? this.busquedaMemoria?.codigosEstados.split(",") : null],
            usuario: [this.busquedaMemoria?.usuario],
            codigoDocumentoSector : [{value : sectorIndividual ?
                this.listaAsociacion[0].codigoDocumentoSector :
                this.busquedaMemoria?.codigoDocumentoSector, disabled: sectorIndividual}],
            fechaInicio: [fechaInicio, Validators.required],
            fechaFin: [fechaFin, Validators.required],
        });

        this.clienteBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa ,
            nitEmisor: this.nitEmpresa ,
            cliente: [null, Validators.required],
        });

        this.estudianteBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa ,
            nitEmisor: this.nitEmpresa ,
            estudiante: [null, Validators.required],
        });

        console.log(this.busquedaMemoria);
        const esAdministrador = this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_ADMIN || this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_SUPERADMIN;
        if (!esAdministrador) {this.criteriosBusquedaForm.controls['usuario'].disable();
            this.criteriosBusquedaForm.patchValue({ usuario: this.sessionService.getSessionUserData().username });
        }

        if (this.busquedaMemoria) {
            this.loadData(null);
        }
    }

    loadData(reporte:BusquedaFacturaReporte|null): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        if (!this.listaAsociacion || this.listaAsociacion.length===0 ){
            this.informationService.showWarning(
                sfe.MENSAJE_SIN_FACTURACION_ASIGANDA
            );
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
        const criterios = this.getBusquedaCriterios();
        if (reporte) {
            const criteriosReporte:any = {
                ...criterios,
                tipoReporte:reporte.tipoReporte,
            }

            if (reporte.numero==1){
                const fileName = `facturas-${this.nitEmpresa}.${reporte.tipoReporte}`;
                this.utilidadesService.getReporteFacturas(criteriosReporte).pipe(delay(1000)).subscribe((blob: Blob): void => {
                        this.fileService.printFile(blob, fileName, false);
                        this.blockedPanel = false;
                    });
            }
            if (reporte.numero==2){
                const fileName = `facturas-metodos-pago-${this.nitEmpresa}.${reporte.tipoReporte}`;
                this.utilidadesService.getReporteFacturasMetodosPago(criteriosReporte).pipe(delay(1000)).subscribe((blob: Blob): void => {
                        this.fileService.printFile(blob, fileName, false);
                        this.blockedPanel = false;
                    });
            }
        } else {
            this.facturasService
                .get(criterios)
                .subscribe({
                    next: (res) => {
                        this.sessionService.setBusquedaFactura(criterios);
                        this.first = 0;
                        this.items = res.content;
                        this.informationService.showInfo(res.message);
                        this.blockedPanel = false;
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.blockedPanel = false;
                    },
                });
        }
    }

    getBusquedaCriterios() {
        const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;
        const estados = this.criteriosBusquedaForm.controls['codigosEstados'].value;
        const criterios: BusquedaFactura = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            nitEmisor: this.criteriosBusquedaForm.controls['nitEmisor'].value,
            sucursal: this.criteriosBusquedaForm.controls['sucursal'].value,
            puntoVenta: this.criteriosBusquedaForm.controls['puntoVenta'].value,
            fechaInicio:
                this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            codigoDocumentoSector: this.criteriosBusquedaForm.controls['codigoDocumentoSector'].value,
            codigosEstados: (!estados || estados.length==0) ?'':estados.join(','),
            usuario: this.criteriosBusquedaForm.controls['usuario'].value,
            educativo: this.facturaEducativoAsignada()
        };
        return criterios;

    }

    cambiarTipoEmision() {
        if (!this.listaAsociacion || this.listaAsociacion.length===0){
            this.informationService.showWarning(sfe.MENSAJE_SIN_FACTURACION_ASIGANDA);
            return;
        }

        const ref = this.dialogService.open(PuntoTipoEmisionComponent, {
            header: 'Tipo Emisión',
            width: '80%',
            data: {},
        });
        ref.onClose.subscribe((res) => {});
    }

    contigencia() {
        const ref = this.dialogService.open(ContingenciaComponent, {
            header: 'Nueva Contingencia',
            width: '400px',
            data: {},
        });
        ref.onClose.subscribe((res) => {});
    }

    reporteFacturas(tipoArchivo:string) {
        const reporte: BusquedaFacturaReporte = {
            numero: 1,
            tipoReporte: tipoArchivo
        }
        this.loadData(reporte);
    }

    reporteFacturasMetodoPago(tipoArchivo:string) {
        const reporte: BusquedaFacturaReporte = {
            numero: 2,
            tipoReporte: tipoArchivo
        }
        this.loadData(reporte);
    }

    enviarContigencia() {
        const ref = this.dialogService.open(EnvioContingenciaComponent, {
            header: 'Envio Paquetes Contingencia',
            width: '80%',
            data: {},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData(null);
            }
        });
    }

    descargar(item: FacturaResumen, imprimir: boolean) {
        if (item.codigoEstado == sfe.ESTADO_FACTURA_RECHAZADA) {
            this.informationService.showWarning('La factura tiene estado rechazada');
            return;
        }

        this.blockedPanel = true;
        const fileName = `factura-${item.cuf}.pdf`;
        this.utilidadesService
            .getFactura(item.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, imprimir);
                this.blockedPanel = false;
            });
    }

    enviar() {
        if (this.facturaSeleccionada.codigoEstado !== sfe.ESTADO_FACTURA_PENDIENTE) {
            this.informationService.showWarning(
                'La factura no tiene estado de RECEPCION PENDIENTE'
            );
            return;
        }
        this.blockedPanel = true;
        const envio = {
            codigoAsociacion: this.facturaSeleccionada.codigoAsociacion,
            sucursal: this.facturaSeleccionada.sucursal,
            puntoVenta: this.facturaSeleccionada.puntoVenta,
        };

        this.facturasService.sendPaquete(envio).subscribe(
            (res) => {
                this.informationService.showSuccess(res.message);
                this.blockedPanel = false;
                this.loadData(null);
            },
            (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            }
        );
    }

    verify() {
        const factura: any = {
            codigoAsociacion: this.facturaSeleccionada.codigoAsociacion,
            cuf: this.facturaSeleccionada.cuf,
        };
        this.blockedPanel = true;
        this.facturasService.sendFacturaVerificacion(factura).subscribe({
            next: (res) => {
                this.informationService.showSuccess(
                    res.message +
                        '\n' +
                        this.helperService.jsonToString(res.content)
                );
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(
                    err.error.message +
                        '\n' +
                        this.helperService.jsonToString(err.error.content)
                );
                this.blockedPanel = false;
            },
        });
    }

    revertir() {
        if (this.facturaSeleccionada.codigoEstado != sfe.ESTADO_FACTURA_ANULADO) {
            this.informationService.showWarning('La factura no tiene estado anulada');
            return;
        }
        if (this.facturaSeleccionada.codigoEstado == sfe.ESTADO_FACTURA_REVERTIDA) {
            this.informationService.showWarning('La factura ya está revertida');
            return;
        }
        const ref = this.dialogService.open(RevertirFacturaComponent, {
            header: 'Revertir Anulación Factura',
            width: '500px',
            data: this.facturaSeleccionada,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData(null);
            }
        });
    }

    url() {
        window.open(this.facturaSeleccionada.url, '_blank');
    }

    whatsapp() {
        if (this.facturaSeleccionada.codigoEstado == sfe.ESTADO_FACTURA_RECHAZADA) {
            this.informationService.showWarning('La factura está rechazada');
            return;
        }

        if (this.facturaSeleccionada.codigoEstado == sfe.ESTADO_FACTURA_ANULADO) {
            this.informationService.showWarning('La factura está anulada');
            return;
        }

        /*const ref = this.dialogService.open(EnviarWhatsappComponent, {
            header: 'Enviar Factura por WhatsApp',
            width: '300px',
            data: this.facturaSeleccionada,
        });
        ref.onClose.subscribe((res) => {});*/

        const ref = this.dialogService.open(WhatsappFacturaComponent, {
            header: 'Enviar Factura por WhatsApp',
            width: '500px',
            data: this.facturaSeleccionada,
        });
        ref.onClose.subscribe((res) => {});
    }

    observaciones() {
        this.blockedPanel = true;
        this.facturasService.getErrores(this.facturaSeleccionada.id)
            .subscribe({
                next: (res) => {
                    this.blockedPanel = false;
                    if (res.content.length ===0){
                        this.informationService.showInfo('No existe observaciones');
                        return;
                    }
                    const ref = this.dialogService.open(FacturaErrorComponent, {
                        header: 'Observaciones',
                        width: '80%',
                        data: { item: this.facturaSeleccionada, lista: res.content },
                    });
                    ref.onClose.subscribe((res) => { });
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.blockedPanel = false;
                },
            });
    }

    mail() {
        if (this.facturaSeleccionada.codigoEstado == sfe.ESTADO_FACTURA_RECHAZADA) {
            this.informationService.showWarning('La factura tiene estado rechazada');
            return;
        }
        this.blockedPanel = true;
        this.utilidadesService
            .sendFacturaEmail(this.facturaSeleccionada.id)
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

    anular(item: FacturaResumen) {
        if (item.codigoEstado == sfe.ESTADO_FACTURA_RECHAZADA) {
            this.informationService.showWarning('La factura tiene estado rechazada');
            return;
        }
        if (item.codigoEstado == sfe.ESTADO_FACTURA_ANULADO) {
            this.informationService.showWarning('La factura ya está anulada');
            return;
        }
        const ref = this.dialogService.open(AnularFacturaComponent, {
            header: 'Anular Factura',
            width: '500px',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData(null);
            }
        });
    }

    public onSubmit(): void {
        this.loadData(null);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    opcionesFactura(menu: any, event: any, item: FacturaResumen) {
        this.facturaSeleccionada = item;
        menu.toggle(event);
    }

    newItem(codigoAsociacion: string) {
        const asociacionSector = this.listaAsociacion.filter(
            (x) => x.codigoAsociacion === codigoAsociacion
        )[0];
        // crear  los datos de session
        const facturaRecepcion: FacturaRecepcion = {
            asociacion: asociacionSector,
        };
        this.sessionService.setRegistroFacturaRecepcion(facturaRecepcion);
        console.log(asociacionSector);
        if (asociacionSector.codigoDocumentoSector==sfe.CODIGO_DOCUMENTO_SECTOR_ICE)
            this.router.navigate(['/adm/factura-ice-por-pasos']);
        else if (asociacionSector.codigoDocumentoSector==sfe.CODIGO_DOCUMENTO_SECTOR_VENTA_MINERAL)
            this.router.navigate(['/adm/factura-minera-por-pasos']);
        else if (asociacionSector.codigoDocumentoSector==sfe.CODIGO_DOCUMENTO_SECTOR_COMERCIALIZACION_EXPORTACION_MINERA)
            this.router.navigate(['/adm/factura-minera-por-pasos']);
        else  this.router.navigate(['/adm/factura-por-pasos']);
    }

    esVisible(): boolean {
        return (this.sessionService.getSessionUserData().idTipoUsuario !=
                adm.TIPO_USUARIO_ASESOR && this.listaAsociacion.length > 0);
    }

    getSector(codigoDocumentoSector: number) {
        if (codigoDocumentoSector == sfe.CODIGO_DOCUMENTO_SECTOR_COMPRA_VENTA)
            return 'COMPRA Y VENTA';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_HOSPITAL_CLINICA)
            return 'HOSPITALES/CLINICAS';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_ALQUILERES)
            return 'ALQUILERES';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_SEGUROS)
            return 'SEGUROS';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_HOTELES)
            return 'HOTELES';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_SERVICIOS_TURISTICOS_HOSPEDAJE)
            return 'TURISMO';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_EDUCATIVO)
            return 'EDUCATIVO';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_ICE)
            return 'ICE';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_TASA_CERO)
            return 'TASA CERO';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_VENTA_MINERAL)
            return 'VENTA MINERAL';
        if (codigoDocumentoSector ==sfe.CODIGO_DOCUMENTO_SECTOR_COMERCIALIZACION_EXPORTACION_MINERA)
            return 'EXPORTACION MINERA';
        return '-';
    }

    cargarOpcionesFacturas(){
        this.itemsMenuFactura = [
            {
                label: 'Opciones Factura',
                items: [
                    {
                        label: 'Enviar Pedientes',
                        icon: 'pi pi-cloud-upload',
                        command: () => {
                            this.enviar();
                        },
                    },
                    {
                        label: 'Verificar Estado',
                        icon: 'pi pi-check',
                        command: () => {
                            this.verify();
                        },
                    },
                    {
                        label: 'Ver en Impuestos',
                        icon: 'pi pi-link',
                        command: () => {
                            this.url();
                        },
                    },
                    {
                        label: 'Enviar WhatsApp',
                        icon: 'pi pi-whatsapp',
                        command: () => {
                            this.whatsapp();
                        },
                    },
                    {
                        label: 'Enviar Email',
                        icon: 'pi pi-send',
                        command: () => {
                            this.mail();
                        },
                    },
                    {
                        label: 'Ver Observaciones',
                        icon: 'pi pi-exclamation-circle',
                        command: () => {
                            this.observaciones();
                        },
                    },
                    {
                        label: 'Revertir Anulación',
                        icon: 'pi pi-exclamation-triangle',
                        command: () => {
                            this.revertir();
                        },
                    },
                ],
            },
        ];

        this.opciones = [
            {
                label: 'Reporte General Pdf',
                icon: 'pi pi-file-pdf',
                command: () => {
                    this.reporteFacturas('pdf');
                },
            },
            {
                label: 'Reporte Por Métodos de Pago Pdf',
                icon: 'pi pi-file-pdf',
                command: () => {
                    this.reporteFacturasMetodoPago('pdf');
                },
            },
            {
                separator:true
            },
            {
                label: 'Reporte General Excel',
                icon: 'pi pi-file-excel',
                command: () => {
                    this.reporteFacturas('xlsx');
                },
            },
            {
                label: 'Reporte Por Métodos de Pago Excel',
                icon: 'pi pi-file-excel',
                command: () => {
                    this.reporteFacturasMetodoPago('xlsx');
                },
            },
        ];

        this.opcionesEstudiantes = [
            {
                label: 'Reporte Estudiantes Pdf',
                icon: 'pi pi-file-pdf',
                command: () => {
                    this.reporteFacturasEstudiantes('pdf');
                },
            },
            {
                separator:true
            },
            {
                label: 'Reporte Estudiantes Excel',
                icon: 'pi pi-file-excel',
                command: () => {
                    this.reporteFacturasEstudiantes('xlsx');
                },
            },
        ];

        this.opcionesClientes = [
            {
                label: 'Reporte Clientes Pdf',
                icon: 'pi pi-file-pdf',
                command: () => {
                    this.reporteFacturasClientes('pdf');
                },
            },
            {
                separator:true
            },
            {
                label: 'Reporte Clientes Excel',
                icon: 'pi pi-file-excel',
                command: () => {
                    this.reporteFacturasClientes('xlsx');
                },
            },
        ];
    }

    canbioSucursal(event: any) {
        this.listaPuntoVenta = [];
        this.criteriosBusquedaForm.controls['puntoVenta'].setValue(null);
        if (event.value>=0) {
            this.listaPuntoVenta =
                this.listaSucursales.find((x) => x.numero === event.value)
                    ?.puntosVenta || [];
        }
    }

    cargarEmpresas(){
        if (this.esSuperAdm()){
            this.empresasService
            .get()
            .subscribe({
                next: (res) => {
                    this.listaEmpresas = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
        }
    }
    cargarAsociaciones(){
            this.listaAsociacion = this.sessionService.getSessionAsociaciones();
            this.listaAsociacion.forEach((element) => {
                this.asociaciones.push({
                    label: element.documentoSector,
                    command: () => {
                        this.newItem(element.codigoAsociacion);
                    },
                });
            });
    }

    cargarSucursales(){
        this.sucursalesService
        .getByIdEmpresa(this.idEmpresa)
        .subscribe({
            next: (res) => {
                this.listaSucursales = res.content;
                if (this.busquedaMemoria && this.busquedaMemoria.sucursal>=0){
                    this.listaPuntoVenta = this.listaSucursales.find((x) => x.numero === this.busquedaMemoria?.sucursal)?.puntosVenta || [];
                }
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    cargarUsuarios(){
        const busqueda: BusquedaUsuario = {
            idEmpresa: this.idEmpresa,
            resumen: true,
        };
        this.usuarioService.get(busqueda).subscribe({
            next: (res) => {
                this.listaUsuarios = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    getTotalMontoTotalSujetoIva(): number {
        if (this.items) {
            const sum = this.items
                .map((t) => t.montoTotalSujetoIva)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum,adm.NUMERO_DECIMALES);
        }

        return 0;
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.nitEmpresa = empresaAux.nit;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['nitEmisor'].setValue(empresaAux.nit);
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);

        this.criteriosBusquedaForm.controls['sucursal'].setValue(null);
        this.criteriosBusquedaForm.controls['puntoVenta'].setValue(null);
        this.criteriosBusquedaForm.controls['usuario'].setValue(null);
        this.criteriosBusquedaForm.controls['codigoDocumentoSector'].setValue(null);
        this.cargarSucursales();
        this.cargarUsuarios();
    }

    cambioEmpresa2(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.nitEmpresa = empresaAux.nit;
        this.idEmpresa = empresaAux.id;
        this.clienteBusquedaForm.controls['nitEmisor'].setValue(empresaAux.nit);
        this.clienteBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
    }

    cambioEmpresa3(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.nitEmpresa = empresaAux.nit;
        this.idEmpresa = empresaAux.id;
        this.estudianteBusquedaForm.controls['nitEmisor'].setValue(empresaAux.nit);
        this.estudianteBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
    }

    reporteFacturasEstudiantes(tipoArchivo :string) {
        const reporte: BusquedaFacturaReporte = {
            numero: 1,
            tipoReporte: tipoArchivo
        }
        this.loadDataEstudiante(reporte);
    }

    reporteFacturasClientes(tipoArchivo :string) {
        const reporte: BusquedaFacturaReporte = {
            numero: 1,
            tipoReporte: tipoArchivo
        }
        this.loadDataCliente(reporte);
    }

    loadDataEstudiante(reporte:BusquedaFacturaReporte|null): void {
        if (!this.estudianteBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        this.blockedPanel = true;

        const estudiantes: Estudiante[] = this.estudianteBusquedaForm.controls['estudiante'].value
        const criterios: any = {
            idEmpresa: this.estudianteBusquedaForm.controls['idEmpresa'].value,
            nitEmisor: this.estudianteBusquedaForm.controls['nitEmisor'].value,
            idsEstudiantes: (!estudiantes || estudiantes.length==0) ?'':estudiantes.map(x=>x.id).join(','),
            educativo: this.facturaEducativoAsignada()
        };

        console.log(criterios);
        if (reporte) {
            const criteriosReporte:any = {
                ...criterios,
                tipoReporte:reporte.tipoReporte,
            }
               const fileName = `facturas-estudiantes-${this.nitEmpresa}.${reporte.tipoReporte}`;
                this.utilidadesService.getReporteFacturasEstudiantes(criteriosReporte).pipe(delay(1000)).subscribe((blob: Blob): void => {
                        this.fileService.printFile(blob, fileName, false);
                        this.blockedPanel = false;
                    });
        } else {
            this.facturasService
                .get(criterios)
                .subscribe({
                    next: (res) => {
                        this.sessionService.setBusquedaFactura(criterios);
                        this.first = 0;
                        this.items = res.content;
                        this.informationService.showInfo(res.message);
                        this.blockedPanel = false;
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.blockedPanel = false;
                    },
                });
        }
    }

    loadDataCliente(reporte:BusquedaFacturaReporte|null): void {
        if (!this.clienteBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        if (this.clienteBusquedaForm.controls['cliente'].value==null) {
             this.informationService.showWarning('Debe introducir un cliente válido');
             return;
        }

        const cliente: Cliente = this.clienteBusquedaForm.controls['cliente'].value
        this.blockedPanel = true;
        const criterios: any = {
            idEmpresa: this.clienteBusquedaForm.controls['idEmpresa'].value,
            nitEmisor: this.clienteBusquedaForm.controls['nitEmisor'].value,
            codigoCliente: cliente.codigoCliente,
            educativo: this.facturaEducativoAsignada()
        };

        if (reporte) {
            const criteriosReporte:any = {
                ...criterios,
                tipoReporte:reporte.tipoReporte,
            }
            const fileName = `facturas-clientes-${this.nitEmpresa}.${reporte.tipoReporte}`;
            this.utilidadesService.getReporteFacturasClientes(criteriosReporte).pipe(delay(1000)).subscribe((blob: Blob): void => {
                    this.fileService.printFile(blob, fileName, false);
                    this.blockedPanel = false;
                });
        } else {
        this.facturasService
                .get(criterios)
                .subscribe({
                    next: (res) => {
                        this.sessionService.setBusquedaFactura(criterios);
                        this.items = res.content;
                        this.informationService.showInfo(res.message);
                        this.first = 0;
                        this.blockedPanel = false;
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.blockedPanel = false;
                    },
                });
        }
    }

    filtrarEstudiante(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarEstudiante(query);
    }

    buscarEstudiante(termino: string) {
        const criteriosBusqueda: BusquedaEstudiante = {
            idEmpresa: this.idEmpresa,
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
        };

        this.estudianteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaEstudiantesFiltrados = [];
                    return;
                }
                //const estudiantes = res.content.map((x: any) => {return  x.nombreCompleto });
                this.listaEstudiantesFiltrados = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    seleccionarEstudiante(event: any) {
        console.log('SELECT');
        if (this.listaEstudiantesSeleccionados.filter(x=>x.id===event.id).length==0){
            this.listaEstudiantesSeleccionados.push(event);
            this.estudianteBusquedaForm.patchValue({ estudiante: this.listaEstudiantesSeleccionados });
        }
    }

    limpiarEstudiante(event: any) {
        console.log('UNSELECT');
        const existe = this.listaEstudiantesSeleccionados.find(x=>x.id===event.id);

        if (existe){
            this.listaEstudiantesSeleccionados=this.listaEstudiantesSeleccionados.filter(x=>x.id!==existe.id);
            this.estudianteBusquedaForm.patchValue({ estudiante: this.listaEstudiantesSeleccionados });
        }
    }

    facturaEducativoAsignada(){
        return this.sessionService.getFacturaEducativoAsignada();
    }

    filtrarCliente(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarCliente(query);
    }

    buscarCliente(termino: string) {
        const criteriosBusqueda: BusquedaCliente = {
            idEmpresa: this.idEmpresa,
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
        };

        this.clienteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaClientesFiltrados = [];
                    return;
                }
                this.listaClientesFiltrados = res.content;
                console.log(this.listaClientesFiltrados);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    seleccionarCliente(event: any) {
        console.log(event);
        //this.clienteBusquedaForm.patchValue({ codigoCliente: event?.codigoCliente });
    }

    limpiarCliente() {
        this.clienteBusquedaForm.patchValue({ cliente: null });
    }

    decargarPdf(){}
    decargarExcel(){}
}
