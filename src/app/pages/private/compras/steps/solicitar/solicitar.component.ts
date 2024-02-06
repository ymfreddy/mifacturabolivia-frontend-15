import { Component, OnInit } from '@angular/core';
import { Compra, CompraDetalle } from 'src/app/shared/models/compra.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Producto } from 'src/app/shared/models/producto.model';
import { spv } from 'src/app/shared/constants/spv';
import { ComprasService } from 'src/app/shared/services/compras.service';
import { Router } from '@angular/router';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { Proveedor } from 'src/app/shared/models/proveedor.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { ProveedoresService } from 'src/app/shared/services/proveedores.service';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { Table } from 'primeng/table';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';

@Component({
    selector: 'app-solicitar',
    templateUrl: './solicitar.component.html',
    styleUrls: ['./solicitar.component.scss'],
})
export class SolicitarComponent implements OnInit {
    maxDate = new Date();
    item?: Compra;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;
    verProductos = false;

    listaSucursales: Sucursal[] = [];
    listaProveedores: Proveedor[] = [];

    listaProductos: Producto[] = [];
    listaProductosSeleccionados: Producto[] = [];

    detalle: CompraDetalle[] = [];
    detalleEliminado: number[] = [];

    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private proveedorService: ProveedoresService,
        private sucursalService: SucursalesService,
        private productoService: ProductosService,
        private sessionService: SessionService,
        private compraService: ComprasService,
        public dialogService: DialogService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getRegistroCompra() != null) {
            this.item = this.sessionService.getRegistroCompra();
        }

        console.log(this.item);
        let fechaPedido = this.item?.fechaPedido ? new Date(this.item?.fechaPedido) :  new Date() ;
        console.log(fechaPedido);

        const criteriosBusqueda: BusquedaProducto = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idsTipoProducto: spv.TIPO_PRODUCTO_CON_INVENTARIO.toString(),
        };

        this.productoService.get(criteriosBusqueda)
        .subscribe({
            next: (res) => {
                this.listaProductos = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        this.sucursalService
            .getByIdEmpresa(this.sessionService.getSessionEmpresaId())
            .subscribe({
                next: (res) => {
                    this.listaSucursales = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

        this.proveedorService
            .getByIdEmpresa(this.sessionService.getSessionEmpresaId())
            .subscribe({
                next: (res) => {
                    this.listaProveedores = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

        this.itemForm = this.fb.group({
            id: [{ value: this.item?.id ?? 0, disabled: true }],
            correlativo: [{ value: this.item?.correlativo, disabled: true }],
            idSucursal: [this.item?.idSucursal, Validators.required],
            idProveedor: [this.item?.idProveedor, Validators.required],
            //fechaPedido: [{value: this.datepipe.transform(fechaPedido,'dd/MM/yyyy')}, Validators.required],
            fechaPedido: [fechaPedido , Validators.required],
            subtotal: [{ value: this.item?.subtotal ?? 0, disabled: true }],
            descuentos: [this.item?.descuentos ?? 0],
            total: [{ value: this.item?.total ?? 0, disabled: true }],
        });

        // cargar detalle
        this.detalle = this.item?.detalle ?? [];
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    public dialogoProductosAbrir(): void {
        this.verProductos = true;
        this.listaProductosSeleccionados = [];
    }

    public dialogoProductosCerrar(): void {
        this.verProductos = false;
        this.listaProductosSeleccionados.forEach((element) => {
            const item = this.detalle.find(
                (x) => x.codigoProducto == element.codigoProducto
            );
            if (!item) {
                const prod: CompraDetalle = {
                    idProducto: element.id,
                    codigoProducto: element.codigoProducto,
                    producto: element.nombre,
                    cantidad: 1,
                    precio: 1,
                    total: 1,
                    precioVenta: 0
                };
                this.detalle.push(prod);
            }
        });
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter(
            (x) => x.codigoProducto != item.codigoProducto
        );
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
    }

    getDetalleTotal():number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.total)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES);
        }

        return 0;
    }

    getTotal() {
        let totalIVA = this.getDetalleTotal() - this.itemForm.value.descuentos;
        return !isNaN(totalIVA) ? this.helperService.round(totalIVA, adm.NUMERO_DECIMALES) : 0;
    }

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/adm/compras']);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos un producto a la compra'
                );
                return;
            }
            if (this.getTotal() < 0) {
                this.informationService.showWarning(
                    'El total no puede ser menor a 0'
                );
                return;
            }

             // verificar los item
             let existeItemError: string = '';
             this.detalle.forEach((element) => {
                 if (element.cantidad<=0){
                     existeItemError ='La cantidad del producto ' +element.producto +', debe ser mayor a 0 ';
                     return;
                 }
                 if (element.precio<0){
                     existeItemError ='El precio del producto ' +element.producto +', debe ser mayor o igual a 0 ';
                     return;
                 }
                 if (element.precioVenta <=0){
                     existeItemError ='El precio de venta del producto ' +element.producto +', debe ser mayor a 0 ';
                     return;
                 }
             });

             if (existeItemError) {
                 this.informationService.showWarning(existeItemError);
                 return;
             }


            const fechaPedido = this.itemForm.controls['fechaPedido'].value as Date;
            console.log(fechaPedido);
            const compra: Compra = {
                ...this.item,
                id: this.itemForm.controls['id'].value,
                idSucursal: this.itemForm.controls['idSucursal'].value,
                idProveedor: this.itemForm.controls['idProveedor'].value,
                subtotal: this.getDetalleTotal(),
                descuentos: this.itemForm.controls['descuentos'].value,
                total: this.getTotal(),
                detalle: this.detalle,
                fechaPedido: this.datepipe.transform(fechaPedido, 'dd/MM/yyyy HH:mm') ?? '',
                itemsEliminados:
                    this.detalleEliminado.length == 0
                        ? null
                        : this.detalleEliminado,
            };

            console.log(compra);
            this.submited = true;
            if (compra.id > 0) {
                // se verifica si existen cambios para realizar la actualizacion
                const nuevo = JSON.stringify(compra).toString();
                let itemMemoria:Compra  = this.sessionService.getRegistroCompra();
                itemMemoria.fechaPedido = this.datepipe.transform(itemMemoria.fechaPedido, 'dd/MM/yyyy HH:mm') ?? '';
                const session = JSON.stringify(itemMemoria);
                if (nuevo == session) {
                    this.router.navigate(['/adm/compra-por-pasos/recibir']);
                } else {
                    console.log(nuevo);
                    console.log(session);

                    this.compraService.edit(compra).subscribe({
                        next: (res) => {
                            this.sessionService.setRegistroCompra(res.content);
                            this.informationService.showSuccess(res.message);
                            this.router.navigate([
                                '/adm/compra-por-pasos/recibir',
                            ]);
                        },
                        error: (err) => {
                            this.informationService.showError(err.error.message);
                            this.submited = false;
                        },
                    });
                }
            } else {
                this.compraService.add(compra).subscribe({
                    next: (res) => {
                        this.sessionService.setRegistroCompra(res.content);
                        this.informationService.showSuccess(res.message);
                        this.router.navigate(['/adm/compra-por-pasos/recibir']);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    onEditComplete(event: any) {
        this.calcularFila(event.data);
    }

    calcularFila(row: any) {
        const elementIndex = this.detalle.findIndex(
            (obj) => obj.codigoProducto == row.codigoProducto
        );
        if (!row.precio) {
            row.precio = 0;
        }
        if (!row.cantidad) {
            row.cantidad = 0;
        }
        const total = row.precio * row.cantidad;
        this.detalle[elementIndex].total = total;
    }

    prevPage() {
        this.backClicked = true;
    }

    public onSave(): void {
        this.backClicked = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
}
