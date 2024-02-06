import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Producto, SolicitudProductoMasivo } from 'src/app/shared/models/producto.model';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioProductoComponent } from '../formulario-producto/formulario-producto.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { read, utils } from 'xlsx';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { BusquedaPaginadaProducto } from 'src/app/shared/models/busqueda-paginada-producto.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';
import { FormularioProductoIceComponent } from '../formulario-producto-ice/formulario-producto-ice.component';

@Component({
    selector: 'app-lista-productos',
    templateUrl: './lista-productos.component.html',
    styleUrls: ['./lista-productos.component.scss'],
    providers: [DialogService],
})
export class ListaProductosComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Producto[];
    itemDialog!: boolean;

    totalRecords: number = 0;
    loading!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    nitEmpresa!:number;

    busqueda: BusquedaPaginadaProducto ;

    acceptedFiles: string = ".xls, .xlsx";
    blockedPanel: boolean = false;
    constructor(
        private productosService: ProductosService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private fileService: FilesService,
        private empresasService: EmpresasService,
    ) {
        this.busqueda = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            pagina:1,
            cantidadItems:10,
            tipoOrden: 1,
            campoOrden: '',
            filtro:'',
            idsCategorias: this.sessionService.getSessionUserData().categorias
        };

    }

    ngOnInit(): void {
        this.idEmpresa = this.busqueda.idEmpresa!;
        this.nitEmpresa = this.sessionService.getSessionEmpresaNit();

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

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            return;
        }
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.nitEmpresa = empresaAux.nit;
        this.busqueda = {
            ... this.busqueda,
            idEmpresa: this.idEmpresa,
            pagina: 1,
            campoOrden: '',
            tipoOrden: 1,
            filtro: event.globalFilter!,
            idsCategorias: ''
        }
        this.loadData();
    }

    loadPaged(event: LazyLoadEvent) {
        this.busqueda = {
            ... this.busqueda,
            pagina:event.first!/event.rows! + 1,
            cantidadItems:event.rows ?? 10,
            campoOrden: event.sortField,
            tipoOrden: event.sortOrder!,
            filtro: event.globalFilter!,
        }

        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.productosService.getPaged(this.busqueda).subscribe({
            next: (res) => {
                this.items = res.content.items;
                this.totalRecords = res.content.totalItems;
                this.loading = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.loading = false;
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(this.sessionService.getFacturaIceAsignada() ? FormularioProductoIceComponent : FormularioProductoComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { idEmpresa: this.idEmpresa, nitEmpresa: this.nitEmpresa },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Producto) {
        const ref = this.dialogService.open(this.sessionService.getFacturaIceAsignada() ? FormularioProductoIceComponent : FormularioProductoComponent, {
            header: 'Actualizar',
            width: '80%',
            data: { idEmpresa: this.idEmpresa, nitEmpresa: this.nitEmpresa, item: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj => obj.id == res.id));
                this.items[objIndex]=res;
            }
        });
    }

    deleteItem(item: Producto) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a '+item.nombre+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productosService.delete(item).subscribe({
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

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    cargarXls(event: any, fileUpload: any){
        if (event.files.length) {
            const file = event.files[0];
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;
                if (sheets.length) {
                    this.blockedPanel=true;
                    const lista = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    const datos = utils.sheet_to_json(wb.Sheets[sheets[1]]) as any[];
                    const solicitud: SolicitudProductoMasivo = {
                        nit: datos[0].nit,
                        nitProveedor: datos[0].nitProveedor,
                        descripcion: datos[0].descripcion,
                        sucursal: datos[0].sucursal,
                        lista: lista
                    }
                    console.log(solicitud);
                    this.productosService.addMasive(solicitud).subscribe({
                        next: (res) => {
                            this.loadData();
                            this.informationService.showSuccess(res.message);
                            this.blockedPanel=false;
                        },
                        error: (err) => {
                            this.informationService.showError(err.error.message);
                            this.blockedPanel=false;
                        },
                    });
                }
            }
            reader.readAsArrayBuffer(file);
        }

        fileUpload.clear();
    }

    onGlobalFilterClick(table: Table, text: string) {
        if (text.trim()===''){
            this.informationService.showInfo('Debe introducir un filtro');
            return;
        }
        table.filterGlobal(text, 'contains');
    }

    onGlobalFilterClear(table: Table) {
        table.filterGlobal('', 'contains');
    }

    exportExcel() {
        this.blockedPanel = true;
        const criteriosBusqueda: BusquedaProducto = {
            idEmpresa: this.idEmpresa,
            idsCategorias: this.esSuperAdm() ? '' : this.sessionService.getSessionUserData().categorias
        };
        this.productosService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                const listaProductos : Producto[] = res.content.sort((a:any, b:any) => (a.nombre < b.nombre ? -1 : 1));
                import('xlsx').then((xlsx) => {
                    var datos = listaProductos.map((x, index) => ({
                        numero: index + 1,
                        codigoProducto: x.codigoProducto,
                        nombre: x.nombre,
                        descripcion: x.descripcion,
                        categoria: x.categoria,
                        codigoTipoUnidad: x.codigoTipoUnidad,
                        tipoUnidad: x.tipoUnidad,
                        idTipoProducto: x.idTipoProducto,
                        tipoProducto: x.tipoProducto,
                        cantidadMinimaAlerta: x.cantidadMinimaAlerta,
                        costo: x.costo,
                        precio: x.precio,
                        imagenNombre: x.imagenNombre,
                        codigoActividadSin: x.codigoActividad,
                        actividad: x.actividad,
                        codigoProductoSin: x.codigoProductoSin,
                        productoSin: x.productoSin,
                        nitEmpresa: this.nitEmpresa
                    }));

                    const header = Object.keys(listaProductos[0]); // columns name
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
                    this.fileService.saveAsExcelFile(excelBuffer, 'productos');
                    this.blockedPanel = false;
                });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    facturaIceAsignada(){
        return this.sessionService.getFacturaIceAsignada();
    }
}
