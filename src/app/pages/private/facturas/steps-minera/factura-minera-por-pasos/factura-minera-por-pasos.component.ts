import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-factura-minera-por-pasos',
  templateUrl: './factura-minera-por-pasos.component.html',
  styleUrls: ['./factura-minera-por-pasos.component.scss']
})
export class FacturaMineraPorPasosComponent implements OnInit {
    items!: MenuItem[];
    activeIndex: number = 0;
    constructor() { }

  ngOnInit(): void {
    this.items = [
        {
            label: 'Detalle Factura',
            routerLink: 'factura-minera-paso-uno',
            command: (event: any) => {
                this.activeIndex = 1;
            },
        },
        {
            label: 'Forma de Pago',
            routerLink: 'factura-minera-paso-dos',
            command: (event: any) => {
                this.activeIndex = 1;
            },
        },
    ];
  }

}
