import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Venta, VentaDetalle } from 'src/app/shared/models/venta.model';
import { VentasService } from 'src/app/shared/services/ventas.service';

@Component({
  selector: 'app-venta-detalle',
  templateUrl: './venta-detalle.component.html',
  styleUrls: ['./venta-detalle.component.scss']
})
export class VentaDetalleComponent implements OnInit {

    item?: Venta ;
    detalle : VentaDetalle[] = [];
    constructor(
        private config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private ventaService: VentasService,
        private informationService: InformationService
    ) {}

    ngOnInit(): void {
        this.item = this.config.data.item;
        this.ventaService.getDetail(this.item?.id!)
        .subscribe({
            next: (res) => {
                this.detalle = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

    }

}
