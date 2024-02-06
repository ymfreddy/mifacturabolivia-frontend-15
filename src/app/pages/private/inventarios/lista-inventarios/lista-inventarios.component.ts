import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { SessionService } from 'src/app/shared/security/session.service';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { spv } from 'src/app/shared/constants/spv';
import { Producto, ProductoInventario } from 'src/app/shared/models/producto.model';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormularioAjusteComponent } from '../formulario-ajuste/formulario-ajuste.component';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { DialogService } from 'primeng/dynamicdialog';
import { adm } from 'src/app/shared/constants/adm';
import { ReporteProductoHistorialComponent } from '../../../../components/reporte-producto-historial/reporte-producto-historial.component';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-lista-inventarios',
    templateUrl: './lista-inventarios.component.html',
    styleUrls: ['./lista-inventarios.component.scss'],
    providers: [DialogService],
})
export class ListaInventariosComponent implements OnInit, OnDestroy {
    criteriosBusquedaForm!: FormGroup;
    onDestroy$: Subject<boolean> = new Subject();

    items!: ProductoInventario[];
    listaSucursales: Sucursal[] = [];
    listaProductos: Producto[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private sucursalesService: SucursalesService,
        private productoService: ProductosService,
        private fileService: FilesService,
        private helperService: HelperService,
        private empresasService: EmpresasService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.idEmpresa = this.sessionService.getSessionEmpresaId();

        this.cargarEmpresas();
        this.cargarSucursales();
        this.cargarProductos();

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            idsTipoProducto: spv.TIPO_PRODUCTO_CON_INVENTARIO.toString(),
            idsCategorias: this.esSuperAdm() ? '' : this.sessionService.getSessionUserData().categorias,
            idSucursal: [{ value: this.sessionService.getSessionUserData().idSucursal, disabled: false}, Validators.required],
            idProducto: null,
        });
    }

    loadData(): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        this.blockedPanel = true;
        this.productoService.get(this.criteriosBusquedaForm.value).subscribe({
            next: (res) => {
                this.items = res.content;
                const sucursalTemp = this.listaSucursales.find(x=>x.id===this.criteriosBusquedaForm.controls['idSucursal'].value)!;
                this.items.forEach((element) => {
                        element.idSucursal=sucursalTemp?.id;
                        element.numeroSucursal=sucursalTemp.numero;
                        element.saldoTotal=this.getSaldoTotal(element);
                });
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    getSaldoStock(item: ProductoInventario) {
        if (!item.saldos || item.saldos.length===0)
            return "0";

        return Array.prototype.map.call(item.saldos, function(item) { return "Stock: "+item.codigoStock+" = "+item.saldo+"\n\r"; }).join("");
    }

    getSaldoTotal(item: ProductoInventario) {
        if (!item.saldos || item.saldos.length===0)
            return 0;
        const sum = item.saldos
            .map((t) => t.saldo!)
            .reduce((acc, value) => acc + value, 0);
        return this.helperService.round(sum, adm.NUMERO_DECIMALES);
    }

    getHistory(item: ProductoInventario) {
        /*const datos: any = {
            idEmpresa: item.idEmpresa,
            idSucursal: item.idSucursal,
            idProducto: item.id,
        };
        this.blockedPanel = true;
        this.historialProductoService.getHistory(datos).subscribe({
            next: (res) => {
                this.blockedPanel = false;
                // mostrar contenido
                const ref = this.dialogService.open(HistorialProductoDetalleComponent, {
                    header: 'Historial del producto '+item.nombre,
                    width: '90%',
                    data: res.content,
                });
                ref.onClose.subscribe((res) => { });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });*/

        const ref = this.dialogService.open(ReporteProductoHistorialComponent, {
            header: 'Historial del producto '+item.nombre,
            width: '450px',
            data: item,
        });
        ref.onClose.subscribe((res) => { });
    }

    editItem(item: ProductoInventario) {
        // vverificar si tiene saldo
        if (item.saldoTotal==0){
            this.informationService.showInfo("El producto no tiene stock disponible");
            return;
        }

        const ref = this.dialogService.open(FormularioAjusteComponent, {
            header: 'Ajuste Inventario',
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

    public onSubmit(): void {
        this.loadData();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    private getDataToExport() {
        var datos = this.items.map((x, index) => ({
            numero: index + 1,
            sucursal: x.numeroSucursal,
            categoria: x.categoria,
            codigo_producto: x.codigoProducto,
            producto: x.nombre,
            saldo: x.saldoTotal,
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
                'categoria',
                'codigo_producto',
                'producto',
                'saldo',
            ],
        ];
        let data: any[] = [];
        this.getDataToExport().forEach((element) => {
            data.push(Object.values(element));
        });
        autoTable(doc, {
            head: head,
            body: data,
        });
        doc.text(
            'Inventario de Saldos',
            doc.internal.pageSize.getWidth() / 2,
            10,
            { align: 'center' }
        );
        doc.save('inventario_export_' + new Date().getTime() + PDF_EXTENSION);
    }

    exportExcel() {
        if (!this.items) {
            this.informationService.showWarning(
                'No existe datos para exportar'
            );
            return;
        }

        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(this.getDataToExport());
            const workbook = {
                Sheets: { data: worksheet },
                SheetNames: ['data'],
            };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.fileService.saveAsExcelFile(excelBuffer, 'inventario');
        });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.listaProductos = [];
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
        this.criteriosBusquedaForm.controls['idSucursal'].setValue(null);
        this.criteriosBusquedaForm.controls['idProducto'].setValue(null);
        this.cargarSucursales();
        this.cargarProductos();
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

    cargarProductos(){
        const criteriosBusqueda: BusquedaProducto = {
            idEmpresa: this.idEmpresa,
            idsTipoProducto: spv.TIPO_PRODUCTO_CON_INVENTARIO.toString(),
            resumen:true,
            idsCategorias: this.esSuperAdm() ? '' : this.sessionService.getSessionUserData().categorias
        };
        this.productoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                this.listaProductos = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }
}
