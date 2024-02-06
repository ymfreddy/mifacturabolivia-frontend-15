import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-factura-ice-por-pasos',
  templateUrl: './factura-ice-por-pasos.component.html',
  styleUrls: ['./factura-ice-por-pasos.component.scss']
})
export class FacturaIcePorPasosComponent implements OnInit {
    items!: MenuItem[];
    activeIndex: number = 0;
    constructor() {}

    ngOnInit(): void {
        this.items = [
            {
                label: 'Detalle Factura',
                routerLink: 'factura-ice-paso-uno',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Forma de Pago',
                routerLink: 'factura-ice-paso-dos',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
        ];
    }
}
