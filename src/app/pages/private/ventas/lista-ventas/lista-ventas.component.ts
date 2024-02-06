import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { VentaFacturaResumen, Venta } from 'src/app/shared/models/venta.model';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { BusquedaVenta } from 'src/app/shared/models/busqueda-venta.model';
import { DatePipe } from '@angular/common';
import { spv } from 'src/app/shared/constants/spv';
import { adm } from 'src/app/shared/constants/adm';
import { AnularFacturaComponent } from 'src/app/components/anular-factura/anular-factura.component';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { EmitirFacturaComponent } from 'src/app/components/emitir-factura/emitir-factura.component';
import { sfe } from 'src/app/shared/constants/sfe';
import { HelperService } from '../../../../shared/helpers/helper.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { BusquedaUsuario } from 'src/app/shared/models/busqueda-usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { VentaDetalleComponent } from 'src/app/components/venta-detalle/venta-detalle.component';
import { WhatsappFacturaComponent } from 'src/app/components/whatsapp-factura/whatsapp-factura.component';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';


@Component({
    selector: 'app-lista-ventas',
    templateUrl: './lista-ventas.component.html',
    styleUrls: ['./lista-ventas.component.scss'],
    providers: [DialogService],
})
export class ListaVentasComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaVenta;

    items!: Venta[];
    listaEstadosVenta: any[] = [];
    listaTiposVenta: any[] = [];
    listaSucursales: Sucursal[] = [];
    listaUsuarios: Usuario[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    ventaSeleccionada!: Venta;
    itemsMenuFactura!: MenuItem[];
    itemsMenuVenta!: MenuItem[];

    opciones!: MenuItem[];

    listaEmpresas: Empresa[] = [];
    nitEmpresa!:number;
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        private ventasService: VentasService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private datepipe: DatePipe,
        private utilidadesService: UtilidadesService,
        private helperService: HelperService,
        private fileService:FilesService,
        private usuarioService: UsuariosService,
        private empresasService: EmpresasService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        if (this.sessionService.getBusquedaVenta() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaVenta();
        }

        this.idEmpresa = this.busquedaMemoria?.idEmpresa ?? this.sessionService.getSessionEmpresaId();
        this.nitEmpresa = this.busquedaMemoria?.nitEmpresa ?? this.sessionService.getSessionEmpresaNit();

        this.cargarOpcionesVentas();
        // cargar parametricas
        this.cargarEmpresas();
        this.cargarSucursales();
        this.cargarUsuarios();
        this.cargarParametricas();


        // fn cargar usuarios
        let fechaInicio = this.helperService.getDate(this.busquedaMemoria?.fechaInicio);
        let fechaFin = this.helperService.getDate(this.busquedaMemoria?.fechaFin);

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            nitEmpresa: this.nitEmpresa,
            idSucursal: [{ value: this.busquedaMemoria?.idSucursal??this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            idsEstadosVenta: [this.busquedaMemoria?.idsEstadosVenta
                ? this.busquedaMemoria?.idsEstadosVenta.split(",") : null],
            idsTiposVenta: [this.busquedaMemoria?.idsTiposVenta
                ? this.busquedaMemoria?.idsTiposVenta.split(",") : null],
            usuario: [this.busquedaMemoria?.usuario],
            fechaInicio: [fechaInicio, Validators.required],
            fechaFin: [fechaFin, Validators.required],
        });

        const esAdministrador = this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_ADMIN || this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_SUPERADMIN;
        if (!esAdministrador) {this.criteriosBusquedaForm.controls['usuario'].disable();
            this.criteriosBusquedaForm.patchValue({ usuario: this.sessionService.getSessionUserData().username });
        }

        if (this.busquedaMemoria) {
            this.loadData(0);
        }
    }

    cargarOpcionesVentas(){
        this.opciones = [
            {
                label: 'Reporte',
                icon: 'pi pi-file-pdf',
                command: () => {
                    this.reporteVentas();
                },
            }
        ];

        this.itemsMenuFactura = [
            {
                label: 'Opciones Factura',
                items: [
                    {
                        label: 'Descargar',
                        icon: 'pi pi-cloud-download',
                        command: () => {
                            this.opcionFacturaDescargar(false);
                        },
                    },
                    {
                        label: 'Imprimir',
                        icon: 'pi pi-print',
                        command: () => {
                            this.opcionFacturaDescargar(true);
                        },
                    },
                    {
                        label: 'Emitir',
                        icon: 'pi pi-cloud-upload',
                        command: () => {
                            this.opcionFacturaEmitir();
                        },
                    },
                    {
                        label: 'Anular',
                        icon: 'pi pi-times',
                        command: () => {
                            this.opcionFacturaAnular();
                        },
                    },
                    {
                        label: 'Enviar WhatsApp',
                        icon: 'pi pi-whatsapp',
                        command: () => {
                            this.opcionFacturaWhatsapp();
                        },
                    },
                ],
            },
        ];

        const itemsVenta : any[]=[];
        if  (this.esRestaurante()){
            itemsVenta.push(
                {
                    label: 'Imprimir Comanda',
                    icon: 'pi pi-print',
                    command: () => {
                        this.opcionVentaImprimirComanda();
                    },
                }
            );
            itemsVenta.push(
                {
                    label: 'Imprimir Cuenta',
                    icon: 'pi pi-print',
                    command: () => {
                        this.opcionVentaImprimirCuenta();
                    },
                }
            );
        }

        itemsVenta.push({
            label: 'Descargar Recibo',
            icon: 'pi pi-cloud-download',
            command: () => {
                this.opcionVentaDescargar(false);
            },
        });
        itemsVenta.push({
            label: 'Imprimir Recibo',
            icon: 'pi pi-print',
            command: () => {
                this.opcionVentaDescargar(true);
            },
        });
        itemsVenta.push({
            label: 'Devolución Venta',
            icon: 'pi pi-directions-alt',
            command: () => {
                this.opcionVentaDevolucion();
            },
        });
        itemsVenta.push({
            label: 'Detalle Venta',
            icon: 'pi pi-list',
            command: () => {
                this.opcionVentaDetalle();
            },
        });

        this.itemsMenuVenta = [
            {
                label: 'Opciones Venta',
                items: itemsVenta,
            },
        ];
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

    cargarSucursales(){
        this.sucursalesService
        .getByIdEmpresa(this.idEmpresa)
        .subscribe({
            next: (res) => {
                this.listaSucursales = res.content;
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

    cargarParametricas(){
        this.parametricasService
        .getParametricasByTipo(TipoParametrica.ESTADO_VENTA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaEstadosVenta = parametricas;
        });

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_VENTA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaTiposVenta = parametricas;
        });
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    loadData(reporte:number): void {
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
        const criterios = this.getBusquedaCriterios();

        if (reporte>0) {
            if (reporte==1){
                const fileName = `ventas-${this.nitEmpresa}.pdf`;
                this.utilidadesService.getReporteVentas(criterios).pipe(delay(1000)).subscribe((blob: Blob): void => {
                        this.fileService.printFile(blob, fileName, false);
                        this.blockedPanel = false;
                    });
            }
        }
        else {
            this.ventasService.get(criterios)
            .subscribe({
                next: (res) => {
                    this.sessionService.setBusquedaVenta(criterios);
                    this.items = res.content;
                    console.log(this.items);
                    this.blockedPanel = false;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.blockedPanel = false;
                },
            });
        }
    }

    reporteVentas() {
        this.loadData(1);
    }

    getBusquedaCriterios() {
        const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;

        const estados = this.criteriosBusquedaForm.controls['idsEstadosVenta'].value;
        const tipos = this.criteriosBusquedaForm.controls['idsTiposVenta'].value;

        const criterios: BusquedaVenta = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idSucursal: this.criteriosBusquedaForm.controls['idSucursal'].value,
            fechaInicio: this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            idsTiposVenta:(!tipos || tipos.length==0) ?'':tipos.join(','),
            idsEstadosVenta: (!estados || estados.length==0) ?'':estados.join(','),
            usuario: this.criteriosBusquedaForm.controls['usuario'].value,
        };
        return criterios;
    }

    newItem() {
        this.sessionService.setRegistroVenta(null);
        this.router.navigate(['/adm/venta-por-pasos']);
    }


    esEditable(idEstado: number) {
        return idEstado == spv.ESTADO_VENTA_PEDIDO || idEstado==spv.ESTADO_VENTA_REVERTIDA;
    }

    esNullableFactura(factura: VentaFacturaResumen) {
        return factura && factura.codigoEstado == sfe.ESTADO_FACTURA_VALIDADO;
    }

    editItem(item: Venta) {
        this.ventasService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
                this.sessionService.setRegistroVenta(item);
                this.router.navigate(['/adm/venta-por-pasos']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    opcionVentaDescargar(imprimir:boolean) {
        if (this.esEditable(this.ventaSeleccionada?.idEstadoVenta)) {
            this.informationService.showWarning('Venta no finalizada');
            return;
        }

        this.blockedPanel = true;
        const fileName = `recibo-${this.ventaSeleccionada?.correlativo}.pdf`;
        this.utilidadesService
            .getReciboVenta(this.ventaSeleccionada?.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, imprimir);
                this.blockedPanel = false;
            });
    }

    deleteItem(item: Venta) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la venta ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ventasService.delete(item).subscribe({
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

    opcionVentaDevolucion() {
        if (this.ventaSeleccionada?.idEstadoVenta!=spv.ESTADO_VENTA_COBRADA){
            this.informationService.showWarning('Solo puede realizar la devolución de ventas COBRADAS');
            return;
        }

        if (this.ventaSeleccionada?.factura  && this.ventaSeleccionada?.factura.codigoEstado!=sfe.ESTADO_FACTURA_ANULADO){
            this.informationService.showWarning('Para realizar la devolución debe anular la factura');
            return;
        }


        this.confirmationService.confirm({
            message: 'Esta seguro de realizar la devolución de la venta '+this.ventaSeleccionada?.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ventasService.devolucion(this.ventaSeleccionada).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.loadData(0);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            },
        });
    }

    opcionVentaDetalle() {
                const ref = this.dialogService.open(VentaDetalleComponent, {
                    header: 'Detalle Venta '+ this.ventaSeleccionada.correlativo,
                    width: '80%',
                    data: { item: this.ventaSeleccionada},
                });
                ref.onClose.subscribe((res) => {
                });
    }

    esRestaurante(){
        return this.sessionService.getSessionUserData().restaurante;
    }

    getEstadoFactura(factura: VentaFacturaResumen) {
        return factura ? factura.estado : 'NO EMITIDO';
    }

    getClaseFactura(factura: VentaFacturaResumen) {
        if (!factura) return 'mr-2 ';
        if (factura.codigoEstado == sfe.ESTADO_FACTURA_ANULADO) return 'mr-2 factura-anulada';
        if (factura.codigoEstado == sfe.ESTADO_FACTURA_VALIDADO) return 'mr-2 factura-emitida';
        return 'mr-2 ';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    public onSubmit(): void {
        this.loadData(0);
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    opcionesVenta(menu: any, event: any, item: Venta) {
        this.ventaSeleccionada = item;
        menu.toggle(event);
    }

    opcionFacturaAnular() {
        if (!this.ventaSeleccionada?.factura || this.ventaSeleccionada?.factura!.codigoEstado == sfe.ESTADO_FACTURA_RECHAZADA) {
            this.informationService.showWarning('No existe factura');
            return;
        }
        if (this.ventaSeleccionada?.factura!.codigoEstado == sfe.ESTADO_FACTURA_ANULADO) {
            this.informationService.showWarning('La factura ya está anulada');
            return;
        }
        const ref = this.dialogService.open(AnularFacturaComponent, {
            header: 'Anular Factura',
            width: '500px',
            data: this.ventaSeleccionada.factura,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData(0);
            }
        });
    }

    opcionFacturaWhatsapp() {
        if (!this.ventaSeleccionada?.factura || this.ventaSeleccionada?.factura!.codigoEstado == sfe.ESTADO_FACTURA_RECHAZADA) {
            this.informationService.showWarning('No existe factura');
            return;
        }
        if (this.ventaSeleccionada?.factura!.codigoEstado == sfe.ESTADO_FACTURA_RECHAZADA) {
            this.informationService.showWarning('La factura está rechazada');
            return;
        }
        if (this.ventaSeleccionada?.factura!.codigoEstado == sfe.ESTADO_FACTURA_ANULADO) {
            this.informationService.showWarning('La factura está anulada');
            return;
        }


        const factura: any = {
            ... this.ventaSeleccionada.factura!,
            codigoCliente: this.ventaSeleccionada.codigoCliente,
            nombreRazonSocial: this.ventaSeleccionada.nombreCliente
        }
        console.log(factura);
        /*const ref = this.dialogService.open(EnviarWhatsappComponent, {
            header: 'Enviar Factura por WhatsApp',
            width: '300px',
            data: factura,
        });
        ref.onClose.subscribe((res) => {});*/

        const ref = this.dialogService.open(WhatsappFacturaComponent, {
            header: 'Enviar Factura por WhatsApp',
            width: '500px',
            data: factura,
        });
        ref.onClose.subscribe((res) => {});
    }

    opcionFacturaDescargar(imprimir:boolean) {
        if (!this.ventaSeleccionada?.factura) {
            this.informationService.showWarning('No existe factura');
            return;
        }

        this.blockedPanel = true;
        const fileName = `factura-${
            this.ventaSeleccionada.factura!.cuf
        }.pdf`;
        this.utilidadesService
            .getFactura(this.ventaSeleccionada.factura!.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, imprimir);
                this.blockedPanel = false;
            });
    }

    opcionFacturaEmitir() {
        if (
            this.ventaSeleccionada?.factura &&
            this.ventaSeleccionada?.factura.codigoEstado != sfe.ESTADO_FACTURA_ANULADO &&
            this.ventaSeleccionada?.factura.codigoEstado != sfe.ESTADO_FACTURA_OBSERVADO &&
            this.ventaSeleccionada?.factura.codigoEstado != sfe.ESTADO_FACTURA_RECHAZADA
        ) {
            this.informationService.showWarning('Ya existe una factura');
            return;
        }

        if (
            this.ventaSeleccionada?.idEstadoVenta == spv.ESTADO_VENTA_PEDIDO ||
            this.ventaSeleccionada?.idEstadoVenta == spv.ESTADO_VENTA_REVERTIDA
        ) {
            this.informationService.showWarning('La venta no esta finalizada');
            return;
        }

        const ref = this.dialogService.open(EmitirFacturaComponent, {
            header: 'Emitir Factura',
            width: '400px',
            data: this.ventaSeleccionada,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData(0);
            }
        });
    }

    opcionVentaImprimirComanda() {
        if (this.ventaSeleccionada?.idEstadoVenta!=spv.ESTADO_VENTA_PEDIDO){
            this.informationService.showWarning('Solo puede imprimir comandas de ventas PEDIDOS');
            return;
        }

        this.utilidadesService.getImpresionComanda(this.ventaSeleccionada.id).subscribe({
            next: (res) => {
                this.informationService.showSuccess(res.message);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    opcionVentaImprimirCuenta() {
        if (this.ventaSeleccionada?.idEstadoVenta!=spv.ESTADO_VENTA_PEDIDO){
            this.informationService.showWarning('Solo puede imprimir cuentas de ventas PEDIDOS');
            return;
        }

        this.utilidadesService.getImpresionCuenta(this.ventaSeleccionada.id).subscribe({
            next: (res) => {
                this.informationService.showSuccess(res.message);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.nitEmpresa = empresaAux.nit;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['nitEmpresa'].setValue(empresaAux.nit);
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
        this.criteriosBusquedaForm.controls['idSucursal'].setValue(null);
        this.criteriosBusquedaForm.controls['usuario'].setValue(null);
        this.cargarSucursales();
        this.cargarUsuarios();
    }
}
