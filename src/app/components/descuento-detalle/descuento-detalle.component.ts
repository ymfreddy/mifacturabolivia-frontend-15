import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Descuento, DescuentoDetalle } from 'src/app/shared/models/descuento.model';

@Component({
    selector: 'app-descuento-detalle',
    templateUrl: './descuento-detalle.component.html',
    styleUrls: ['./descuento-detalle.component.scss'],
})
export class DescuentoDetalleComponent implements OnInit {
    item?: Descuento ;
    detalle : DescuentoDetalle[] = [];
    constructor(
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef
    ) {}
    ngOnInit(): void {
        this.item = this.config.data.item;
        this.detalle = this.item?.detalle!;
    }
}
