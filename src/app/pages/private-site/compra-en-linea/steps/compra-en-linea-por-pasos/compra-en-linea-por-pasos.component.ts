import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-compra-en-linea-por-pasos',
  templateUrl: './compra-en-linea-por-pasos.component.html',
  styleUrls: ['./compra-en-linea-por-pasos.component.scss']
})
export class CompraEnLineaPorPasosComponent implements OnInit {

    items!: MenuItem[];
    activeIndex: number = 0;
    constructor() {}

    ngOnInit(): void {
        this.items = [
            {
                label: 'Mi Carrito',
                routerLink: 'compra-en-linea-paso-uno',
                command: (event: any) => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Finalizar Compra',
                routerLink: 'compra-en-linea-paso-dos',
                command: (event: any) => {
                    this.activeIndex = 2;
                },
            }
        ];
    }
}
