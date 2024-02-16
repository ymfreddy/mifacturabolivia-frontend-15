import { Component, OnInit, ViewChild } from '@angular/core';
import { Venta, VentaDetalle } from 'src/app/shared/models/venta.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Asociacion } from 'src/app/shared/models/session-usuario.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { spv } from 'src/app/shared/constants/spv';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { Router } from '@angular/router';
import { FormularioClienteComponent } from '../../../clientes/formulario-cliente/formulario-cliente.component';
import { FormularioProductoComponent } from '../../../productos/formulario-producto/formulario-producto.component';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { BusquedaCliente } from 'src/app/shared/models/busqueda-cliente.model';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';
import { ProductoResumen, SaldoProducto } from 'src/app/shared/models/producto.model';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { AutoComplete } from 'primeng/autocomplete';
import { MenuItem } from 'primeng/api';
import { CambioDescuentoComponent } from 'src/app/components/cambio-descuento/cambio-descuento.component';
import { environment } from 'src/environments/environment';
import { CambioDescuento } from 'src/app/shared/models/descuento.model';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { FormularioCotizacionComponent } from '../../../cotizaciones/formulario-cotizacion/formulario-cotizacion.component';
import { EnviarCotizacionWhatsappComponent } from 'src/app/components/enviar-cotizacion-whatsapp/enviar-cotizacion-whatsapp.component';

@Component({
    selector: 'app-venta-paso-uno',
    templateUrl: './venta-paso-uno.component.html',
    styleUrls: ['./venta-paso-uno.component.scss'],
})
export class VentaPasoUnoComponent implements OnInit {
    @ViewChild('cliente') elmC?: AutoComplete;
    @ViewChild('producto') elmP?: AutoComplete;

    item?: Venta;
    itemForm!: FormGroup;
    evento = "";

    submited = false;
    listaTipoVenta: Parametrica[] = [];
    listaAsociacion: Asociacion[] = [];

    detalle: VentaDetalle[] = [];
    detalleEliminado: number[] = [];

    listaProductosFiltrados: ProductoResumen[] = [];
    listaClientesFiltrados: Cliente[] = [];

    opcionesCotizacion: MenuItem[]=[];
    itemsMenu: MenuItem[]=[];
    detalleSeleccionado?: VentaDetalle;

    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private prodcutoService: ProductosService,
        private clienteService: ClientesService,
        private sessionService: SessionService,
        private parametricasService: ParametricasService,
        private ventaService: VentasService,
        public dialogService: DialogService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        this.itemsMenu = [
            {label: 'Cambiar Tipo Descuento', icon: 'pi pi-fw pi-star', command: () => this.changeDescuento(this.detalleSeleccionado!)},
        ];

        this.opcionesCotizacion = [
            {label: 'Generar', command: () => {
                console.log('generar');
                this.onCotizacion();
                this.onSubmit();
            }},
            {label: 'Cargar', command: () => {
                console.log('cargar')
            }}
        ];

        let temporalCliente: any;
        if (this.sessionService.getRegistroVenta() != null) {
            this.item = this.sessionService.getRegistroVenta();
            temporalCliente = {
                id: this.item?.idCliente,
                codigoCliente: this.item?.codigoCliente,
                email: this.item?.emailCliente,
                nombre: this.item?.nombreCliente,
            };
        }

        this.listaAsociacion = this.sessionService.getSessionAsociaciones();
        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_VENTA)
            .subscribe((data) => {
                this.listaTipoVenta = data as unknown as Parametrica[];
            });

        this.itemForm = this.fb.group({
            producto: [null],
            cliente: [temporalCliente, Validators.required],
            idCliente: [this.item?.idCliente],
            codigoCliente: [this.item?.codigoCliente],
            nombreCliente: [this.item?.nombreCliente],
            emailCliente: [this.item?.emailCliente],

            id: [{ value: this.item?.id ?? 0, disabled: true }],
            correlativo: [{ value: this.item?.correlativo, disabled: true }],
            idSucursal: [this.item?.idSucursal],
            fecha: [
                this.datepipe.transform(
                    this.item?.fecha ?? new Date(),
                    'dd/MM/yyyy'
                ) ?? '',
            ],
            diasCredito: [
                {
                    value: this.item?.diasCredito ?? 0,
                    disabled: this.item?.idTipoVenta != spv.TIPO_VENTA_CREDITO,
                },
                Validators.required,
            ],
            idTipoVenta: [
                {
                    value:this.item?.idTipoVenta ?? spv.TIPO_VENTA_CONTADO,
                    disabled: !environment.ventasCredito
                },
                Validators.required,
            ],
            idEstadoVenta: [
                this.item?.idEstadoVenta ?? spv.ESTADO_VENTA_PEDIDO,
                Validators.required,
            ],
            total: [{ value: this.item?.total ?? 0, disabled: true }],
            descuentoAdicional: [
                this.item?.descuentoAdicional ?? 0,
                Validators.required,
            ],
            totalSujetoIva: [
                { value: this.item?.totalSujetoIva ?? 0, disabled: true },
            ],
            idMesa: [this.item?.idMesa],
        });

        this.detalle = this.item?.detalle ?? [];
    }

    changeDescuento(detalleSeleccionado: VentaDetalle): void {
        const cambio : CambioDescuento = {
            codigoProducto: detalleSeleccionado.codigoProducto!,
            idTipoDescuento : detalleSeleccionado.idTipoDescuento!,
            descuentoEstablecido : detalleSeleccionado.valorDescuento!,
            descuento: detalleSeleccionado.descuento
        }
        const ref = this.dialogService.open(CambioDescuentoComponent, {
            header: 'Descuento Item',
            width: '400px',
            data: cambio,
        });
        ref.onClose.subscribe((res: CambioDescuento) => {
            if (res) {
                let objIndex = this.detalle.findIndex((obj => obj.codigoProducto == res.codigoProducto));
                this.detalle[objIndex].idTipoDescuento = res.idTipoDescuento;
                this.detalle[objIndex].valorDescuento = res.descuentoEstablecido;
                this.detalle[objIndex].descuento = res.descuento;
                this.calcularFilas();
            }
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.elmC?.focusInput();
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
        if (this.evento==='atras') {
            this.router.navigate(['/adm/ventas']);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos un producto a la venta'
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
            if (
                this.itemForm.controls['idTipoVenta'].value ==
                    spv.TIPO_VENTA_CREDITO &&
                this.itemForm.controls['diasCredito'].value <= 0
            ) {
                this.informationService.showWarning(
                    'Los días de crédito debe ser mayor a 0'
                );
                return;
            }

            if (
                this.itemForm.controls['idTipoVenta'].value ==
                    spv.TIPO_VENTA_CONTADO &&
                this.itemForm.controls['diasCredito'].value > 0
            ) {
                this.informationService.showWarning(
                    'Los días de crédito debe ser 0'
                );
                return;
            }

            const venta: Venta = {
                ...this.item,
                id: this.itemForm.controls['id'].value,
                idSucursal:
                    this.itemForm.controls['idSucursal'].value ??
                    this.sessionService.getSessionUserData().idSucursal,
                idCliente: this.itemForm.controls['idCliente'].value,
                codigoCliente: this.itemForm.controls['codigoCliente'].value,
                nombreCliente: this.itemForm.controls['nombreCliente'].value,
                emailCliente: this.itemForm.controls['emailCliente'].value,
                idEstadoVenta: this.itemForm.controls['idEstadoVenta'].value,
                idTipoVenta: this.itemForm.controls['idTipoVenta'].value,
                diasCredito: this.itemForm.controls['diasCredito'].value,
                total: this.getDetalleTotal(),
                descuentoAdicional:
                    this.itemForm.controls['descuentoAdicional'].value,
                totalSujetoIva: this.getTotalSujetoIva(),
                idMesa:
                    this.itemForm.controls['idMesa'].value,
                detalle: this.detalle,
                itemsEliminados:
                    this.detalleEliminado.length == 0
                        ? null
                        : this.detalleEliminado,
            };

            if (this.evento==='cotizar'){
                const ref = this.dialogService.open(FormularioCotizacionComponent, {
                    header: 'Cotizar',
                    width: '400px',
                    data: { item: venta },
                });
                ref.onClose.subscribe((res) => {
                    if (res) {
                        // mostrar  envio por wahtsapp
                        /*const ref = this.dialogService.open(EnviarCotizacionWhatsappComponent, {
                            header: 'Enviar Cotización por WhatsApp',
                            width: '300px',
                            data: res,
                        });
                        ref.onClose.subscribe((res) => {});*/
                    }
                });
            }
            else{
                this.submited = true;
                if (venta.id > 0) {
                    // se verifica si existen cambios para realizar la actualizacion
                    const nuevo = JSON.stringify(venta).toString();
                    const session = JSON.stringify(
                        this.sessionService.getRegistroVenta()
                    );
                    if (nuevo == session) {
                        //console.log('SIN CAMBIOS');
                        this.router.navigate([
                            '/adm/venta-por-pasos/venta-paso-dos',
                        ]);
                    } else {
                        //console.log('nuevo: ', nuevo);
                        //console.log('session: ',session);
                        //console.log('EXISTE CAMBIOS Y SE ACTUALIZA');
                        this.ventaService.edit(venta).subscribe({
                            next: (res) => {
                                this.sessionService.setRegistroVenta(res.content);
                                this.informationService.showSuccess(res.message);
                                this.router.navigate([
                                    '/adm/venta-por-pasos/venta-paso-dos',
                                ]);
                                this.submited = false;
                            },
                            error: (err) => {
                                this.informationService.showError(
                                    err.error.message
                                );
                                this.submited = false;
                            },
                        });
                    }
                } else {
                    this.ventaService.add(venta).subscribe({
                        next: (res) => {
                            this.sessionService.setRegistroVenta(res.content);
                            this.informationService.showSuccess(res.message);
                            this.router.navigate([
                                '/adm/venta-por-pasos/venta-paso-dos',
                            ]);
                            this.submited = false;
                        },
                        error: (err) => {
                            this.informationService.showError(err.error.message);
                            this.submited = false;
                        },
                    });
                }
            }
        }
    }

    canbioTipoVenta(event: any) {
        if (event.value == spv.TIPO_VENTA_CONTADO) {
            this.itemForm.patchValue({ diasCredito: 0 });
            this.itemForm.controls['diasCredito'].disable();
        } else {
            this.itemForm.controls['diasCredito'].enable();
        }
    }

    prevPage() {
        this.evento = "atras";
    }

    onSave(): void {
        this.evento = "siguiente";
    }

    onCotizacion(): void {
        this.evento = "cotizar";
    }

    onEditComplete(event: any) {
        console.log(event);
        this.calcularFilas();
    }

    calcularFilas() {
        console.log('calcula filas');
        this.detalle.forEach(row => {
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
            row.subtotal = subtotal;


            let descuento = row.descuento;
            if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_PORCENTAJE){
                descuento = subtotal* row.valorDescuento! /100;
            }
            if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_MONTO){
                descuento = row.valorDescuento! * row.cantidad;
            }

            descuento = this.helperService.round(descuento, adm.NUMERO_DECIMALES);
            row.descuento = descuento;

            //this.detalle[elementIndex].total = this.helperService.round((row.precio * row.cantidad - descuento), adm.NUMERO_DECIMALES);
            row.total = this.helperService.round((subtotal - descuento), adm.NUMERO_DECIMALES);
        });
        /*const elementIndex = this.detalle.findIndex(
            (obj) => obj.codigoProducto === row.codigoProducto && obj.codigoStock===row.codigoStock
        );*/

    }

    // producto
    addItem(producto: ProductoResumen) {
        const existeProducto = this.detalle.find(
            (x) => x.codigoProducto === producto.codigoProducto && x.codigoStock===producto.saldo?.codigoStock
        );
        if (existeProducto) {
            this.informationService.showWarning(
                'El producto ya está adicionado'
            );
            this.itemForm.patchValue({ producto: null });
            return;
        }
        const esConInventario = producto.idTipoProducto===spv.TIPO_PRODUCTO_CON_INVENTARIO;

        if (esConInventario && (!producto.saldo || producto.saldo.saldo!<=0)) {
            this.informationService.showWarning(
                'El producto no tiene saldo existente'
            );
            this.itemForm.patchValue({ producto: null });
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
            codigoStock: producto.saldo?.codigoStock
        };
        this.detalle.push(item);
        this.itemForm.patchValue({ producto: null });
        this.elmP?.focusInput();
    }

    esDescuentoPorcentaje(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_PORCENTAJE;
    }

    esDescuentoTotal(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_TOTAL;
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter((x) =>{ return !(x.codigoStock === item.codigoStock && x.codigoProducto === item.codigoProducto)});
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
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
            //cantidadRegistros: 10,
            resumen: true,
            idsCategorias : this.sessionService.getSessionUserData().categorias
        };

        this.prodcutoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaProductosFiltrados = [];
                    return;
                }
                let temporal: ProductoResumen[] = [];
                res.content.forEach((element:any) => {
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
                this.listaProductosFiltrados = temporal
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    // cliente
    adicionarNuevoCliente() {
        const ref = this.dialogService.open(FormularioClienteComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { idEmpresa: this.sessionService.getSessionEmpresaId()},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.seleccionarCliente(res);
            }
        });
    }

    actualizarCliente() {
        if (!this.itemForm.controls['cliente'].value) {
            this.informationService.showWarning(
                'Debe seleccionar un cliente para actualizar'
            );
            return;
        }

        this.clienteService
            .getById(this.itemForm.controls['cliente'].value.id)
            .subscribe({
                next: (res) => {
                    const ref = this.dialogService.open(
                        FormularioClienteComponent,
                        {
                            header: 'Actualizar',
                            width: '80%',
                            data: { idEmpresa: this.sessionService.getSessionEmpresaId(), item: res.content },
                        }
                    );
                    ref.onClose.subscribe((res2) => {
                        if (res2) {
                            this.seleccionarCliente(res2);
                        }
                    });
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
    }

    filtrarCliente(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarCliente(query);
    }

    mostrarPresupuesto(){
        //return this.sessionService.getSessionUserData().empresaNit===415549020 || this.sessionService.getSessionUserData().empresaNit===5556875011;
        return this.sessionService.getSessionEmpresaNit()===415549020;
    }

    esConDescripcionAdicional() {
        return this.sessionService.getSessionUserData().descripcionAdicionalProducto;
    }

    buscarCliente(termino: string) {
        const criteriosBusqueda: BusquedaCliente = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
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
        this.itemForm.patchValue({ cliente: event });
        this.itemForm.patchValue({ idCliente: event?.id });
        this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
        this.itemForm.patchValue({ nombreCliente: event?.nombre });
        this.itemForm.patchValue({ emailCliente: event?.email });
        this.elmP?.focusInput();
    }

    limpiarCliente() {
        this.itemForm.patchValue({ cliente: null });
        this.itemForm.patchValue({ idCliente: '' });
        this.itemForm.patchValue({ codigoCliente: '' });
        this.itemForm.patchValue({ nombreCliente: '' });
        this.itemForm.patchValue({ emailCliente: '' });
        this.elmC?.focusInput();
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}
