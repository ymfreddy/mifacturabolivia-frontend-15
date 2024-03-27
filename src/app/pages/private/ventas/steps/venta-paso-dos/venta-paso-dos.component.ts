import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { adm } from 'src/app/shared/constants/adm';
import { sfe } from 'src/app/shared/constants/sfe';
import { spv } from 'src/app/shared/constants/spv';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { FacturaRecepcion } from 'src/app/shared/models/factura-recepcion.model';
import { FinalizarVenta } from 'src/app/shared/models/finalizar-venta.model';
import { Pago } from 'src/app/shared/models/pago.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { Asociacion } from 'src/app/shared/models/session-usuario.model';
import { Venta } from 'src/app/shared/models/venta.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { VentasService } from 'src/app/shared/services/ventas.service';

@Component({
  selector: 'app-venta-paso-dos',
  templateUrl: './venta-paso-dos.component.html',
  styleUrls: ['./venta-paso-dos.component.scss']
})
export class VentaPasoDosComponent implements OnInit {
    submited = false;
    ventaConGift = false;
    ventaConTarjeta = false;
    item?: Venta;
    itemForm!: FormGroup;
    backClicked = false;

    listaAsociacion: Asociacion[] = [];
    listaTipoPago: ParametricaSfe[] = [];

    ventaConContigencia =false;
    ventaRapida!:boolean;
    constructor(
        private router: Router,
        private fb: FormBuilder,
        private informationService: InformationService,
        private sessionService: SessionService,
        private parametricasSfeService: ParametricasSfeService,
        private confirmationService: ConfirmationService,
        private ventaService: VentasService,
        private facturasService: FacturasService,
        private helperService :HelperService,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getRegistroVenta() != null) {
            this.item = this.sessionService.getRegistroVenta();
        }else{
            this.router.navigate(['/adm/ventas']);
        }
        this.ventaRapida=this.sessionService.getVentaRapida();
        this.listaAsociacion = this.sessionService.getSessionAsociaciones().sort((a, b) => (a.codigoDocumentoSector < b.codigoDocumentoSector ? -1 : 1));
        this.parametricasSfeService.getTipoMetodoPago().subscribe((data) => {
            this.listaTipoPago = data as unknown as ParametricaSfe[];
        });

        this.itemForm = this.fb.group({
            codigoAsociacion: [this.listaAsociacion.length>0 ? this.listaAsociacion[0].codigoAsociacion: null],
            idVenta: [this.item?.id],
            correlativo: [{ value: this.item?.correlativo, disabled: true }],
            codigoTipoPago: [
                this.item?.idTipoVenta === spv.TIPO_VENTA_CONTADO ?  sfe.CODIGO_TIPO_PAGO_EFECTIVO : sfe.CODIGO_TIPO_PAGO_POSTERIOR,
                Validators.required,
            ],
            numeroTarjeta: [{ value: '', disabled: true }],
            codigoTipoMoneda: [sfe.CODIGO_TIPO_MONEDA_BOLIVIANO],
            tipoCambio: [sfe.TIPO_DE_CAMBIO_BOLIVIANO],
            idCliente: [this.item?.idCliente],
            codigoCliente: [{ value: this.item?.codigoCliente, disabled: true }],
            emailCliente: [{ value: this.item?.emailCliente, disabled: true }],
            nombreCliente: [ {value: this.item?.nombreCliente, disabled: (this.item?.codigoCliente!='99001')}],
            totalVenta: [this.item?.totalSujetoIva],
            gift: [0],
            importe: [0],
            //montoPagado: [0, Validators.required],
            //cambio: [0],
            cafc:[''],
            numeroFactura:[''],
            fechaEmision:[''],
        });
    }

    canbioTipoPago(event: any) {
        if (!event.value) {
            this.ventaConGift = false;
            this.ventaConTarjeta = false;
            this.itemForm.controls['numeroTarjeta'].disable();
            this.itemForm.patchValue({ numeroTarjeta: '' });
            this.itemForm.patchValue({ gift: 0 });
            this.itemForm.updateValueAndValidity();
            return;
        }
        const tipoPago = this.listaTipoPago.find(
            (x) => x.codigo == event.value
        )?.descripcion;
        if (tipoPago?.toUpperCase().includes('GIFT')) {
            this.ventaConGift = true;
        } else {
            this.ventaConGift = false;
            this.itemForm.patchValue({ gift: 0 });
        }
        if (tipoPago?.toUpperCase().includes('TARJETA')) {
            this.itemForm.controls['numeroTarjeta'].enable();
            this.ventaConTarjeta = true;
        } else {
            this.ventaConTarjeta = false;
            this.itemForm.controls['numeroTarjeta'].disable();
            this.itemForm.patchValue({ numeroTarjeta: '' });
        }
        this.itemForm.updateValueAndValidity();
    }

    public async onSubmit():Promise<void>{
        if (this.backClicked) {
            this.router.navigate(['/adm/venta-por-pasos/venta-paso-uno']);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            // verificar el turno
            if (this.sessionService.getTurno() == 0) {
                this.informationService.showWarning('No exise un turno abierto para realizar la operación');
                return;
            }

            if (this.itemForm.controls['codigoCliente'].value ==0 && this.itemForm.value.totalVenta >1000){
                this.informationService.showWarning(
                    'El código de cliente 0 no es válido para ventas mayores a 1000'
                );
                return;
            }

            if (this.ventaConGift && (this.itemForm.controls['gift'].value<=0 ||
            this.itemForm.controls['gift'].value > this.itemForm.controls['totalVenta'].value
            )){
                this.informationService.showWarning(
                    'El monto GIFT debe ser mayor a 0 y menor al Total de la Venta'
                );
                return;
            }

            if (this.ventaConTarjeta && this.itemForm.controls['numeroTarjeta'].value.length<19){
                this.informationService.showWarning(
                    'El numero de tarjeta está incompleto'
                );
                return;
            }

            /*if (this.item?.idTipoVenta==spv.TIPO_VENTA_CONTADO && this.itemForm.controls['montoPagado'].value < this.getImporte()) {
                this.informationService.showWarning(
                    'El monto pagado debe ser mayor o igual al importe final'
                );
                return;
            }


            if (this.item?.idTipoVenta==spv.TIPO_VENTA_CREDITO && this.itemForm.controls['montoPagado'].value >= this.getImporte()) {
                this.informationService.showWarning(
                    'El monto pagado no corresponde para una venta a crédito, por favor cambie el tipo de venta'
                );
                return;
            }*/

            if (this.ventaConContigencia){
                if ((!this.itemForm.controls['cafc'].value || !this.itemForm.controls['numeroFactura'].value || !this.itemForm.controls['fechaEmision'].value)){
                    this.informationService.showWarning(
                        'Debe introducir el cafc, numero y fecha de emisión si es una factura de contigencia'
                    );
                    return;
                }

                const verificarContigencia= {
                    codigoAsociacion: this.itemForm.controls['codigoAsociacion'].value,
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
                //montoPagado: this.itemForm.controls['montoPagado'].value,
                //cambio: this.getCambio()
                montoPagado: this.item?.idTipoVenta==spv.TIPO_VENTA_CREDITO ? 0 : this.getImporte(),
                cambio: 0
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
                                    this.ventaRapida ? this.router.navigate(['/adm/venta-por-pasos/venta-paso-uno']) :this.router.navigate(['/adm/ventas']);
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
    }

    complete() {
        this.backClicked = false;
    }

    prevPage() {
        this.backClicked = true;
    }

    getImporte() {
        let valor = this.itemForm.value.totalVenta - this.itemForm.value.gift;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES): 0;
    }

    getCambio() {
        let valorImporte = this.itemForm.value.totalVenta - this.itemForm.value.gift;
        let montoPagado = this.itemForm.value.montoPagado;
        if (isNaN(montoPagado)) return 0;
        if (montoPagado >= valorImporte) return montoPagado - valorImporte;
        else return 0;
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    enviarFactura(factura:FacturaRecepcion):void {
        if (this.ventaConContigencia){
            factura.factura!.cabecera.cafc= this.itemForm.controls['cafc'].value;
            factura.factura!.cabecera.numeroFactura = this.itemForm.controls['numeroFactura'].value;
            factura.factura!.cabecera.fechaEmision = this.datePipe.transform(this.itemForm.controls['fechaEmision'].value, 'dd/MM/yyyy HH:mm');
            this.facturasService.sendFacturaContigencia(factura).subscribe({
                next: (res) => {
                    this.facturasService.verificarPaquetes();
                    this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                    this.ventaRapida ? this.router.navigate(['/adm/venta-por-pasos/venta-paso-uno']) :this.router.navigate(['/adm/ventas']);
                },
                error: (err) => {
                    this.informationService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
                    this.ventaRapida ? this.router.navigate(['/adm/venta-por-pasos/venta-paso-uno']) :this.router.navigate(['/adm/ventas']);
                },
            });
        }
        else{
            this.facturasService.sendFactura(factura).subscribe({
                next: (res) => {
                    this.facturasService.verificarPaquetes();
                    this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                    this.ventaRapida ? this.router.navigate(['/adm/venta-por-pasos/venta-paso-uno']) :this.router.navigate(['/adm/ventas']);
                },
                error: (err) => {
                    this.informationService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
                    this.ventaRapida ? this.router.navigate(['/adm/venta-por-pasos/venta-paso-uno']) :this.router.navigate(['/adm/ventas']);
                },
            });

        }
    }
}
