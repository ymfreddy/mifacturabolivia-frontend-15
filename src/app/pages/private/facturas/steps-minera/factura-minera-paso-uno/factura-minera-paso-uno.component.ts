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
    DatoEspecifico,
    Detalle,
    DetalleHuesped,
    Factura,
    FacturaRecepcion,
} from 'src/app/shared/models/factura-recepcion.model';
import { AutoComplete } from 'primeng/autocomplete';
import { sfe } from 'src/app/shared/constants/sfe';
import { MenuItem } from 'primeng/api';
import { spv } from 'src/app/shared/constants/spv';
import { FormularioProductoComponent } from '../../../productos/formulario-producto/formulario-producto.component';
import { HelperService } from '../../../../../shared/helpers/helper.service';
import { DatosFacturaMineraComponent } from 'src/app/components/datos-factura-minera/datos-factura-minera.component';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';


@Component({
  selector: 'app-factura-minera-paso-uno',
  templateUrl: './factura-minera-paso-uno.component.html',
  styleUrls: ['./factura-minera-paso-uno.component.scss']
})
export class FacturaMineraPasoUnoComponent implements OnInit {
    @ViewChild('producto') elmP?: AutoComplete;

    item?: FacturaRecepcion;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;

    listaProductosFiltrados: Producto[] = [];
    detalle: Detalle[] = [];

    itemsMenu: MenuItem[]=[];
    detalleSeleccionado?: Detalle;

    listaPais: ParametricaSfe[] = [];
    listaMoneda: ParametricaSfe[] = [];

    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private prodcutoService: ProductosService,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService,
        private parametricasSfeService: ParametricasSfeService,
    ) {}

    ngOnInit(): void {
        // this.itemsMenu = [
        //     {label: 'Cambiar Tipo Descuento', icon: 'pi pi-fw pi-star', command: () => this.changeDescuento(this.detalleSeleccionado!)},
        // ];

        if (!this.sessionService.getRegistroFacturaRecepcion()) {
            this.router.navigate(['/adm/facturas']);
        }

        this.item = this.sessionService.getRegistroFacturaRecepcion();

        this.parametricasSfeService.getTipoPais().subscribe((data) => {
            this.listaPais = data as unknown as ParametricaSfe[];
        });
        this.parametricasSfeService.getTipoMoneda().subscribe((data) => {
            this.listaMoneda = data as unknown as ParametricaSfe[];
        });

        this.itemForm = this.fb.group({
            producto: [null],
            fecha: [this.datepipe.transform(new Date(), 'dd/MM/yyyy')],
            montoTotal: [{ value: this.item?.factura?.cabecera?.montoTotal ?? 0, disabled: true },],
            descuentoAdicional: [this.item?.factura?.cabecera?.descuentoAdicional ?? 0, Validators.required,],
            montoTotalSujetoIva: [{ value: this.item?.factura?.cabecera?.montoTotalSujetoIva ?? 0, disabled: true,},],
            tipoCambio: [this.item?.factura?.cabecera?.tipoCambio ?? sfe.TIPO_DE_CAMBIO_BOLIVIANO, [Validators.required, Validators.min(0.01)]],
            codigoMoneda: [this.item?.factura?.cabecera?.codigoMoneda ?? sfe.CODIGO_TIPO_MONEDA_BOLIVIANO, Validators.required],

            concentradoGranel: [this.item?.factura?.cabecera?.datosEspecificos?.concentradoGranel, Validators.required],
            origen: [this.item?.factura?.cabecera?.datosEspecificos?.origen, Validators.required],
            puertoTransito: [this.item?.factura?.cabecera?.datosEspecificos?.puertoTransito],
            puertoDestino: [this.item?.factura?.cabecera?.datosEspecificos?.puertoDestino],
            paisDestino: [this.item?.factura?.cabecera?.datosEspecificos?.paisDestino],

            incoterm: [this.item?.factura?.cabecera?.datosEspecificos?.incoterm, Validators.required],
            numeroLote: [this.item?.factura?.cabecera?.datosEspecificos?.numeroLote, Validators.required],
            gastosRealizacion: [this.item?.factura?.cabecera?.datosEspecificos?.gastosRealizacion ?? 0, [Validators.required, Validators.min(0.01)]],
            liquidacionPreliminar: [this.item?.factura?.cabecera?.datosEspecificos?.liquidacionPreliminar ?? 0],
            tipoCambioAnb: [this.item?.factura?.cabecera?.datosEspecificos?.tipoCambioAnb ?? 0, [Validators.required, Validators.min(0.01)]],
            kilosNetosHumedos: [this.item?.factura?.cabecera?.datosEspecificos?.kilosNetosHumedos ?? 0, [Validators.required, Validators.min(0.01)]],
            kilosNetosSecos: [this.item?.factura?.cabecera?.datosEspecificos?.kilosNetosSecos ?? 0, [Validators.required, Validators.min(0.01)]],
            humedadPorcentaje: [this.item?.factura?.cabecera?.datosEspecificos?.humedadPorcentaje ?? 0],
            humedadValor: [this.item?.factura?.cabecera?.datosEspecificos?.humedadValor ?? 0],
            mermaPorcentaje: [this.item?.factura?.cabecera?.datosEspecificos?.mermaPorcentaje ?? 0],
            mermaValor: [this.item?.factura?.cabecera?.datosEspecificos?.mermaValor ?? 0],
            otrosDatos: [this.item?.factura?.cabecera?.datosEspecificos?.otrosDatos],
            ruex: [this.item?.factura?.cabecera?.datosEspecificos?.ruex],
            nim: [this.item?.factura?.cabecera?.datosEspecificos?.nim],

            tasaEfectiva: [this.item?.factura?.cabecera?.datosEspecificos?.tasaEfectiva ?? sfe.TASA_EFECTIVA, Validators.required],
            //subtotal: [this.item?.factura?.cabecera?.datosEspecificos?.subTotal?? 0],
        });

        this.detalle = this.item?.factura?.detalle ?? [];
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
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    getDetalleDescuento(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.montoDescuento)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
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

    getMontoTotal() {
        let valor = this.getMontoTotalMoneda() * this.itemForm.value.tipoCambioAnb;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    getMontoTotalMoneda() {
        let valor = this.getDetalleSubTotal() - this.itemForm.value.gastosRealizacion;
        if (this.esFacturaVentaMineral())
            valor = valor +  + this.getIva() + this.itemForm.value.liquidacionPreliminar - this.itemForm.value.descuentoAdicional;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    getIva(): number {
        if (this.esFacturaComercializacionMinera()) {
            return 0;
        }

        let valor = (this.getDetalleSubTotal() - this.itemForm.value.gastosRealizacion) * this.itemForm.value.tasaEfectiva;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    getMontoTotalSujetoIva() {
        if (this.esFacturaComercializacionMinera()) {
            return 0;
        }

        let valor = this.getDetalleSubTotal() - this.itemForm.value.descuentoAdicional;
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

            /*if (this.esFacturaSeguros())
                this.router.navigate(['/adm/factura-por-pasos/factura-paso-dos-seguro']);
            else if (this.esFacturaTasaCero())
                this.router.navigate(['/adm/factura-por-pasos/factura-paso-dos-tasa-cero']);
            else*/
                this.router.navigate(['/adm/factura-minera-por-pasos/factura-minera-paso-dos']);
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
            idsTipoProducto: spv.TIPO_PRODUCTO_PRODUCTO.toString(),
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
        const ref = this.dialogService.open(FormularioProductoComponent, {
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

        const detalle: Detalle = {
            codigoProducto: producto.codigoProducto,
            producto: producto.nombre,
            cantidad: 1,
            precioUnitario: producto.precio,
            monto: producto.precio,
            montoDescuento: 0,
            subTotal: producto.precio,
            idTipoDescuento: spv.TIPO_DESCUENTO_TOTAL,
            valorDescuento: 0,
        };

        this.itemForm.patchValue({ producto: null });
        this.listaProductosFiltrados = [];

        // mostrar el formulario para datos adicionales

            const ref = this.dialogService.open(DatosFacturaMineraComponent, {
                header: 'Datos Adicionales',
                width: '80%',
                data: detalle,
                modal: true,
            });
            ref.onClose.subscribe((res) => {
                if (res) {
                    this.detalle.push(res);
                    this.elmP?.focusInput();
                    this.guardarDatossession();
                }
            });

    }

    editItemMinera(item: any) {
        const ref = this.dialogService.open(DatosFacturaMineraComponent, {
            header: 'Datos Adicionales',
            width: '80%',
            data: item,
            modal: true,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.detalle.findIndex((obj => obj.codigoProducto == res.codigoProducto));
                this.detalle[objIndex]=res;
            }
        });
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
        this.calcularFilas();
        this.guardarDatossession();
    }

    calcularFilas() {
        this.detalle.forEach(row => {
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
        row.monto = monto;

        row.subTotal = this.helperService.round(((row.precioUnitario * row.cantidad) - row.montoDescuento), adm.NUMERO_DECIMALES_ICE);
        //this.detalle[elementIndex].subTotal = this.helperService.round((monto), adm.NUMERO_DECIMALES_ICE);
      });
    }

    filtrarProducto(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarProducto(query);
    }

    seleccionarProducto(event: any) {
        this.addItem(event);
    }

    guardarDatossession() {
        const datosEspecificos: DatoEspecifico = {
            ...this.item?.factura?.cabecera.datosEspecificos,
            concentradoGranel: this.itemForm.controls['concentradoGranel'].value,
            origen: this.itemForm.controls['origen'].value,
            puertoTransito: this.itemForm.controls['puertoTransito'].value,
            puertoDestino: this.itemForm.controls['puertoDestino'].value,
            incoterm: this.itemForm.controls['incoterm'].value,
            numeroLote: this.itemForm.controls['numeroLote'].value,
            gastosRealizacion: this.itemForm.controls['gastosRealizacion'].value,
            liquidacionPreliminar: this.itemForm.controls['liquidacionPreliminar'].value,
            kilosNetosHumedos: this.itemForm.controls['kilosNetosHumedos'].value,
            kilosNetosSecos: this.itemForm.controls['kilosNetosSecos'].value,

            mermaPorcentaje: this.itemForm.controls['mermaPorcentaje'].value,
            mermaValor: this.itemForm.controls['mermaValor'].value,
            humedadPorcentaje: this.itemForm.controls['humedadPorcentaje'].value,
            humedadValor: this.itemForm.controls['humedadValor'].value,
            paisDestino: this.itemForm.controls['paisDestino'].value,
            otrosDatos: this.itemForm.controls['otrosDatos'].value,
            ruex: this.itemForm.controls['ruex'].value,
            nim: this.itemForm.controls['nim'].value,

            iva: this.getIva(),
            subTotal: this.getDetalleSubTotal(),
            tipoCambioAnb : this.itemForm.controls['tipoCambioAnb'].value,
        }
        const cabecera: Cabecera = {
            ...this.item?.factura?.cabecera,
            descuentoAdicional: this.itemForm.controls['descuentoAdicional'].value,
            montoTotal: this.getMontoTotal(),
            montoTotalMoneda: this.getMontoTotalMoneda(),
            montoTotalSujetoIva: this.getMontoTotalSujetoIva(),

            tipoCambio: this.itemForm.controls['tipoCambio'].value,
            codigoMoneda: this.itemForm.controls['codigoMoneda'].value,

            datosEspecificos: datosEspecificos
        };

        const factura: Factura = {
            cabecera: cabecera,
            detalle: this.detalle,
        }

        this.item!.factura = factura;
        console.log(this.item!);
        this.sessionService.setRegistroFacturaRecepcion(this.item!);
    }

    esFacturaVentaMineral(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_VENTA_MINERAL;
    }

    esFacturaComercializacionMinera(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_COMERCIALIZACION_EXPORTACION_MINERA;
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}
