import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-venta-por-pasos',
    templateUrl: './venta-por-pasos.component.html',
    styleUrls: ['./venta-por-pasos.component.scss'],
})
export class VentaPorPasosComponent implements OnInit {
    items!: MenuItem[];
    activeIndex: number = 0;
    constructor() {}

    ngOnInit(): void {
        this.items = [
            {
                label: 'Pedido',
                routerLink: 'venta-paso-uno',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Pago',
                routerLink: 'venta-paso-dos',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
        ];
    }
}
