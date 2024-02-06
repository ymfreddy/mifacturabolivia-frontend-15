import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-factura-por-pasos',
  templateUrl: './factura-por-pasos.component.html',
  styleUrls: ['./factura-por-pasos.component.scss']
})
export class FacturaPorPasosComponent implements OnInit {
    items!: MenuItem[];
    activeIndex: number = 0;
    constructor() {}

    ngOnInit(): void {
        this.items = [
            {
                label: 'Detalle Factura',
                routerLink: 'factura-paso-uno',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Forma de Pago',
                routerLink: 'factura-paso-dos',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
        ];
    }
}
