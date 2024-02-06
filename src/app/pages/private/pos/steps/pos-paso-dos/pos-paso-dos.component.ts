import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { InputNumber } from 'primeng/inputnumber';
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
  selector: 'app-pos-paso-dos',
  templateUrl: './pos-paso-dos.component.html',
  styleUrls: ['./pos-paso-dos.component.scss']
})
export class PosPasoDosComponent implements OnInit {
 @ViewChild('montoPagado') montoPagado!: InputNumber;

  listaTipoPago: any[];
  submited = false;
  ventaConGift = false;
  ventaConTarjeta = false;
  item?: Venta;
  itemForm!: FormGroup;
  backClicked = false;

  listaAsociacion: Asociacion[] = [];

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
    private datePipe: DatePipe) {
    this.listaTipoPago = [
        {label: 'Contado', value: 1, icon:'pi pi-wallet'},
        {label: 'Tarjeta', value: 2, icon:'pi pi-credit-card'},
        {label: 'Cheque', value: 3, icon:'pi pi-money-bill'},
        {label: 'Otro', value: 5, icon:'pi pi-qrcode'}
    ];
   }

   ngOnInit(): void {
    if (this.sessionService.getRegistroVenta() != null) {
        this.item = this.sessionService.getRegistroVenta();
    }else{
        this.router.navigate(['/adm/atencion']);
    }

    this.listaAsociacion = this.sessionService.getSessionAsociaciones();
    const asociacionCV = this.listaAsociacion.find(x=>x.codigoDocumentoSector==sfe.CODIGO_DOCUMENTO_SECTOR_COMPRA_VENTA)

    this.itemForm = this.fb.group({
        codigoAsociacion: [asociacionCV ? asociacionCV.codigoAsociacion: null],
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
        montoPagado: [this.item?.totalSujetoIva, Validators.required],
        cambio: [0],
        cafc:[''],
        numeroFactura:[''],
        fechaEmision:[''],
    });
   }

   ngAfterViewInit(): void {
    setTimeout(() => {
        this.montoPagado.input.nativeElement.focus();
    }, 500);
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

    if (event.value===sfe.CODIGO_TIPO_PAGO_TARJETA) {
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
        this.router.navigate(['/adm/pos-por-pasos/pos-paso-uno']);
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

        console.log(this.itemForm.controls['montoPagado'].value );
        console.log(this.getImporte());
        if (this.item?.idTipoVenta==spv.TIPO_VENTA_CONTADO && this.itemForm.controls['montoPagado'].value < this.getImporte()) {
            this.informationService.showWarning(
                'El monto pagado debe ser mayor o igual al importe final'
            );
            return;
        }

        /*
        if (this.item?.idTipoVenta==spv.TIPO_VENTA_CREDITO && this.itemForm.controls['montoPagado'].value >= this.getImporte()) {
            this.informationService.showWarning(
                'El monto pagado no corresponde para una venta a crédito, por favor cambie el tipo de venta'
            );
            return;
        }*/

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
            cambio: this.getCambio()
            //montoPagado: this.item?.idTipoVenta==spv.TIPO_VENTA_CREDITO ? 0 : this.getImporte(),
            //cambio: 0
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

public esMetodoPagoTarjeta():boolean{
    return this.itemForm.controls['codigoTipoPago'].value == sfe.CODIGO_TIPO_PAGO_TARJETA;
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
        this.facturasService.sendFactura(factura).subscribe({
            next: (res) => {
                this.facturasService.verificarPaquetes();
                this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                this.router.navigate(['/adm/atencion']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
                this.router.navigate(['/adm/atencion']);
            },
        });
 }

}
