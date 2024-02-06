import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { sfe } from 'src/app/shared/constants/sfe';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { Cabecera, Factura, FacturaRecepcion } from 'src/app/shared/models/factura-recepcion.model';
import { BusquedaCliente } from 'src/app/shared/models/busqueda-cliente.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { FormularioClienteComponent } from '../../../clientes/formulario-cliente/formulario-cliente.component';
import { DialogService } from 'primeng/dynamicdialog';
import { adm } from 'src/app/shared/constants/adm';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { AutoComplete } from 'primeng/autocomplete';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { delay } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-factura-paso-dos',
  templateUrl: './factura-paso-dos.component.html',
  styleUrls: ['./factura-paso-dos.component.scss']
})
export class FacturaPasoDosComponent implements OnInit {
    @ViewChild('cliente') elmC?: AutoComplete;
    submited = false;
    facturaConGift = false;
    facturaConTarjeta = false;
    item?: FacturaRecepcion;
    itemForm!: FormGroup;
    backClicked = false;
    listaTipoPago: ParametricaSfe[] = [];
    facturaConContigencia =false;

    listaClientesFiltrados: Cliente[] = [];

    constructor(
        private router: Router,
        private fb: FormBuilder,
        public dialogService: DialogService,
        private informationService: InformationService,
        private sessionService: SessionService,
        private parametricasSfeService: ParametricasSfeService,
        private confirmationService: ConfirmationService,
        private facturasService: FacturasService,
        private helperService :HelperService,
        private datePipe: DatePipe,
        private clienteService:ClientesService,
        private utilidadesService: UtilidadesService,
        private fileService:FilesService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.getRegistroFacturaRecepcion()) {
            this.router.navigate(['/adm/facturas']);
        }

        this.item = this.sessionService.getRegistroFacturaRecepcion();
        console.log(this.item);

        this.parametricasSfeService.getTipoMetodoPago().subscribe((data) => {
            this.listaTipoPago = data as unknown as ParametricaSfe[];
            // si es factura de alquiler se elimina todos los gifcard
            if (this.esFacturaAlquiler()) this.listaTipoPago = this.listaTipoPago.filter(x=>!x.descripcion.toUpperCase().includes('GIFT'));
        });

        this.itemForm = this.fb.group({
            cliente: [this.item?.factura?.cabecera?.cliente, Validators.required],
            estudiante: [this.item?.factura?.cabecera?.estudiante],
            codigoCliente: [this.item?.factura?.cabecera?.codigoCliente],
            nombreCliente: [ this.item?.factura?.cabecera?.nombreCliente],
            emailCliente: [this.item?.factura?.cabecera?.emailCliente],
            codigoExcepcion: [this.item?.factura?.cabecera?.codigoExcepcion?? 0],
            codigoMetodoPago: [this.item?.factura?.cabecera?.codigoMetodoPago ?? sfe.CODIGO_TIPO_PAGO_EFECTIVO, Validators.required],
            codigoMoneda: [this.item?.factura?.cabecera?.codigoMoneda ?? sfe.CODIGO_TIPO_MONEDA_BOLIVIANO],
            montoTotal: [this.item?.factura?.cabecera?.montoTotal],
            montoTotalMoneda:[this.item?.factura?.cabecera?.montoTotalMoneda],
            descuentoAdicional: [this.item?.factura?.cabecera?.descuentoAdicional],
            montoGiftCard: [this.item?.factura?.cabecera?.montoGiftCard??0],
            montoTotalSujetoIva: [this.item?.factura?.cabecera?.montoTotalSujetoIva],
            tipoCambio: [this.item?.factura?.cabecera?.tipoCambio ?? sfe.TIPO_DE_CAMBIO_BOLIVIANO],
            numeroTarjeta: [{ value: this.item?.factura?.cabecera?.numeroTarjeta ?? '', disabled: !this.item?.factura?.cabecera?.numeroTarjeta }],
            cafc:[''],
            fechaEmision:[''],
            numeroFactura:[''],
            idVenta:[null],
            modalidadServicio: [this.item?.factura?.cabecera?.modalidadServicio],
            periodoFacturado: [this.item?.factura?.cabecera?.periodoFacturado],
            idEstudiante: [this.item?.factura?.cabecera?.idEstudiante],
            nombreEstudiante: [this.item?.factura?.cabecera?.nombreEstudiante],
            ajusteAfectacionIva: [this.item?.factura?.cabecera?.ajusteAfectacionIva ??0],

            cantidadHuespedes : [this.item?.factura?.cabecera?.cantidadHuespedes],
            cantidadHabitaciones : [this.item?.factura?.cabecera?.cantidadHabitaciones],
            cantidadMayores : [this.item?.factura?.cabecera?.cantidadMayores],
            cantidadMenores : [this.item?.factura?.cabecera?.cantidadMenores],
            fechaIngresoHospedaje : [this.item?.factura?.cabecera?.fechaIngresoHospedaje]
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.elmC?.focusInput();
        }, 500);
    }

    canbioTipoPago(event: any) {
        if (!event.value) {
            this.facturaConGift = false;
            this.facturaConTarjeta = false;
            this.itemForm.controls['numeroTarjeta'].disable();
            this.itemForm.patchValue({ numeroTarjeta: '' });
            this.itemForm.patchValue({ montoGiftCard: 0 });
            this.itemForm.updateValueAndValidity();
            return;
        }
        const tipoPago = this.listaTipoPago.find(
            (x) => x.codigo == event.value
        )?.descripcion;
        if (tipoPago?.toUpperCase().includes('GIFT')) {
            this.facturaConGift = true;
        } else {
            this.facturaConGift = false;
            this.itemForm.patchValue({ montoGiftCard: 0 });
        }
        if (tipoPago?.toUpperCase().includes('TARJETA')) {
            this.itemForm.controls['numeroTarjeta'].enable();
            this.facturaConTarjeta = true;
        } else {
            this.facturaConTarjeta = false;
            this.itemForm.controls['numeroTarjeta'].disable();
            this.itemForm.patchValue({ numeroTarjeta: '' });
        }
        this.itemForm.updateValueAndValidity();
    }

    public async onSubmit():Promise<void>{
        if (this.backClicked) {
            this.router.navigate(['/adm/factura-por-pasos/factura-paso-uno']);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            if (this.itemForm.value.codigoCliente ==0 && this.itemForm.value.montoTotal >1000){
                this.informationService.showWarning(
                    'El código de cliente 0 no es válido para ventas mayores a 1000'
                );
                return;
            }

            if (this.facturaConGift && (this.itemForm.controls['montoGiftCard'].value<=0 ||
            this.itemForm.value.montoGiftCard > this.itemForm.value.montoTotal
            )){
                this.informationService.showWarning(
                    'El monto GIFT debe ser mayor a 0 y menor al Total de la Venta'
                );
                return;
            }

            if (this.facturaConTarjeta && this.itemForm.value.numeroTarjeta.length<19){
                this.informationService.showWarning(
                    'El numero de tarjeta está incompleto'
                );
                return;
            }

            if (this.facturaConContigencia){
                if ((!this.itemForm.value.cafc || !this.itemForm.value.numeroFactura || !this.itemForm.value.numeroFactura)){
                    this.informationService.showWarning(
                        'Debe introducir el cafc, numero y fecha de emisión si es una factura de contigencia'
                    );
                    return;
                }

                const verificarContigencia= {
                    codigoAsociacion:  this.sessionService.getSessionAsociaciones()[0].codigoAsociacion,
                    sucursal: this.sessionService.getSessionUserData().numeroSucursal,
                    puntoVenta: this.sessionService.getSessionUserData().numeroPuntoVenta,
                    cafc: this.itemForm.controls['cafc'].value,
                    fechaEmision : this.datePipe.transform(this.itemForm.controls['fechaEmision'].value, 'dd/MM/yyyy HH:mm')
                };

                let validado =true;
                await this.facturasService.verificarContigencia(verificarContigencia)
                    .then((result:any) => {
                    }).catch((err:any) => {
                        this.informationService.showError(err.error.message);
                        validado=false;
                    });
               if (!validado) return;
            }


            const facturaRecepcion = this.getFacturaRecepcion();

            this.confirmarYEnviar(facturaRecepcion);

        }
    }

    confirmarYEnviar(facturaRecepcion: FacturaRecepcion){
        this.guardarDatossession();
        this.confirmationService.confirm({
            message: 'Esta seguro de enviar la factura?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.submited = true;
                if (this.facturaConContigencia){
                    facturaRecepcion.factura!.cabecera.cafc = this.itemForm.controls['cafc'].value,
                    facturaRecepcion.factura!.cabecera.fechaEmision= this.datePipe.transform(this.itemForm.controls['fechaEmision'].value, 'dd/MM/yyyy HH:mm'),
                    facturaRecepcion.factura!.cabecera.numeroFactura= this.itemForm.controls['numeroFactura'].value,
                    this.facturasService.sendFacturaContigencia(facturaRecepcion).subscribe({
                        next: (res) => {
                            this.sessionService.setRegistroFacturaRecepcion(null);
                            this.facturasService.verificarPaquetes();
                            this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                            this.router.navigate(['/adm/facturas']);
                            this.submited = false;
                        },
                        error: (err) => {
                            this.informationService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
                            this.submited = false;
                        },
                    });
                }
                else{
                    this.facturasService.sendFactura(facturaRecepcion).subscribe({
                        next: (res) => {
                            this.sessionService.setRegistroFacturaRecepcion(null);
                            this.facturasService.verificarPaquetes();
                            this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                            this.router.navigate(['/adm/facturas']);
                            this.submited = false;
                            // imprimir
                            this.imprimir(res.content);
                        },
                        error: (err) => {
                            this.informationService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
                            this.submited = false;
                            if (err.error.content && err.error.content.idFactura){
                                this.sessionService.setRegistroFacturaRecepcion(null);
                                this.router.navigate(['/adm/facturas']);
                            }
                        },
                    });

                }
            },
        });
    }

    complete() {
        this.backClicked = false;
    }

    prevPage() {
        this.guardarDatossession();
        this.backClicked = true;
    }

    getMontoFinalSujetoIva() {
        let valor = this.itemForm.value.montoTotal - this.itemForm.value.montoGiftCard;
        return !isNaN(valor) ? this.helperService.round(valor ,adm.NUMERO_DECIMALES): 0;
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
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
                this.itemForm.patchValue({ cliente: res });
                this.itemForm.patchValue({ codigoCliente: res.codigoCliente });
                this.itemForm.patchValue({ nombreCliente: res.nombre });
                this.itemForm.patchValue({ emailCliente: res.email });
            }
        });
    }

    actualizarCliente() {
        if (!this.itemForm.controls['cliente'].value){
            this.informationService.showWarning('Debe seleccionar un cliente para actualizar');
        }

        this.clienteService.getById(this.itemForm.controls['cliente'].value.id).subscribe({
            next: (res) => {
                const ref = this.dialogService.open(FormularioClienteComponent, {
                    header: 'Actualizar',
                    width: '80%',
                    data: { idEmpresa: this.sessionService.getSessionEmpresaId(), item: res.content },
                });
                ref.onClose.subscribe((res2) => {
                    if (res2) {
                        this.itemForm.patchValue({ cliente: res2 });
                        this.itemForm.patchValue({ codigoCliente: res2.codigoCliente });
                        this.itemForm.patchValue({ nombreCliente: res2.nombre });
                        this.itemForm.patchValue({ emailCliente: res2.email });
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
        this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
        this.itemForm.patchValue({ nombreCliente: event?.nombre });
        this.itemForm.patchValue({ emailCliente: event?.email });
    }

    limpiarCliente() {
        this.itemForm.patchValue({ cliente: null });
        this.itemForm.patchValue({ codigoCliente: '' });
        this.itemForm.patchValue({ nombreCliente: '' });
        this.itemForm.patchValue({ emailCliente: '' });
        this.elmC?.focusInput();
    }

    guardarDatossession() {
        const factura = this.getFacturaRecepcion();
        this.sessionService.setRegistroFacturaRecepcion(factura);
    }

    getFacturaRecepcion(): FacturaRecepcion{
        const cabecera : Cabecera = {
            cliente: this.itemForm.controls['cliente'].value,
            estudiante: this.itemForm.controls['estudiante'].value,
            codigoCliente: this.itemForm.controls['codigoCliente'].value,
            nombreCliente: this.itemForm.controls['nombreCliente'].value,
            emailCliente: this.itemForm.controls['emailCliente'].value,
            codigoExcepcion: this.itemForm.controls['codigoExcepcion'].value,
            codigoMetodoPago: this.itemForm.controls['codigoMetodoPago'].value,
            codigoMoneda: this.itemForm.controls['codigoMoneda'].value,
            montoTotal: this.itemForm.controls['montoTotal'].value,
            montoTotalMoneda: this.itemForm.controls['montoTotalMoneda'].value,
            descuentoAdicional: this.itemForm.controls['descuentoAdicional'].value,
            montoGiftCard: this.itemForm.controls['montoGiftCard'].value,
            montoTotalSujetoIva: this.getMontoFinalSujetoIva(),
            numeroTarjeta: this.itemForm.controls['numeroTarjeta'].value.replaceAll('-0000-0000-','00000000'),
            tipoCambio: this.itemForm.controls['tipoCambio'].value,
            idVenta: this.itemForm.controls['idVenta'].value,
            modalidadServicio: this.itemForm.controls['modalidadServicio'].value,
            periodoFacturado: this.itemForm.controls['periodoFacturado'].value,
            idEstudiante: this.itemForm.controls['idEstudiante'].value,
            nombreEstudiante: this.itemForm.controls['nombreEstudiante'].value,
            ajusteAfectacionIva: this.itemForm.controls['ajusteAfectacionIva'].value,

            cantidadHuespedes: this.itemForm.controls['cantidadHuespedes'].value,
            cantidadHabitaciones: this.itemForm.controls['cantidadHabitaciones'].value,
            cantidadMayores: this.itemForm.controls['cantidadMayores'].value,
            cantidadMenores: this.itemForm.controls['cantidadMenores'].value,
            fechaIngresoHospedaje: this.itemForm.controls['fechaIngresoHospedaje'].value,
        };

         const factura: Factura={
            cabecera:cabecera,
            detalle: this.item!.factura!.detalle,
         }


        this.item!.codigoAsociacion= this.item!.asociacion.codigoAsociacion;
        this.item!.sucursal = this.sessionService.getSessionUserData().numeroSucursal;
        this.item!.puntoVenta = this.sessionService.getSessionUserData().numeroPuntoVenta;
        this.item!.usuario= this.sessionService.getSessionUserData().username;
        this.item!.factura= factura;
        return this.item!;
    }

    esFacturaAlquiler(){
        return this.item?.asociacion.codigoDocumentoSector===sfe.CODIGO_DOCUMENTO_SECTOR_ALQUILERES;
    }

    imprimir(item: any) {
        if (this.sessionService.getSessionUserData().impresionDirecta && (item.codigoEstado == sfe.ESTADO_FACTURA_VALIDADO
            || item.codigoEstado == sfe.ESTADO_FACTURA_PENDIENTE
            || item.codigoEstado == sfe.ESTADO_FACTURA_OBSERVADO)
            ) {
                const fileName = `factura-${item.idFactura}.pdf`;
                this.utilidadesService
                    .getFactura(item.idFactura)
                    .pipe(delay(1000))
                    .subscribe((blob: Blob): void => {
                        this.fileService.printFile(blob, fileName, true);
                    });
        }
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}
