import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-pos-por-pasos',
  templateUrl: './pos-por-pasos.component.html',
  styleUrls: ['./pos-por-pasos.component.scss']
})
export class PosPorPasosComponent implements OnInit {

    items!: MenuItem[];
    activeIndex: number = 0;
    constructor() {}

  ngOnInit(): void {
    this.items = [
        {
            label: 'Pedido',
            routerLink: 'pos-paso-uno',
            command: (event: any) => {
                this.activeIndex = 1;
            },
        },
        {
            label: 'Pago',
            routerLink: 'pos-paso-dos',
            command: (event: any) => {
                this.activeIndex = 1;
            },
        },
    ];
}

}
