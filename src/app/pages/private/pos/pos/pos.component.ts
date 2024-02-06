import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { FormularioProductoComponent } from '../../productos/formulario-producto/formulario-producto.component';
import { Producto, ProductoResumen, SaldoProducto } from 'src/app/shared/models/producto.model';
import { Cabecera, Detalle, Factura, FacturaRecepcion } from 'src/app/shared/models/factura-recepcion.model';
import { sfe } from 'src/app/shared/constants/sfe';
import { AutoComplete } from 'primeng/autocomplete';
import { adm } from 'src/app/shared/constants/adm';
import { spv } from 'src/app/shared/constants/spv';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { Categoria } from 'src/app/shared/models/categoria.model';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { BusquedaCliente } from 'src/app/shared/models/busqueda-cliente.model';
import { FormularioClienteComponent } from '../../clientes/formulario-cliente/formulario-cliente.component';
import { Venta, VentaDetalle } from 'src/app/shared/models/venta.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { Asociacion } from 'src/app/shared/models/session-usuario.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { environment } from 'src/environments/environment';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { Pago } from 'src/app/shared/models/pago.model';
import { FinalizarVenta } from 'src/app/shared/models/finalizar-venta.model';
import { ConfirmationService } from 'primeng/api';
import { FacturasService } from 'src/app/shared/services/facturas.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent implements OnInit {
    @ViewChild('producto') elmP?: AutoComplete;
    @ViewChild('cliente') elmC?: AutoComplete;

    item?: Venta;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;
    listaTipoVenta: Parametrica[] = [];
    listaAsociacion: Asociacion[] = [];

    detalle: VentaDetalle[] = [];
    detalleEliminado: number[] = [];

    listaProductosFiltrados: ProductoResumen[] = [];
    listaClientesFiltrados: Cliente[] = [];

    detalleSeleccionado?: VentaDetalle;

    listaProductos: ProductoResumen[] = [];
    categorias!: Categoria[];
    listaTipoPago: any[];
    conFactura: boolean = true;
    displayResponsive: boolean = false;

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
    private helperService: HelperService,
    private categoriasService: CategoriasService,
    private clientesService: ClientesService,
    private confirmationService: ConfirmationService,
    private facturasService: FacturasService,
    ) {
        this.listaTipoPago = [
            {label: 'Contado', value: 1, icon:'pi pi-wallet'},
            {label: 'Tarjeta', value: 2, icon:'pi pi-credit-card'},
            {label: 'Cheque', value: 3, icon:'pi pi-money-bill'},
            {label: 'Otro', value: 5, icon:'pi pi-qrcode'}
        ];
    }

  ngOnInit(): void {
    if (!this.sessionService.verifyUrl(this.router.url)) {
        this.router.navigate(['/auth/access']);
    }

    if (!this.sessionService.getRegistroFacturaRecepcion()) {
        this.router.navigate(['/adm/facturas']);
    }

    const busqueda = {idEmpresa : this.sessionService.getSessionUserData().idEmpresa }
    this.categoriasService.get(busqueda).subscribe({
        next: (res) => {
            this.categorias = res.content;
        },
        error: (err) => {
            this.informationService.showError(err.error.message);
        },
    });

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
    const asociacionCV = this.listaAsociacion.find(x=>x.codigoDocumentoSector==sfe.CODIGO_DOCUMENTO_SECTOR_COMPRA_VENTA)
    this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_VENTA)
        .subscribe((data) => {
            this.listaTipoVenta = data as unknown as Parametrica[];
        });

    this.itemForm = this.fb.group({
        codigoAsociacion: [asociacionCV ? asociacionCV.codigoAsociacion: null],
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

        codigoTipoPago: [sfe.CODIGO_TIPO_PAGO_EFECTIVO, Validators.required],
        numeroTarjeta: [{ value: '', disabled: true }],
        codigoTipoMoneda: [sfe.CODIGO_TIPO_MONEDA_BOLIVIANO],
        tipoCambio: [sfe.TIPO_DE_CAMBIO_BOLIVIANO],

        gift: [0],
        importe: [0],
        montoPagado: [0, Validators.required],
        cambio: [0],
        cafc:[''],
        numeroFactura:[''],
        fechaEmision:[''],
    });

    this.detalle = this.item?.detalle ?? [];

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


     // producto
     reduceItem(row: VentaDetalle): void {
        const existeProducto = this.detalle.find( (x) => x.codigoProducto === row.codigoProducto);
        if (existeProducto && existeProducto.cantidad>1) {
            existeProducto.cantidad = existeProducto.cantidad-1;
            this.calcularFila(row);
            return;
        }
      }

    addItem(producto: ProductoResumen) {
        const existeProducto = this.detalle.find(
            (x) => x.codigoProducto === producto.codigoProducto && x.codigoStock===producto.saldo?.codigoStock
        );

        const esConInventario = producto.idTipoProducto===spv.TIPO_PRODUCTO_CON_INVENTARIO;


        if (esConInventario && (!producto.saldo || producto.saldo.saldo!<=0)) {
            this.informationService.showWarning(
                'El producto no tiene saldo existente'
            );
            return;
        }

        if (existeProducto) {
            existeProducto.cantidad = existeProducto.cantidad+1;
            this.calcularFila(existeProducto);
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
            cantidadRegistros: 10,
            resumen: true,
            idsCategorias : this.sessionService.getSessionUserData().categorias
        };

        console.log(criteriosBusqueda);
        this.prodcutoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaProductos = [];
                    return;
                }
                console.log(res.content);
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
                this.listaProductos = temporal
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

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/adm/menu-principal']);
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

            this.guardar();

        }
    }



	cargarProductosPorCategoria(idCategoria: number){
        console.log(idCategoria);
            const criteriosBusqueda: BusquedaProducto = {
                idEmpresa: this.sessionService.getSessionEmpresaId(),
                idSucursal: this.sessionService.getSessionUserData().idSucursal,
                resumen: true,
                idsTipoProducto: spv.TIPO_PRODUCTO_PRODUCTO+","+spv.TIPO_PRODUCTO_SERVICIO_HOTEL_TURISMO,
                idsCategorias : idCategoria.toString()
            };

            this.prodcutoService.get(criteriosBusqueda).subscribe({
                next: (res) => {
                    console.log(res);
                    if (res.content.length == 0) {
                        this.listaProductos = [];
                        return;
                    }
                    this.listaProductos = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

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

    public onSave(): void {
        this.backClicked = false;
    }



    public onFinalize(): void {
        this.itemForm.patchValue({ 'montoPagado': this.getTotalSujetoIva() });
        this.displayResponsive = true;
    }

    public onExit(): void {
        this.backClicked = true;
    }

    public esMetodoPagoTarjeta():boolean{
        return this.itemForm.controls['codigoTipoPago'].value == sfe.CODIGO_TIPO_PAGO_TARJETA;
    }

    private guardar(){
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
            idMesa: this.itemForm.controls['idMesa'].value,
            detalle: this.detalle,
            itemsEliminados:
                this.detalleEliminado.length == 0
                    ? null
                    : this.detalleEliminado,
        };

        this.submited = true;
        if (venta.id > 0) {
            // se verifica si existen cambios para realizar la actualizacion
            const nuevo = JSON.stringify(venta).toString();
            const session = JSON.stringify(this.sessionService.getRegistroVenta());
            if (nuevo == session) {
                console.log('SIN CAMBIOS');
            } else {
                //console.log('nuevo: ', nuevo);
                //console.log('session: ',session);
                //console.log('EXISTE CAMBIOS Y SE ACTUALIZA');
                this.ventaService.edit(venta).subscribe({
                    next: (res) => {
                        this.sessionService.setRegistroVenta(res.content);
                        this.informationService.showSuccess(res.message);
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
                    this.submited = false;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.submited = false;
                },
            });
        }
    }

    getImporte() {
        let valor = this.getTotalSujetoIva()- this.itemForm.value.gift;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES): 0;
    }

    getCambio() {
        let valorImporte = this.getTotalSujetoIva() - this.itemForm.value.gift;
        let montoPagado = this.itemForm.value.montoPagado;
        if (isNaN(montoPagado)) return 0;
        if (montoPagado >= valorImporte) return montoPagado - valorImporte;
        else return 0;
    }

    private finalizar(){
        if (!this.itemForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        // verificar el turno
        if (this.sessionService.getTurno() == 0) {
            this.informationService.showWarning('No exise un turno abierto para realizar la operación');
            return;
        }

        if (this.itemForm.controls['codigoCliente'].value ==0 && this.itemForm.value.totalSujetoIva >1000){
            this.informationService.showWarning(
                'El código de cliente 0 no es válido para ventas mayores a 1000'
            );
            return;
        }

        if (this.esMetodoPagoTarjeta() && this.itemForm.controls['numeroTarjeta'].value.length<19){
            this.informationService.showWarning(
                'El numero de tarjeta está incompleto'
            );
            return;
        }

        const pago: Pago = {
            idVenta: this.itemForm.controls['idVenta'].value,
            idTurno: this.sessionService.getTurno(),
            gift: this.itemForm.controls['gift'].value,
            idCliente: this.itemForm.controls['idCliente'].value,
            codigoCliente: this.itemForm.controls['codigoCliente'].value,
            nombreCliente: this.itemForm.controls['nombreCliente'].value,
            emailCliente: this.itemForm.controls['emailCliente'].value,
            codigoTipoPago: this.itemForm.controls['codigoTipoPago'].value,
            codigoTipoMoneda: this.itemForm.controls['codigoTipoMoneda'].value,
            numeroTarjeta: this.itemForm.controls['numeroTarjeta'].value.replaceAll('-0000-0000-','00000000'),
            tipoCambio: this.itemForm.controls['tipoCambio'].value,
            importe: this.getImporte(),
            montoPagado: this.itemForm.controls['montoPagado'].value,
            cambio: this.getCambio(),
        };

        const finalizar: FinalizarVenta = {
            pago: pago,
            idVenta: pago.idVenta,
        };

        this.confirmationService.confirm({
            message: 'Esta seguro de finalizar la venta?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.submited = true;
                this.ventaService.finalize(finalizar).subscribe({
                    next: (res) => {
                            this.informationService.showSuccess(
                                res.message
                            );
                            const factura: FacturaRecepcion ={
                                ... res.content,
                                codigoAsociacion: this.itemForm.controls['codigoAsociacion'].value,
                                sucursal: this.sessionService.getSessionUserData().numeroSucursal,
                                puntoVenta: this.sessionService.getSessionUserData().numeroPuntoVenta,
                            }
                            this.sessionService.setRegistroVenta(null);
                            // enviar factura
                            if (this.itemForm.controls['codigoAsociacion'].value){
                                this.enviarFactura(factura);
                            }
                            else{
                                this.router.navigate(['/adm/ventas']);
                            }
                    },
                    error: (err) => {
                        this.informationService.showError(
                            err.error.message
                        );
                        this.submited = false;
                    },
                });
            },
        });
    }

    enviarFactura(factura:FacturaRecepcion):void {
            this.facturasService.sendFactura(factura).subscribe({
                next: (res) => {
                    this.facturasService.verificarPaquetes();
                    this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                    //this.router.navigate(['/adm/ventas']);
                },
                error: (err) => {
                    this.informationService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
                    //this.router.navigate(['/adm/ventas']);
                },
            });


    }
}
