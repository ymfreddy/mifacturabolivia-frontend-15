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
    DetalleHuesped,
    Factura,
    FacturaRecepcion,
} from 'src/app/shared/models/factura-recepcion.model';
import { AutoComplete } from 'primeng/autocomplete';
import { sfe } from 'src/app/shared/constants/sfe';
import { MenuItem } from 'primeng/api';
import { CambioDescuentoComponent } from 'src/app/components/cambio-descuento/cambio-descuento.component';
import { spv } from 'src/app/shared/constants/spv';
import { CambioDescuento } from 'src/app/shared/models/descuento.model';
import { FormularioProductoComponent } from '../../../productos/formulario-producto/formulario-producto.component';
import { DatosFacturaHospitalComponent } from 'src/app/components/datos-factura-hospital/datos-factura-hospital.component';
import { HelperService } from '../../../../../shared/helpers/helper.service';
import { DatosFacturaHotelComponent } from 'src/app/components/datos-factura-hotel/datos-factura-hotel.component';
import { Estudiante } from 'src/app/shared/models/estudiante.model';
import { BusquedaEstudiante } from 'src/app/shared/models/busqueda-estudiante.model';
import { EstudiantesService } from 'src/app/shared/services/estudiantes.service';
import { FormularioEstudianteComponent } from '../../../estudiantes/formulario-estudiante/formulario-estudiante.component';

@Component({
    selector: 'app-factura-paso-uno',
    templateUrl: './factura-paso-uno.component.html',
    styleUrls: ['./factura-paso-uno.component.scss'],
})
export class FacturaPasoUnoComponent implements OnInit {
    @ViewChild('producto') elmP?: AutoComplete;

    item?: FacturaRecepcion;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;

    listaProductosFiltrados: Producto[] = [];
    detalle: Detalle[] = [];

    itemsMenu: MenuItem[]=[];
    detalleSeleccionado?: Detalle;

    listaEstudiantesFiltrados: Estudiante[] = [];

    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private prodcutoService: ProductosService,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService,
        private estudianteService: EstudiantesService
    ) {}

    ngOnInit(): void {
        this.itemsMenu = [
            {label: 'Cambiar Tipo Descuento', icon: 'pi pi-fw pi-star', command: () => this.changeDescuento(this.detalleSeleccionado!)},
        ];

        if (!this.sessionService.getRegistroFacturaRecepcion()) {
            this.router.navigate(['/adm/facturas']);
        }

        this.item = this.sessionService.getRegistroFacturaRecepcion();

        let fechaIngresoHospedaje = this.helperService.getDateTime(
            this.item?.factura?.cabecera?.fechaIngresoHospedaje
        );

        this.itemForm = this.fb.group({
            estudiante: [this.item?.factura?.cabecera?.estudiante],
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
            modalidadServicio : [this.item?.factura?.cabecera?.modalidadServicio],
            periodoFacturado : [this.item?.factura?.cabecera?.periodoFacturado],
            idEstudiante : [this.item?.factura?.cabecera?.idEstudiante],
            nombreEstudiante : [this.item?.factura?.cabecera?.nombreEstudiante],
            cantidadHuespedes : [this.item?.factura?.cabecera?.cantidadHuespedes??0],
            cantidadHabitaciones : [this.item?.factura?.cabecera?.cantidadHabitaciones??0],
            cantidadMayores : [this.item?.factura?.cabecera?.cantidadMayores??0],
            cantidadMenores : [this.item?.factura?.cabecera?.cantidadMenores??0],
            fechaIngresoHospedaje : [fechaIngresoHospedaje],
            razonSocialOperadorTurismo :[this.item?.factura?.cabecera?.razonSocialOperadorTurismo],
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
        let valor =
            this.getDetalleSubTotal() - this.itemForm.value.descuentoAdicional;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    getMontoTotalSujetoIva() {
        if (this.esFacturaTasaCero() || this.esFacturaTurismo()) {
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

            // alquileres
            if (this.esFacturaAlquiler() && !this.itemForm.controls['periodoFacturado'].value){
                this.informationService.showWarning(
                    'Debe ingresar el periodo facturado'
                );
                return;
            }

            // educativo
            if (this.esFacturaEducativo() && ( !this.itemForm.controls['periodoFacturado'].value || !this.itemForm.controls['nombreEstudiante'].value)){
                this.informationService.showWarning(
                    'Debe ingresar el periodo facturado y el nombre del estudiante'
                );
                return;
            }

            this.guardarDatossession();

            if (this.esFacturaSeguros())
                this.router.navigate(['/adm/factura-por-pasos/factura-paso-dos-seguro']);
            else if (this.esFacturaTurismo())
                this.router.navigate(['/adm/factura-por-pasos/factura-paso-dos-turismo']);
            else if (this.esFacturaTasaCero())
                this.router.navigate(['/adm/factura-por-pasos/factura-paso-dos-tasa-cero']);
            else
                this.router.navigate(['/adm/factura-por-pasos/factura-paso-dos']);
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
            montoDescuento: producto.descuento ? producto.descuento.descuento : 0,
            subTotal: producto.precio - (producto.descuento ? producto.descuento.descuento : 0),
            idTipoDescuento: producto.descuento ? producto.descuento.idTipoDescuento : spv.TIPO_DESCUENTO_TOTAL,
            valorDescuento: producto.descuento ? producto.descuento.descuentoEstablecido : 0,
            codigoTipoHabitacion: producto.codigoTipoHabitacion
        };

        this.itemForm.patchValue({ producto: null });
        this.listaProductosFiltrados = [];

        // mostrar el formulario para datos adicionales
        if (this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_HOSPITAL_CLINICA){
            const ref = this.dialogService.open(DatosFacturaHospitalComponent, {
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
        else if (this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_HOTELES){
            const ref = this.dialogService.open(DatosFacturaHotelComponent, {
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
                else{
                    this.detalle.push(detalle);
                    this.elmP?.focusInput();
                    this.guardarDatossession();
                }
            });
        }
        else if (this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_SERVICIOS_TURISTICOS_HOSPEDAJE){
            const ref = this.dialogService.open(DatosFacturaHotelComponent, {
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
            });
        }
        else if (this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_COMPRA_VENTA ||
            this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_ALQUILERES ||
            this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_SEGUROS ||
            this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_EDUCATIVO ||
            this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_TASA_CERO ){
            this.detalle.push(detalle);
            this.elmP?.focusInput();
            this.guardarDatossession();
        }
    }

    editItemHospital(item: any) {
        const ref = this.dialogService.open(DatosFacturaHospitalComponent, {
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

    editItemHotelTurismo(item: any) {
        const ref = this.dialogService.open(DatosFacturaHotelComponent, {
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
        monto = this.helperService.round(monto, adm.NUMERO_DECIMALES);
        this.detalle[elementIndex].monto = monto;

        let montoDescuento = row.montoDescuento;
        if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_PORCENTAJE){
            montoDescuento = monto* row.valorDescuento! /100;
        }
        if (row.idTipoDescuento ===spv.TIPO_DESCUENTO_MONTO){
            montoDescuento = row.valorDescuento! * row.cantidad;
        }

        montoDescuento = this.helperService.round(montoDescuento, adm.NUMERO_DECIMALES);
        this.detalle[elementIndex].montoDescuento = montoDescuento;

        //this.detalle[elementIndex].subTotal = this.helperService.round((row.precioUnitario * row.cantidad - montoDescuento), adm.NUMERO_DECIMALES);
        this.detalle[elementIndex].subTotal = this.helperService.round((monto- montoDescuento), adm.NUMERO_DECIMALES);
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
        const fechaIngresoHospedaje = this.itemForm.controls['fechaIngresoHospedaje'].value as Date;

        const cabecera: Cabecera = {
            ...this.item?.factura?.cabecera,
            estudiante: this.itemForm.controls['estudiante'].value,
            descuentoAdicional: this.itemForm.controls['descuentoAdicional'].value,
            modalidadServicio: this.itemForm.controls['modalidadServicio'].value,
            periodoFacturado: this.itemForm.controls['periodoFacturado'].value,
            idEstudiante: this.itemForm.controls['idEstudiante'].value,
            nombreEstudiante: this.itemForm.controls['nombreEstudiante'].value,
            montoTotal: this.getMontoTotal(),
            montoTotalMoneda: this.getMontoTotal(),
            montoTotalSujetoIva: this.getMontoTotalSujetoIva(),

            cantidadHuespedes: this.itemForm.controls['cantidadHuespedes'].value,
            cantidadHabitaciones: this.itemForm.controls['cantidadHabitaciones'].value,
            cantidadMayores: this.itemForm.controls['cantidadMayores'].value,
            cantidadMenores: this.itemForm.controls['cantidadMenores'].value,
            fechaIngresoHospedaje: this.datepipe.transform(fechaIngresoHospedaje, 'dd/MM/yyyy HH:mm') ?? '',
            razonSocialOperadorTurismo :this.itemForm.controls['razonSocialOperadorTurismo'].value,
        };

        const factura: Factura = {
            cabecera: cabecera,
            detalle: this.detalle,
        }

        this.item!.factura = factura;
        this.sessionService.setRegistroFacturaRecepcion(this.item!);
    }

    esFacturaHospital(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_HOSPITAL_CLINICA;
    }

    esFacturaTurismo(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_SERVICIOS_TURISTICOS_HOSPEDAJE;
    }

    esFacturaAlquiler(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_ALQUILERES;
    }

    esFacturaEducativo(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_EDUCATIVO;
    }

    esFacturaSeguros(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_SEGUROS;
    }

    esFacturaHotel(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_HOTELES;
    }

    esFacturaTasaCero(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_TASA_CERO;
    }


    tieneDetalleHuespedes(item: Detalle){
        return item && item.detalleHuespedes && item.detalleHuespedes.length>0;
    }

    formatoDetalleHuespedes(detalle:DetalleHuesped[]):string{
        let respuesta : string = "";
        if (detalle){
            detalle.forEach(element => {
                respuesta+=element.nombreHuesped+"-"+element.documentoIdentificacion+"-"+element.pais;
                respuesta = respuesta +"<br>";
            });
        }
        return respuesta;
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    esConDescripcionAdicional() {
        return this.sessionService.getSessionUserData().descripcionAdicionalProducto;
    }


    filtrarEstudiante(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarEstudiante(query);
    }

    buscarEstudiante(termino: string) {
        const criteriosBusqueda: BusquedaEstudiante = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
        };

        this.estudianteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaEstudiantesFiltrados = [];
                    return;
                }
                //const estudiantes = res.content.map((x: any) => {return  x.nombreCompleto });
                this.listaEstudiantesFiltrados = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    seleccionarEstudiante(event: any) {
        this.itemForm.patchValue({ idEstudiante: event?.id });
        this.itemForm.patchValue({ nombreEstudiante: event?.nombreCompleto });
    }

    limpiarEstudiante() {
        this.itemForm.patchValue({ estudiante: null });
        this.itemForm.patchValue({ idEstudiante: null });
        this.itemForm.patchValue({ nombreEstudiante: '' });
    }

    adicionarNuevoEstudiante() {
        const ref = this.dialogService.open(FormularioEstudianteComponent, {
            header: 'Nuevo',
            width: '90%',
            data: { idEmpresa: this.sessionService.getSessionEmpresaId()},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.itemForm.patchValue({ estudiante: res });
                this.itemForm.patchValue({ idEstudiante : res.id });
                this.itemForm.patchValue({ nombreEstudiante : res.nombreCompleto });
            }
        });
    }

    actualizarEstudiante() {
        if (!this.itemForm.controls['estudiante'].value){
            this.informationService.showWarning('Debe seleccionar un estudiante para actualizar');
            return;
        }

        console.log(this.itemForm.controls['estudiante'].value);
        const ref = this.dialogService.open(FormularioEstudianteComponent, {
            header: 'Actualizar',
            width: '90%',
            data: { idEmpresa: this.sessionService.getSessionEmpresaId(), item: this.itemForm.controls['estudiante'].value },
        });
        ref.onClose.subscribe((res2) => {
            if (res2) {
                this.itemForm.patchValue({ estudiante: res2 });
                this.itemForm.patchValue({ idEstudiante: res2.id });
                this.itemForm.patchValue({ nombreEstudiante: res2.nombreCompleto });
            }
        });


    }


}
