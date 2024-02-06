import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-compra-por-pasos',
    templateUrl: './compra-por-pasos.component.html',
    styleUrls: ['./compra-por-pasos.component.scss'],
})
export class CompraPorPasosComponent implements OnInit {
    items!: MenuItem[];
    activeIndex: number = 0;
    constructor() {}

    ngOnInit(): void {
        this.items = [
            {
                label: 'Solicitar',
                routerLink: 'solicitar',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Recibir',
                routerLink: 'recibir',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
        ];
    }
}
