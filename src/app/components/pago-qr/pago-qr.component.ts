import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { spv } from 'src/app/shared/constants/spv';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { SolicitudGeneracionQr, Venta } from 'src/app/shared/models/venta.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { PagosQrService } from 'src/app/shared/services/pagos-qr.service';

@Component({
  selector: 'app-pago-qr',
  templateUrl: './pago-qr.component.html',
  styleUrls: ['./pago-qr.component.scss']
})
export class PagoQrComponent implements OnInit {
    @Input() compra!: Venta;

    qrImage: string='';
  constructor(private router: Router,
    private fb: FormBuilder,
    private informationService: InformationService,
    private sessionService: SessionService,
    private pagosQrService: PagosQrService
    ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
        if (this.compra!.idEstadoVenta!=spv.ESTADO_VENTA_PEDIDO){
            this.generar()
        }
    }, 500);
  }

  generar(){
    const solicitud: SolicitudGeneracionQr = {
        idVenta : this.compra!.id,
        generarNuevo: true,
    }
    this.pagosQrService.generar(solicitud).subscribe({
        next: (res) => {
            console.log(res);
            this.qrImage="data:image/jpg;base64,"+res.content.qr;
        },
        error: (err) => {
            this.informationService.showError(err.error.message);
        },
    });
  }

}
