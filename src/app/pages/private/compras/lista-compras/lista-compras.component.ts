import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Compra } from 'src/app/shared/models/compra.model';
import { ComprasService } from 'src/app/shared/services/compras.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, delay } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { spv } from 'src/app/shared/constants/spv';
import { BusquedaCompra } from 'src/app/shared/models/busqueda-compra.model';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { FilesService } from 'src/app/shared/helpers/files.service';

@Component({
    selector: 'app-lista-compras',
    templateUrl: './lista-compras.component.html',
    styleUrls: ['./lista-compras.component.scss'],
    providers: [DialogService],
})
export class ListaComprasComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaCompra;

    items!: Compra[];
    listaEstadosCompra: Parametrica[] = [];
    listaSucursales: Sucursal[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    itemsMenuCompra!: MenuItem[];
    compraSeleccionada!: Compra;

    constructor(
        private fb: FormBuilder,
        private compraService: ComprasService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService,
        private empresasService: EmpresasService,
        private utilidadesService: UtilidadesService,
        private fileService:FilesService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        if (this.sessionService.getBusquedaCompra() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaCompra();
        }

        this.idEmpresa = this.busquedaMemoria?.idEmpresa ?? this.sessionService.getSessionEmpresaId();

        this.cargarOpcionesCompras();
        this.cargarEmpresas();
        this.cargarSucursales();
        this.cargarParametricas();

        let fechaInicio = this.helperService.getDate(this.busquedaMemoria?.fechaInicio);
        let fechaFin = this.helperService.getDate(this.busquedaMemoria?.fechaFin);

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            idSucursal: [{ value: this.busquedaMemoria?.idSucursal??this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            idEstadoCompra: this.busquedaMemoria?.idEstadoCompra,
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
        const criterios = this.getBusquedaCriterios();

        this.compraService.get(criterios).subscribe({
            next: (res) => {
                this.sessionService.setBusquedaCompra(criterios);
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

    cargarOpcionesCompras(){
        this.itemsMenuCompra = [
            {
                label: 'Opciones Compra',
                items: [
                    {
                        label: 'Descargar Solicitud',
                        icon: 'pi pi-cloud-download',
                        command: () => {
                            this.opcionCompraDescargarSolicitud();
                        },
                    },
                    {
                        label: 'Descargar Reporte',
                        icon: 'pi pi-cloud-download',
                        command: () => {
                            this.opcionCompraDescargarReporte();
                        },
                    }
                ],
            },
        ];
    }

    getBusquedaCriterios() {
        const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;
        const criterios: BusquedaCompra = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idSucursal: this.criteriosBusquedaForm.controls['idSucursal'].value,
            fechaInicio:
                this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            idEstadoCompra:
                this.criteriosBusquedaForm.controls['idEstadoCompra'].value,
        };
        return criterios;
    }

    esEditable(idEstado: number) {
        return idEstado == spv.ESTADO_COMPRA_PEDIDO;
    }

    newItem() {
        this.sessionService.setRegistroCompra(null);
        this.router.navigate(['/adm/compra-por-pasos']);
    }

    editItem(item: Compra) {
        this.compraService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
            this.sessionService.setRegistroCompra(item);
            this.router.navigate(['/adm/compra-por-pasos']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    deleteItem(item: Compra) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la compra ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.compraService.delete(item).subscribe({
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
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
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

    cargarParametricas(){
        this.parametricasService
        .getParametricasByTipo(TipoParametrica.ESTADO_COMPRA)
        .subscribe((data) => {
            this.listaEstadosCompra = data as unknown as Parametrica[];
        });
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
        this.criteriosBusquedaForm.controls['idSucursal'].setValue(null);
        this.cargarSucursales();
    }

    opcionesCompra(menu: any, event: any, item: Compra) {
        this.compraSeleccionada = item;
        menu.toggle(event);
    }

    opcionCompraDescargarSolicitud() {
        this.blockedPanel = true;
        const fileName = `solicitud-compra-${this.compraSeleccionada.correlativo}.pdf`;
        this.utilidadesService
            .getReporteSolicitudCompra(this.compraSeleccionada.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
                this.blockedPanel = false;
            });
    }

    opcionCompraDescargarReporte() {
        this.blockedPanel = true;
        const fileName = `compra-${this.compraSeleccionada.correlativo}.pdf`;
        this.utilidadesService
            .getReporteCompra(this.compraSeleccionada.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
                this.blockedPanel = false;
            });
    }
}
