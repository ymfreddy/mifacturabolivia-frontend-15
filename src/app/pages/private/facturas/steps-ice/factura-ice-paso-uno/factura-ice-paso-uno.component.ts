import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';
import { Producto } from 'src/app/shared/models/producto.model';
import {
    Cabecera,
    Detalle,
    Factura,
    FacturaRecepcion,
} from 'src/app/shared/models/factura-recepcion.model';
import { AutoComplete } from 'primeng/autocomplete';
import { MenuItem } from 'primeng/api';
import { CambioDescuentoComponent } from 'src/app/components/cambio-descuento/cambio-descuento.component';
import { spv } from 'src/app/shared/constants/spv';
import { CambioDescuento } from 'src/app/shared/models/descuento.model';
import { FormularioProductoComponent } from '../../../productos/formulario-producto/formulario-producto.component';
import { HelperService } from '../../../../../shared/helpers/helper.service';
import { DatosFacturaIceComponent } from 'src/app/components/datos-factura-ice/datos-factura-ice.component';
import { FormularioProductoIceComponent } from '../../../productos/formulario-producto-ice/formulario-producto-ice.component';


@Component({
  selector: 'app-factura-ice-paso-uno',
  templateUrl: './factura-ice-paso-uno.component.html',
  styleUrls: ['./factura-ice-paso-uno.component.scss']
})
export class FacturaIcePasoUnoComponent implements OnInit {
    @ViewChild('producto') elmP?: AutoComplete;

    item?: FacturaRecepcion;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;

    listaProductosFiltrados: Producto[] = [];
    detalle: Detalle[] = [];

    itemsMenu: MenuItem[]=[];
    detalleSeleccionado?: Detalle;

    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private prodcutoService: ProductosService,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        this.itemsMenu = [
            {label: 'Cambiar Tipo Descuento', icon: 'pi pi-fw pi-star', command: () => this.changeDescuento(this.detalleSeleccionado!)},
        ];

        if (!this.sessionService.getRegistroFacturaRecepcion()) {
            this.router.navigate(['/adm/facturas']);
        }

        this.item = this.sessionService.getRegistroFacturaRecepcion();

        this.itemForm = this.fb.group({
            producto: [null],
            fecha: [this.datepipe.transform(new Date(), 'dd/MM/yyyy')],
            montoTotal: [
                { value: this.item?.factura?.cabecera?.montoTotal ?? 0, disabled: true },
            ],
            descuentoAdicional: [
                this.item?.factura?.cabecera?.descuentoAdicional ?? 0,
                Validators.required,
            ],
            montoTotalSujetoIva: [
                {
                    value: this.item?.factura?.cabecera?.montoTotalSujetoIva ?? 0,
                    disabled: true,
                },
            ],
        });

        this.detalle = this.item?.factura?.detalle ?? [];
    }

    changeDescuento(detalleSeleccionado: Detalle): void {
        const cambio : CambioDescuento = {
            codigoProducto: detalleSeleccionado.codigoProducto!,
            idTipoDescuento : detalleSeleccionado.idTipoDescuento!,
            descuentoEstablecido : detalleSeleccionado.valorDescuento!,
            descuento: detalleSeleccionado.montoDescuento
        }
        const ref = this.dialogService.open(CambioDescuentoComponent, {
            header: 'Descuento Item',
            width: '400px',
            data: cambio,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.detalle.findIndex((obj => obj.codigoProducto == res.codigoProducto));
                this.detalle[objIndex].idTipoDescuento = res.idTipoDescuento;
                this.detalle[objIndex].valorDescuento = res.descuentoEstablecido;
                this.detalle[objIndex].montoDescuento = res.descuento;
                this.calcularFila(this.detalle[objIndex]);
                this.guardarDatossession();
            }
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.elmP?.focusInput();
        }, 500);
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    getDetalleMonto(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.monto)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES_ICE)
        }

        return 0;
    }

    getDetalleDescuento(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.montoDescuento)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES_ICE)
        }

        return 0;
    }

    getDetalleSubTotal(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.subTotal)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum,adm.NUMERO_DECIMALES);
        }

        return 0;
    }

    getDetalleMontoIceEspecifico(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.montoIceEspecifico!)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum,adm.NUMERO_DECIMALES_ICE);
        }

        return 0;
    }

    getDetalleMontoIcePorcentual(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.montoIcePorcentual!)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum,adm.NUMERO_DECIMALES_ICE);
        }

        return 0;
    }

    getMontoTotal() {
        let valor =
            this.getDetalleSubTotal() - this.itemForm.value.descuentoAdicional;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    getMontoIceEspecificoTotal() {
        let valor = this.getDetalleMontoIceEspecifico();
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    getMontoIcePorcentualTotal() {
        let valor = this.getDetalleMontoIcePorcentual();
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    getMontoTotalSujetoIva() {
        let valor = this.getDetalleSubTotal() - this.itemForm.value.descuentoAdicional - this.getMontoIceEspecificoTotal() - this.getMontoIcePorcentualTotal();
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/adm/facturas']);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos un producto a la factura'
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
                if (element.precioUnitario<=0){
                    existeItemError ='El precio del producto ' +element.producto +', debe ser mayor a 0 ';
                    return;
                }
                if (element.montoDescuento  <0){
                    existeItemError ='El descuento del producto ' +element.producto +', debe ser mayor o igual a 0 ';
                    return;
                }
                if (element.subTotal <=0 ) {
                    existeItemError ='El subtotal del producto ' +element.producto +', debe ser mayor a 0 ';
                    return;
                }
                var lgnDescAdicional = element.descripcionAdicional ? element.descripcionAdicional.length : 0;
                if((element.producto!.length + lgnDescAdicional)>500){
                    existeItemError ='El nombre y la descripción adicional no deben ser más de 500 caracteres';
                    return;
                }
            });

            if (existeItemError) {
                this.informationService.showWarning(existeItemError);
                return;
            }

            if (
                this.itemForm.controls['descuentoAdicional'].value >=
                this.getDetalleSubTotal()
            ) {
                this.informationService.showWarning(
                    'El Descuento adicional no puede ser mayor o igual al Sub Total'
                );
                return;
            }
            if (this.getMontoTotal() < 0) {
                this.informationService.showWarning(
                    'El monto total no puede ser menor a 0'
                );
                return;
            }

            this.guardarDatossession();
            this.router.navigate(['/adm/factura-ice-por-pasos/factura-ice-paso-dos']);
        }
    }

    // producto
    buscarProducto(termino: string) {
        const criteriosBusqueda: BusquedaProducto = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
            idsTipoProducto: spv.TIPO_PRODUCTO_PRODUCTO+","+spv.TIPO_PRODUCTO_SERVICIO_HOTEL_TURISMO,
            idsCategorias : this.sessionService.getSessionUserData().categorias
        };

        this.prodcutoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaProductosFiltrados = [];
                    return;
                }
                this.listaProductosFiltrados = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    adicionarNuevoProducto() {
        const ref = this.dialogService.open(FormularioProductoIceComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { idEmpresa: this.sessionService.getSessionEmpresaId(), nitEmpresa: this.sessionService.getSessionEmpresaNit() },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.addItem(res);
            }
        });
    }

    addItem(producto: Producto) {
        const existeProducto = this.detalle.find(
            (x) => x.codigoProducto === producto.codigoProducto
        );
        if (existeProducto) {
            this.informationService.showWarning(
                'El producto ya está adicionado'
            );
            return;
        }

        const precio = producto.precioIce ?? 0;
        const detalle: Detalle = {
            codigoProducto: producto.codigoProducto,
            producto: producto.nombre,
            cantidad: 1,
            precioUnitario: precio,
            monto: precio,
            montoDescuento: producto.descuento ? producto.descuento.descuento : 0,
            subTotal: precio - (producto.descuento ? producto.descuento.descuento : 0),
            idTipoDescuento: producto.descuento ? producto.descuento.idTipoDescuento : spv.TIPO_DESCUENTO_TOTAL,
            valorDescuento: producto.descuento ? producto.descuento.descuentoEstablecido : 0,

            marcaIce: 2,
            alicuotaIva: 0,
            precioNetoVentaIce: 0,
            alicuotaEspecifica: 0,
            alicuotaPorcentual: 0,
            montoIceEspecifico: 0,
            montoIcePorcentual: 0,
            cantidadIce: 0
        };

        this.itemForm.patchValue({ producto: null });
        this.listaProductosFiltrados = [];

        this.detalle.push(detalle);
        this.elmP?.focusInput();
        this.guardarDatossession();

        // mostrar el formulario para datos adicionales
            /*const ref = this.dialogService.open(DatosFacturaIceComponent, {
                header: 'Datos Adicionales',
                width: '80%',
                data: detalle,
                modal: true,
            });
            ref.onClose.subscribe((res) => {
                if (res) {
                    if (res && res.detalleHuespedes && res.detalleHuespedes.length>0){
                        this.detalle.push(res);
                        this.elmP?.focusInput();
                        this.guardarDatossession();
                    }
                }
            });*/

    }

    editItemIce(item: any) {
        const ref = this.dialogService.open(DatosFacturaIceComponent, {
            header: 'Datos Adicionales',
            width: '80%',
            data: item,
            modal: true,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.detalle.findIndex((obj => obj.codigoProducto == res.codigoProducto));
                this.detalle[objIndex]=res;
                this.calcularFila(this.detalle[objIndex]);
                this.guardarDatossession();
            }
        });
    }

    esDescuentoPorcentaje(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_PORCENTAJE;
    }

    esDescuentoTotal(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_TOTAL;
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter(
            (x) => x.codigoProducto != item.codigoProducto
        );
    }

    prevPage() {
        this.backClicked = true;
    }

    onSave(): void {
        this.backClicked = false;
    }

    onEditComplete(event: any) {
        this.calcularFila(event.data);
        this.guardarDatossession();
    }

    calcularFila(row: any) {
        const elementIndex = this.detalle.findIndex(
            (obj) => obj.codigoProducto == row.codigoProducto
        );
        if (!row.precioUnitario) {
            row.precioUnitario = 0;
        }
        if (!row.cantidad) {
            row.cantidad = 0;
        }
        if (!row.montoDescuento) {
            row.montoDescuento = 0;
        }
        let monto = row.precioUnitario * row.cantidad;
        monto = this.helperService.round(monto, adm.NUMERO_DECIMALES_ICE);
        this.detalle[elementIndex].monto = monto;

        let montoDescuento = row.montoDescuento;
        if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_PORCENTAJE){
            montoDescuento = monto* row.valorDescuento! /100;
        }
        if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_MONTO){
            montoDescuento = row.valorDescuento! * row.cantidad;
        }

        montoDescuento = this.helperService.round(montoDescuento, adm.NUMERO_DECIMALES_ICE);
        this.detalle[elementIndex].montoDescuento = montoDescuento;

        let montoIcePorcentual = 0;
        let montoIceEspecifico = 0;
        if (row.marcaIce==1){
            let alicuotaIva = this.helperService.round((row.precioUnitario * row.cantidad - montoDescuento)*0.13, adm.NUMERO_DECIMALES_ICE);
            let precioNetoVentaIce = this.helperService.round((row.precioUnitario * row.cantidad- montoDescuento)-alicuotaIva, adm.NUMERO_DECIMALES_ICE);

            let cantidadIce = row.cantidadIce;
            let alicuotaPorcentual = row.alicuotaPorcentual;
            let alicuotaEspecifica = row.alicuotaEspecifica;

            this.detalle[elementIndex].alicuotaIva = alicuotaIva;
            this.detalle[elementIndex].precioNetoVentaIce = precioNetoVentaIce;

            montoIcePorcentual = this.helperService.round((precioNetoVentaIce * alicuotaPorcentual), adm.NUMERO_DECIMALES_ICE);
            montoIceEspecifico = this.helperService.round((cantidadIce * alicuotaEspecifica), adm.NUMERO_DECIMALES_ICE);

            this.detalle[elementIndex].montoIcePorcentual = montoIcePorcentual;
            this.detalle[elementIndex].montoIceEspecifico = montoIceEspecifico;
        }
        else{
            this.detalle[elementIndex].alicuotaIva = 0;
            this.detalle[elementIndex].precioNetoVentaIce = 0;
            this.detalle[elementIndex].alicuotaEspecifica = 0;
            this.detalle[elementIndex].alicuotaPorcentual = 0;
            this.detalle[elementIndex].cantidadIce = 0;
            this.detalle[elementIndex].montoIcePorcentual = 0;
            this.detalle[elementIndex].montoIceEspecifico = 0;
        }

        //this.detalle[elementIndex].subTotal = this.helperService.round((row.precioUnitario * row.cantidad - montoDescuento), adm.NUMERO_DECIMALES_ICE);
        this.detalle[elementIndex].subTotal = this.helperService.round((monto- montoDescuento)+ montoIcePorcentual + montoIceEspecifico, adm.NUMERO_DECIMALES_ICE);
    }

    filtrarProducto(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarProducto(query);
    }

    seleccionarProducto(event: any) {
        console.log(event);
        this.addItem(event);
    }

    guardarDatossession() {
        const cabecera: Cabecera = {
            ...this.item?.factura?.cabecera,
            descuentoAdicional: this.itemForm.controls['descuentoAdicional'].value,
            montoTotal: this.getMontoTotal(),
            montoTotalMoneda: this.getMontoTotal(),
            montoTotalSujetoIva: this.getMontoTotalSujetoIva(),
            montoIceEspecifico:  this.getMontoIceEspecificoTotal(),
            montoIcePorcentual:  this.getMontoIcePorcentualTotal()
        };

        const factura: Factura = {
            cabecera: cabecera,
            detalle: this.detalle,
        }

        this.item!.factura = factura;
        this.sessionService.setRegistroFacturaRecepcion(this.item!);
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    esConDescripcionAdicional() {
        return this.sessionService.getSessionUserData().descripcionAdicionalProducto;
    }
}
