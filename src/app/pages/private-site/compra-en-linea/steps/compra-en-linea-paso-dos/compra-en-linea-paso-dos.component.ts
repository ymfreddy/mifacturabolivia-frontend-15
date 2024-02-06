import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductoResumen} from 'src/app/shared/models/producto.model';
import { adm } from 'src/app/shared/constants/adm';
import { spv } from 'src/app/shared/constants/spv';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { MesasService } from 'src/app/shared/services/mesas.service';
import { sfe } from 'src/app/shared/constants/sfe';
import { ConfirmationService } from 'primeng/api';
import { FinalizarVenta } from 'src/app/shared/models/finalizar-venta.model';
import { Pago } from 'src/app/shared/models/pago.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { ClienteOnline, SolicitudVentaOnline, Venta, VentaDetalle, VentaOnline } from 'src/app/shared/models/venta.model';
import { Cliente } from 'src/app/shared/models/cliente.model';


@Component({
  selector: 'app-compra-en-linea-paso-dos',
  templateUrl: './compra-en-linea-paso-dos.component.html',
  styleUrls: ['./compra-en-linea-paso-dos.component.scss']
})
export class CompraEnLineaPasoDosComponent implements OnInit {
    listaTipoPago: any[];
    item!: Venta;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;

    mostrarVentaFinalizada = false;

    listaDocumentos: ParametricaSfe[] = [];
    detalle: VentaDetalle[] = [];
    detalleEliminado: number[] = [];

    detalleSeleccionado?: VentaDetalle;
    displayResponsive: boolean = false;

    correlativo?: string;
    qr:string|null = null;

    constructor(
    private fb: FormBuilder,
    private informationService: InformationService,
    private sessionService: SessionService,
    private ventaService: VentasService,
    public dialogService: DialogService,
    private router: Router,
    private helperService: HelperService,
    private confirmationService: ConfirmationService,
    private parametricasSfeService: ParametricasSfeService,
    ) {
        this.listaTipoPago = [
            {label: 'Deposito Bancario', value: sfe.CODIGO_TIPO_PAGO_DEPOSITO_EN_CUENTA, icon:'pi pi-wallet'},
            {label: 'Pago en Tienda', value: sfe.CODIGO_TIPO_PAGO_POSTERIOR, icon:'pi pi-home'},
            {label: 'Pago con Qr', value: sfe.CODIGO_TIPO_PAGO_ONLINE, icon:'pi pi-qrcode'},
        ];
     }

  ngOnInit(): void {

    if (this.sessionService.getRegistroVenta() != null) {
        this.item = this.sessionService.getRegistroVenta();
    }else{
        this.redireccionar();
    }

    this.parametricasSfeService.getTipoDocumento().subscribe((data) => {
        this.listaDocumentos = data as unknown as ParametricaSfe[];
    });

    let temporalCliente: any = {
        codigoTipoDocumentoIdentidad: sfe.CODIGO_TIPO_DOCUMENTO_CI,
        numeroDocumento: this.sessionService.getSessionUserData().ci,
        complemento: "",
        nombre: this.sessionService.getSessionUserData().nombreCompleto
    };

    this.itemForm = this.fb.group({
        codigoTipoDocumentoIdentidad: [temporalCliente.codigoTipoDocumentoIdentidad, Validators.required,],
        numeroDocumento: [temporalCliente.numeroDocumento, [Validators.required]],
        complemento: [{ value: temporalCliente.complemento, disabled: true }],
        nombre: [temporalCliente.nombre, Validators.required],
        codigoTipoPago:[0],
        codigoTipoMoneda: [sfe.CODIGO_TIPO_MONEDA_BOLIVIANO],
        tipoCambio: [sfe.TIPO_DE_CAMBIO_BOLIVIANO],
        totalVenta: [this.item?.totalSujetoIva],
        gift: [0],
        importe: [this.item?.totalSujetoIva],
        descuentoAdicional: [ 0 ],
    });

    this.detalle = this.item?.detalle ?? [];

  }


  ngAfterViewInit(): void {
    setTimeout(() => {
        //this.elmP?.focusInput();
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
        let valor = this.getDetalleTotal() - this.itemForm.value.descuentoAdicional;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES) : 0;
    }

    // esPedido() {
    //     return this.item.idEstadoVenta == spv.ESTADO_VENTA_PEDIDO;
    // }

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/site/compra-en-linea-por-pasos/compra-en-linea-paso-uno']);
        } else {
            if (!this.itemForm.valid) {
                console.log(this.itemForm);
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            if(this.itemForm.controls['codigoTipoPago'].value===0){
                this.informationService.showWarning('Debe seleccionar un metodo de pago');
                return;
            }

            const cliente: ClienteOnline={
                codigoCliente: this.getCodigoCliente(
                    this.itemForm.controls['numeroDocumento'].value,
                    this.itemForm.controls['complemento'].value
                ),
                codigoTipoDocumentoIdentidad: this.itemForm.controls['codigoTipoDocumentoIdentidad'].value,
                numeroDocumento: this.itemForm.controls['numeroDocumento'].value,
                complemento: this.itemForm.controls['complemento'].value,
                nombre: this.itemForm.controls['nombre'].value,
                direccion: '',
            }

            const venta: VentaOnline={
                total: this.getTotalSujetoIva(),
                descuentoAdicional: 0,
                totalSujetoIva: this.getTotalSujetoIva(),
                idSucursal: this.sessionService.getSessionUserData().idSucursal,
                detalle: this.item?.detalle!,
                usuario: this.sessionService.getSessionUserData().username,
                codigoTipoPago: this.itemForm.controls['codigoTipoPago'].value,
            }

            const solicitud: SolicitudVentaOnline = {
                cliente: cliente,
                venta: venta,
                remision: false,
                idEmpresa: this.sessionService.getSessionUserData().idEmpresa
            };

            this.confirmationService.confirm({
                message: 'Esta seguro de finalizar la compra?',
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.submited = true;
                    console.log(solicitud);
                    this.ventaService.addOnline(solicitud).subscribe({
                        next: (res) => {
                                this.informationService.showSuccess( res.message );
                                this.sessionService.setRegistroVenta(null);
                                console.log(res.content);
                                this.correlativo=res.content.venta.correlativo;
                                this.qr=res.content.qr ? 'data:image/jpeg;base64,'+res.content.qr : null;
                                this.mostrarVentaFinalizada=true;
                        },
                        error: (err) => {
                            this.informationService.showError( err.error.message );
                            this.submited = false;
                        },
                    });
                },
            });
        }
    }

    prevPage() {
        this.backClicked = true;
    }

    public onSave(): void {
        this.backClicked = false;
    }

    esDescuentoPorcentaje(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_PORCENTAJE;
    }

    esDescuentoTotal(idTipoDescuento:number){
        return idTipoDescuento===spv.TIPO_DESCUENTO_TOTAL;
    }

    canbioTipoDocumento(event: any) {
        if (!event.value) {
            this.itemForm.controls['complemento'].disable();
            this.itemForm.patchValue({ complemento: '' });
            this.itemForm.updateValueAndValidity();
            return;
        }
        const tipoDocumento = this.listaDocumentos.find(
            (x) => x.codigo == event.value
        )?.codigo;

        if (tipoDocumento==sfe.CODIGO_TIPO_DOCUMENTO_CI) {
            this.itemForm.controls['complemento'].enable();
        } else {
            this.itemForm.controls['complemento'].disable();
            this.itemForm.patchValue({ complemento: '' });
        }
        this.itemForm.updateValueAndValidity();
    }

    esPagoDesposito(){
       return this.itemForm.controls['codigoTipoPago'].value==sfe.CODIGO_TIPO_PAGO_DEPOSITO_EN_CUENTA;
    }
    esPagoPosterior(){
        return this.itemForm.controls['codigoTipoPago'].value==sfe.CODIGO_TIPO_PAGO_POSTERIOR;
     }

     esPagoQr(){
        return this.itemForm.controls['codigoTipoPago'].value==sfe.CODIGO_TIPO_PAGO_ONLINE;
     }


     redireccionar(){
        this.router.navigate(['/site/compras-en-linea']);
     }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    public getCodigoCliente(numeroDocumento: string, complemento: string) {
        const numeroDocumentoSanitized = numeroDocumento
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const complementoSanitized = complemento
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const final =
            numeroDocumentoSanitized +
            (complementoSanitized.length === 0
                ? ''
                : '-' + complementoSanitized);
        return `${final}`;
    }

}
