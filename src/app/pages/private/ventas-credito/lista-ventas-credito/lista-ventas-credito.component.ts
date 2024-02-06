import { Component, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Venta } from 'src/app/shared/models/venta.model';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, delay } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { spv } from 'src/app/shared/constants/spv';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormatoFechaHoraPipe } from 'src/app/shared/pipes/formato-fecha-hora.pipe';
import { FormatoDecimalPipe } from 'src/app/shared/pipes/formato-decimal.pipe';
import { adm } from 'src/app/shared/constants/adm';
import { PagosService } from 'src/app/shared/services/pagos.service';
import { BusquedaPago } from 'src/app/shared/models/busqueda-pago.model';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { FormularioVentasCreditoPagoComponent } from '../formulario-ventas-credito-pago/formulario-ventas-credito-pago.component';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Pago } from 'src/app/shared/models/pago.model';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { VentaDetalleComponent } from 'src/app/components/venta-detalle/venta-detalle.component';
import { Router } from '@angular/router';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { BusquedaVenta } from 'src/app/shared/models/busqueda-venta.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';


@Component({
  selector: 'app-lista-ventas-credito',
  templateUrl: './lista-ventas-credito.component.html',
  styleUrls: ['./lista-ventas-credito.component.scss']
})
export class ListaVentasCreditoComponent implements OnInit {
    criteriosBusquedaForm!: FormGroup;
    onDestroy$: Subject<boolean> = new Subject();
    verPagos = false;

    items: Venta[]=[];
    itemsSeleccionados: Venta[]=[];
    listaSucursales: Sucursal[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;
    listaPagos: Pago[]=[];

    listaEstadosVenta: any[] = [];
    listaTiposVenta: any[] = [];
    opciones!: MenuItem[];

    listaEmpresas: Empresa[] = [];
    nitEmpresa!:number;
    idEmpresa!:number;

    busquedaMemoria?: BusquedaVenta;

    constructor(
        private fb: FormBuilder,
        private ventasService: VentasService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private formatoFechaHoraPipe:FormatoFechaHoraPipe,
        private formatoDecimalPipe:FormatoDecimalPipe,
        private pagosService:PagosService,
        private utilidadesService:UtilidadesService,
        private fileService:FilesService,
        private confirmationService : ConfirmationService,
        private helperService: HelperService,
        private router: Router,
        private empresasService: EmpresasService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }


        if (this.sessionService.getBusquedaVentaCredito() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaVentaCredito();
        }

        this.idEmpresa = this.busquedaMemoria?.idEmpresa ?? this.sessionService.getSessionEmpresaId();
        this.nitEmpresa = this.busquedaMemoria?.nitEmpresa ?? this.sessionService.getSessionEmpresaNit();

        this.cargarOpcionesVentas();
        // cargar parametricas
        this.cargarEmpresas();
        this.cargarSucursales();
        this.cargarParametricas();

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            nitEmpresa: this.nitEmpresa,
            idSucursal: [{ value: this.busquedaMemoria?.idSucursal??this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            idsEstadosVenta: [this.busquedaMemoria?.idsEstadosVenta
                ? this.busquedaMemoria?.idsEstadosVenta.split(",") : null],
            idsTiposVenta: [this.busquedaMemoria?.idsTiposVenta
                ? this.busquedaMemoria?.idsTiposVenta.split(",") : null],
            codigoCliente: [this.busquedaMemoria?.codigoCliente
                ? this.busquedaMemoria?.codigoCliente : null],
            correlativo: [this.busquedaMemoria?.correlativo
                    ? this.busquedaMemoria?.correlativo : null],
            soloCreditos : true,
            //fechaInicio: [new Date(), Validators.required],
            //fechaFin: [new Date(), Validators.required],
        });

        /*const esAdministrador = this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_ADMIN || this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_SUPERADMIN;
        if (!esAdministrador) {this.criteriosBusquedaForm.controls['usuario'].disable();
            this.criteriosBusquedaForm.patchValue({ usuario: this.sessionService.getSessionUserData().username });
        }*/

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
                    this.reporteVentasCredito();
                },
            }
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

    cargarParametricas(){
        this.parametricasService
        .getParametricasByTipo(TipoParametrica.ESTADO_VENTA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaEstadosVenta = parametricas;
            this.listaEstadosVenta = this.listaEstadosVenta.filter(x=>x.id==spv.ESTADO_VENTA_CREDITO_PAGADO || x.id==spv.ESTADO_VENTA_CREDITO_POR_PAGAR);
        });

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_VENTA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaTiposVenta = parametricas;
            this.listaTiposVenta = this.listaTiposVenta.filter(x=>x.id==spv.TIPO_VENTA_CREDITO || x.id==spv.TIPO_VENTA_ONLINE);
        });
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    reporteVentasCredito() {
        this.loadData(1);
    }

    loadData(reporte:number): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        // validar rango fecha
        /*if (
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
        }*/
        this.blockedPanel = true;
        const criterios = this.getBusquedaCriterios();
        if (reporte>0) {
            if (reporte==1){
                const fileName = `ventas-credito-${this.nitEmpresa}.pdf`;
                this.utilidadesService.getReporteVentas(criterios).pipe(delay(1000)).subscribe((blob: Blob): void => {
                        this.fileService.printFile(blob, fileName, false);
                        this.blockedPanel = false;
                    });
            }
        }
        else {
            this.ventasService.get(this.criteriosBusquedaForm.value)
            .subscribe({
                next: (res) => {
                    this.sessionService.setBusquedaVentaCredito(criterios);
                    this.items = res.content;
                    this.itemsSeleccionados = [];
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
        /*const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;*/

        const estados = this.criteriosBusquedaForm.controls['idsEstadosVenta'].value;
        const tipos = this.criteriosBusquedaForm.controls['idsTiposVenta'].value;

        const criterios: BusquedaVenta = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idSucursal: this.criteriosBusquedaForm.controls['idSucursal'].value,
            //fechaInicio: this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            //fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            idsTiposVenta:(!tipos || tipos.length==0) ?'':tipos.join(','),
            idsEstadosVenta: (!estados || estados.length==0) ?'':estados.join(','),
            correlativo: this.criteriosBusquedaForm.controls['correlativo'].value,
            codigoCliente: this.criteriosBusquedaForm.controls['codigoCliente'].value,
            soloCreditos: true
        };
        console.log(criterios);
        return criterios;
    }

    esEditable(idEstado:number){
        return idEstado==spv.ESTADO_VENTA_CREDITO_PAGADO;
    }

    pagar(item: Venta) {
        const ventas:Venta[]=[item];
        const ref = this.dialogService.open(FormularioVentasCreditoPagoComponent, {
            header: 'Cobrar',
            width: '80%',
            data: ventas,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData(0);
            }
        });
    }

    verVentaDetalle(item: Venta) {
        const ref = this.dialogService.open(VentaDetalleComponent, {
            header: 'Detalle Venta '+ item.correlativo,
            width: '80%',
            data: { item: item},
        });
        ref.onClose.subscribe((res) => {
        });
    }

    liquidar(){
        // verificar si esxite un deuda con credito finalizado
        const existePagados =this.itemsSeleccionados.filter(x=>x.idEstadoVenta==spv.ESTADO_VENTA_CREDITO_PAGADO).length;
        if (existePagados>0){
            this.informationService.showWarning('Solo puede liquidar ventas con pagos pendientes');
            return;
        }

        const ref = this.dialogService.open(FormularioVentasCreditoPagoComponent, {
            header: 'Liquidar',
            width: '80%',
            data: this.itemsSeleccionados,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData(0);
            }
        });
    }

    public onSubmit(): void {
        this.loadData(0);
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

    private getDataToExport() {
        var datos = this.items.map((x, index) => ({
            numero: index + 1,
            sucursal: x.numeroSucursal,
            codigo_cliente: x.codigoCliente,
            cliente: x.nombreCliente,
            codigo_venta: x.id,
            fecha_venta: this.formatoFechaHoraPipe.transform(x.fecha ? x.fecha?.toString():""),
            dias_credito: x.diasCredito,
            fecha_limite: this.formatoFechaHoraPipe.transform(x.fechaLimite ? x.fechaLimite?.toString():""),
            total: this.formatoDecimalPipe.transform(x.totalSujetoIva),
            a_cuenta: this.formatoDecimalPipe.transform(x.totalSujetoIva - (x.saldo?x.saldo:0)),
            saldo: this.formatoDecimalPipe.transform(x.saldo),
            estado: x.estadoVenta
        }));
        return datos;
    }

    public exportPdf() {
        if (!this.items) {
            this.informationService.showWarning(
                'No existe datos para exportar'
            );
            return;
        }

        let PDF_EXTENSION = '.pdf';
        const doc = new jsPDF('l', 'mm', 'letter');
        const head = [
            [
                'numero',
                'sucursal',
                'codigo_cliente',
                'cliente',
                'codigo_venta',
                'fecha_venta',
                'dias_credito',
                'fecha_limite',
                'total',
                'a_cuenta',
                'saldo',
                'estado',
            ],
        ];
        let data: any[] = [];
        this.getDataToExport().forEach((element) => {
            data.push(Object.values(element));
        });

        let sumaSaldo = 0;
        this.items.forEach((element) =>{
            if (element.saldo) sumaSaldo+=element.saldo;
        });
        sumaSaldo = this.helperService.round(sumaSaldo, adm.NUMERO_DECIMALES);
        data.push(['','','','','','','','','','TOTAL SALDO:',sumaSaldo]);
        autoTable(doc, {
            head: head,
            body: data
        });
        doc.text(
            'Lista de Ventas a Crédito',
            doc.internal.pageSize.getWidth() / 2,
            10,
            { align: 'center' }
        );
        doc.save('convenios_export_' + new Date().getTime() + PDF_EXTENSION);
    }

    exportExcel() {
        if (!this.items) {
            this.informationService.showWarning(
                'No existe datos para exportar'
            );
            return;
        }

        import('xlsx').then((xlsx) => {
            let worksheet = xlsx.utils.json_to_sheet(this.getDataToExport());
            const workbook = {
                Sheets: { data: worksheet },
                SheetNames: ['data'],
            };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'convenios');
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        let EXCEL_TYPE =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
        );
    }

    public dialogoPagosAbrir(item: Venta): void {
        //console.log('ver pagos');
        this.verPagos = true;
        const busqueda :BusquedaPago ={
            idVenta: item.id,
            idEmpresa: this.sessionService.getSessionUserData().idEmpresa
        };
        this.pagosService.get(busqueda)
        .subscribe({
            next: (res) => {
                this.listaPagos = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    public dialogoPagosCerrar(): void {
        this.verPagos = false;
        this.listaPagos = [];
    }

    descargarComprobante(item: any) {
        this.blockedPanel = true;
        const fileName = `pago-${item.correlativo}.pdf`;
        this.utilidadesService
            .getReciboPago(item.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
                this.blockedPanel = false;
            });
    }

    anularPago(item: any) {
        this.confirmationService.confirm({
            message: 'Esta seguro de anular el pago '+item.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.blockedPanel = true;
                this.pagosService.delete(item)
                .subscribe({
                    next: (res) => {
                        this.listaPagos = this.listaPagos.filter(x=> x.id!==item.id);
                        this.loadData(0);
                        this.informationService.showSuccess(res.message);
                        this.blockedPanel = false;
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.blockedPanel = false;
                    },
                });
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
        //this.criteriosBusquedaForm.controls['usuario'].setValue(null);
        this.cargarSucursales();
        //this.cargarUsuarios();
    }
}
