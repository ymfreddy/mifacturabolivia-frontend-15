import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Cotizacion } from 'src/app/shared/models/cotizacion.model';
import { CotizacionesService } from 'src/app/shared/services/cotizaciones.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { BusquedaCotizacion } from 'src/app/shared/models/busqueda-cotizacion.model';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { HelperService } from '../../../../shared/helpers/helper.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Venta } from 'src/app/shared/models/venta.model';
import { spv } from 'src/app/shared/constants/spv';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { BusquedaCliente } from 'src/app/shared/models/busqueda-cliente.model';
import { EnviarCotizacionWhatsappComponent } from 'src/app/components/enviar-cotizacion-whatsapp/enviar-cotizacion-whatsapp.component';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';


@Component({
  selector: 'app-lista-cotizaciones',
  templateUrl: './lista-cotizaciones.component.html',
  styleUrls: ['./lista-cotizaciones.component.scss']
})
export class ListaCotizacionesComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaCotizacion;

    items!: Cotizacion[];
    listaSucursales: Sucursal[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    cotizacioneseleccionada!: Cotizacion;
    itemsMenuFactura!: MenuItem[];
    itemsMenuCotizacion!: MenuItem[];

    listaClientesFiltrados: Cliente[] = [];

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        private cotizacionesService: CotizacionesService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private datepipe: DatePipe,
        private utilidadesService: UtilidadesService,
        private helperService: HelperService,
        private fileService:FilesService,
        private clienteService: ClientesService,
        private empresasService: EmpresasService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }


        this.idEmpresa = this.sessionService.getSessionEmpresaId();

        this.cargarEmpresas();
        this.cargarSucursales();

        // fn cargar usuarios
        //let fechaInicio = this.helperService.getDate(this.busquedaMemoria?.fechaInicio);
        //let fechaFin = this.helperService.getDate(this.busquedaMemoria?.fechaFin);

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            cliente: [null],
            codigoCliente: [null],
            nombreCliente: [null],
            emailCliente: [null],
            correlativo : [null],
            idSucursal: [{ value: this.busquedaMemoria?.idSucursal??this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            //fechaInicio: [fechaInicio, Validators.required],
            //fechaFin: [fechaFin, Validators.required],
        });

        const esAdministrador = this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_ADMIN || this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_SUPERADMIN;
        if (!esAdministrador) {this.criteriosBusquedaForm.controls['usuario'].disable();
            this.criteriosBusquedaForm.patchValue({ usuario: this.sessionService.getSessionUserData().username });
        }

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
        // if (
        //     this.criteriosBusquedaForm.controls['fechaFin'].value.getTime() -
        //         this.criteriosBusquedaForm.controls[
        //             'fechaInicio'
        //         ].value.getTime() <
        //     0
        // ) {
        //     this.informationService.showWarning(
        //         'La fecha inicio no debe ser menor a la fecha fin'
        //     );
        //     return;
        // }

        // const dias = Math.round(
        //     Math.abs(
        //         (this.criteriosBusquedaForm.controls[
        //             'fechaInicio'
        //         ].value.getTime() -
        //             this.criteriosBusquedaForm.controls[
        //                 'fechaFin'
        //             ].value.getTime()) /
        //             adm.UN_DIA
        //     )
        // );
        // if (dias > 31) {
        //     this.informationService.showWarning(
        //         'El rango de fechas debe ser menor o igual a 31 días'
        //     );
        //     return;
        // }

        this.blockedPanel = true;
        const criterios = this.getBusquedaCriterios();
        this.cotizacionesService.get(criterios)
        .subscribe({
            next: (res) => {
                //this.sessionService.setBusquedaCotizacion(criterios);
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

    getBusquedaCriterios() {
        /*const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;*/
        const correaltivo = this.criteriosBusquedaForm.controls['correlativo'].value;
        const criterios: BusquedaCotizacion = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idSucursal: this.criteriosBusquedaForm.controls['idSucursal'].value,
            codigoCliente: this.criteriosBusquedaForm.controls['codigoCliente'].value,
            correlativo: correaltivo? correaltivo.toUpperCase():correaltivo
            //fechaInicio: this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            //fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
        };

        return criterios;
    }

    opcionCotizacionWhatsapp(item: Cotizacion) {
        let fecha = new Date();
        let fechaLimite = new Date(item.fechaLimite!);
        console.log(fecha);
        console.log(fechaLimite);
        if (fechaLimite<=fecha){
            this.informationService.showWarning('La cotización está vencida');
            return;
        }
        const ref = this.dialogService.open(EnviarCotizacionWhatsappComponent, {
            header: 'Enviar Cotización por WhatsApp',
            width: '300px',
            data: item,
        });
        ref.onClose.subscribe((res) => {});

    }

    opcionCotizacionDescargar(item: Cotizacion) {
        this.blockedPanel = true;
        const fileName = `cotizacion-${item.correlativo}.pdf`;
        this.utilidadesService
            .getCotizacion(item?.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
                this.blockedPanel = false;
            });
    }

    opcionCotizacionVender(item: Cotizacion) {
        console.log(item);
        let fecha = new Date();
        let fechaLimite = new Date(item.fechaLimite!);
        console.log(fecha);
        console.log(fechaLimite);
        if (fechaLimite<fecha){
            this.confirmationService.confirm({
                message: 'La cotizacion ' + item.correlativo + ' ya esta vencida, desea cargarla de todos modos ?',
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => { this.cargarVenta(item)},
            });
        }else{
            this.cargarVenta(item);
        }

    }

    cargarVenta(item: Cotizacion){
        // cargar a ventas
        const venta: Venta = {
            idSucursal: item.idSucursal!,
            idCliente: item.idCliente,
            codigoCliente: item.codigoCliente,
            nombreCliente: item.nombreCliente,
            emailCliente: item.emailCliente,
            idEstadoVenta: spv.ESTADO_VENTA_PEDIDO,
            idTipoVenta: spv.TIPO_VENTA_CONTADO,
            diasCredito: 0,
            total: item.total!,
            descuentoAdicional:item.descuentoAdicional!,
            totalSujetoIva: item.totalSujetoIva!,
            detalle: [],
            itemsEliminados: null,
            id: 0
        };

        this.cotizacionesService.getDetail(item.id).subscribe({
            next: (res) => {
                venta.detalle = res.content;
                this.sessionService.setRegistroVenta(venta);
                this.router.navigate(['/adm/venta-por-pasos']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    deleteItem(item: Cotizacion) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la cotizacion ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cotizacionesService.delete(item).subscribe({
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
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    seleccionarCliente(event: any) {
        this.criteriosBusquedaForm.patchValue({ cliente: event });
        this.criteriosBusquedaForm.patchValue({ idCliente: event?.id });
        this.criteriosBusquedaForm.patchValue({ codigoCliente: event?.codigoCliente });
        this.criteriosBusquedaForm.patchValue({ nombreCliente: event?.nombre });
        this.criteriosBusquedaForm.patchValue({ emailCliente: event?.email });
    }

    limpiarCliente() {
        this.criteriosBusquedaForm.patchValue({ cliente: null });
        this.criteriosBusquedaForm.patchValue({ idCliente: '' });
        this.criteriosBusquedaForm.patchValue({ codigoCliente: '' });
        this.criteriosBusquedaForm.patchValue({ nombreCliente: '' });
        this.criteriosBusquedaForm.patchValue({ emailCliente: '' });
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

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    opcionesCotizacion(menu: any, event: any, item: Cotizacion) {
        this.cotizacioneseleccionada = item;
        menu.toggle(event);
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
        this.criteriosBusquedaForm.controls['idSucursal'].setValue(null);
        this.cargarSucursales();
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
}
