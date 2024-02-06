import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { ProductoResumen, SaldoProducto } from 'src/app/shared/models/producto.model';
import { AutoComplete } from 'primeng/autocomplete';
import { adm } from 'src/app/shared/constants/adm';
import { spv } from 'src/app/shared/constants/spv';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { Categoria } from 'src/app/shared/models/categoria.model';
import { Venta, VentaDetalle } from 'src/app/shared/models/venta.model';

@Component({
  selector: 'app-compra-en-linea-paso-uno',
  templateUrl: './compra-en-linea-paso-uno.component.html',
  styleUrls: ['./compra-en-linea-paso-uno.component.scss']
})
export class CompraEnLineaPasoUnoComponent implements OnInit {
    @ViewChild('producto') elmP?: AutoComplete;

    item?: Venta;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;
    detalle: VentaDetalle[] = [];
    listaProductosFiltrados: ProductoResumen[] = [];
    detalleSeleccionado?: VentaDetalle;
    listaProductos: ProductoResumen[] = [];
    categorias!: Categoria[];
    displayResponsive: boolean = false;

    constructor(
    private fb: FormBuilder,
    private informationService: InformationService,
    private prodcutoService: ProductosService,
    private sessionService: SessionService,
    public dialogService: DialogService,
    private router: Router,
    private datepipe: DatePipe,
    private helperService: HelperService,
    private categoriasService: CategoriasService,
    ) { }

  ngOnInit(): void {
    const busqueda = {idEmpresa : this.sessionService.getSessionUserData().idEmpresa, idsCategorias: this.sessionService.getSessionUserData().categorias }
    this.categoriasService.get(busqueda).subscribe({
        next: (res) => {
            this.categorias = res.content;
        },
        error: (err) => {
            this.informationService.showError(err.error.message);
        },
    });


    if (this.sessionService.getRegistroVenta() != null) {
        this.item = this.sessionService.getRegistroVenta();
    }

    this.itemForm = this.fb.group({
        producto: [null],
        idSucursal: [this.item?.idSucursal],
        total: [{ value: this.item?.total ?? 0, disabled: true }],
        descuentoAdicional: [0, Validators.required, ],
        totalSujetoIva: [ { value: this.item?.totalSujetoIva ?? 0, disabled: true }, ],
    });

    this.detalle = this.item?.detalle ?? [];

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
        this.elmP?.focusInput();
    }, 500);
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    getDetalleSubtotal(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.subtotal)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    getDetalleDescuento(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.descuento)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    getDetalleTotal(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.total)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    getTotalSujetoIva() {
        let valor =
            this.getDetalleTotal() - this.itemForm.value.descuentoAdicional;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }


    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/site/compras-en-linea']);
        } else {
            if (!this.itemForm.valid) {
                console.log(this.itemForm);
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos un producto a la compra'
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
                if (element.precio<=0){
                    existeItemError ='El precio del producto ' +element.producto +', debe ser mayor a 0 ';
                    return;
                }
                if (element.descuento  <0){
                    existeItemError ='El descuento del producto ' +element.producto +', debe ser mayor o igual a 0 ';
                    return;
                }
                if (element.total <=0 ) {
                    existeItemError ='El total del producto ' +element.producto +', debe ser mayor a 0 ';
                    return;
                }
            });

            if (existeItemError) {
                this.informationService.showWarning(existeItemError);
                return;
            }

            if (
                this.itemForm.controls['descuentoAdicional'].value >=
                this.getDetalleTotal()
            ) {
                this.informationService.showWarning(
                    'El Descuento adicional no puede ser mayor o igual al Total'
                );
                return;
            }
            if (this.getTotalSujetoIva() < 0) {
                this.informationService.showWarning(
                    'El total sujeto a iva no puede ser menor a 0'
                );
                return;
            }

            this.actualizarVentaSession();
            this.router.navigate(['/site/compra-en-linea-por-pasos/compra-en-linea-paso-dos',]);
        }
    }

    actualizarVentaSession(){
        const venta: Venta = {
            ...this.item,
            id: 0,
            idSucursal: this.itemForm.controls['idSucursal'].value ?? this.sessionService.getSessionUserData().idSucursal,
            idEstadoVenta: 0,
            idTipoVenta: 0,
            diasCredito: 0,
            total: this.getDetalleTotal(),
            descuentoAdicional: this.itemForm.controls['descuentoAdicional'].value,
            totalSujetoIva: this.getTotalSujetoIva(),
            detalle: this.detalle,
            itemsEliminados: null,
        };

        this.sessionService.setRegistroVenta(venta);
    }

    prevPage() {
        this.backClicked = true;
    }

    public onSave(): void {
        this.backClicked = false;
    }

	onEditComplete(event: any) {
        this.calcularFila(event.data);
    }

    calcularFila(row: VentaDetalle) {
        const elementIndex = this.detalle.findIndex(
            (obj) => obj.codigoProducto === row.codigoProducto && obj.codigoStock===row.codigoStock
        );
        if (!row.precio) {
            row.precio = 0;
        }
        if (!row.cantidad) {
            row.cantidad = 0;
        }
        if (!row.descuento) {
            row.descuento = 0;
        }
        let subtotal = row.precio * row.cantidad;
        subtotal = this.helperService.round(subtotal, adm.NUMERO_DECIMALES);
        this.detalle[elementIndex].subtotal = subtotal;


        let descuento = row.descuento;
        if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_PORCENTAJE){
            descuento = subtotal* row.valorDescuento! /100;
        }
        if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_MONTO){
            descuento = row.valorDescuento! * row.cantidad;
        }

        descuento = this.helperService.round(descuento, adm.NUMERO_DECIMALES);
        this.detalle[elementIndex].descuento = descuento;

        //this.detalle[elementIndex].total = this.helperService.round((row.precio * row.cantidad - descuento), adm.NUMERO_DECIMALES);
        this.detalle[elementIndex].total = this.helperService.round((subtotal - descuento), adm.NUMERO_DECIMALES);
    }

    addItem(producto: ProductoResumen) {
        const existeProducto = producto.saldo ?
        this.detalle.find(
            (x) => x.codigoProducto === producto.codigoProducto && x.codigoStock===producto.saldo?.codigoStock
        ):
        this.detalle.find(
            (x) => x.codigoProducto === producto.codigoProducto
        );

        const esConInventario = producto.idTipoProducto===spv.TIPO_PRODUCTO_CON_INVENTARIO;
            console.log(producto);

        /*if (esConInventario && (!producto.saldo || producto.saldo.saldo!<=0)) {
            this.informationService.showWarning(
                'El producto no tiene saldo existente'
            );
            return;
        }*/

        if (existeProducto) {
            existeProducto.cantidad = existeProducto.cantidad+1;
            this.calcularFila(existeProducto);
            this.actualizarVentaSession();
            return;
        }


        const precio = esConInventario ? producto.saldo?.precioVenta! :producto.precio ;
        let descuento = 0;
        if (producto.descuento ){
            if (esConInventario){
                if (!this.esDescuentoPorcentaje(producto.descuento.idTipoDescuento!)){
                    descuento = producto.descuento.descuentoEstablecido!;
                }
                else{
                    let tempDescuento = precio * producto.descuento.descuentoEstablecido! /100;
                    descuento = this.helperService.round(tempDescuento, adm.NUMERO_DECIMALES);
                }
            }else{
                descuento = producto.descuento.descuento;
            }
        }

        const item: VentaDetalle = {
            idProducto: producto.id,
            codigo: '',
            codigoProducto: producto.codigoProducto,
            producto: producto.nombre,
            cantidad: 1,
            precio: precio,
            subtotal: precio,
            descuento: descuento,
            total: precio - descuento,
            idTipoDescuento: producto.descuento ? producto.descuento.idTipoDescuento : spv.TIPO_DESCUENTO_TOTAL,
            valorDescuento: producto.descuento ? producto.descuento.descuentoEstablecido : 0,
            codigoStock: producto.saldo?.codigoStock,
            idTipoProducto: producto.idTipoProducto,
        };
        this.detalle.push(item);
        this.itemForm.patchValue({ producto: null });
        this.elmP?.focusInput();
        this.actualizarVentaSession();
    }

     // producto
     reduceItem(row: VentaDetalle): void {
        const existeProducto = this.detalle.find( (x) => x.codigoProducto === row.codigoProducto);
        if (existeProducto && existeProducto.cantidad>1) {
            existeProducto.cantidad = existeProducto.cantidad-1;
            this.calcularFila(row);
            this.actualizarVentaSession();
            return;
        }
      }

    esDescuentoPorcentaje(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_PORCENTAJE;
    }

    esDescuentoTotal(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_TOTAL;
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter((x) =>{ return !(x.codigoStock === item.codigoStock && x.codigoProducto === item.codigoProducto)});
        this.actualizarVentaSession();
    }

    filtrarProducto(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarProducto(query);
    }

    seleccionarProducto(event: any) {
        this.addItem(event);
    }

    buscarProducto(termino: string) {
        const criteriosBusqueda: BusquedaProducto = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            termino: termino.trim(),
            cantidadRegistros: 15,
            resumen: true,
            idsTipoProducto: spv.TIPO_PRODUCTO_PRODUCTO+","+spv.TIPO_PRODUCTO_CON_INVENTARIO,
            idsCategorias : this.sessionService.getSessionUserData().categorias
        };

        this.prodcutoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                this.convertirSaldos(res.content);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

	cargarProductosPorCategoria(idCategoria: number){
        console.log(idCategoria);
            const criteriosBusqueda: BusquedaProducto = {
                idEmpresa: this.sessionService.getSessionEmpresaId(),
                idSucursal: this.sessionService.getSessionUserData().idSucursal,
                resumen: true,
                idsTipoProducto: spv.TIPO_PRODUCTO_PRODUCTO+","+spv.TIPO_PRODUCTO_CON_INVENTARIO,
                idsCategorias : idCategoria.toString()
            };

            this.prodcutoService.get(criteriosBusqueda).subscribe({
                next: (res) => {
                    this.convertirSaldos(res.content);
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

    }

    convertirSaldos(lista:any[]){
        if (lista.length == 0) {
            this.listaProductos = [];
            return;
        }
        let temporal: ProductoResumen[] = [];
        lista.forEach((element:any) => {
            if (element.saldos && element.saldos.length>0){
                element.saldos.forEach((saldo:any) => {
                    const prod: ProductoResumen ={...element}
                    const temp: SaldoProducto ={
                        idProducto:saldo.idProducto,
                        codigoStock:saldo.codigoStock,
                        precioCompra:saldo.precioCompra,
                        precioVenta:saldo.precioVenta,
                        saldo:saldo.saldo
                    }
                    prod.saldo = temp;
                    prod.codigoProductoStock = prod.codigoProducto+":"+prod.saldo?.codigoStock;
                    temporal.push(prod);
                });
            }
            else{
                let prod: ProductoResumen ={...element}
                prod.codigoProductoStock = prod.codigoProducto;
                temporal.push(prod);
            }
        });
        this.listaProductos = temporal
    }
}
