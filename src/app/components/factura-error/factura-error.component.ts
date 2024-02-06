import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FacturaError, FacturaResumen } from 'src/app/shared/models/factura-resumen.model';

@Component({
  selector: 'app-factura-error',
  templateUrl: './factura-error.component.html',
  styleUrls: ['./factura-error.component.scss']
})
export class FacturaErrorComponent implements OnInit {

    lista: FacturaError[]=[];
    item?:FacturaResumen
  constructor(public config: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.lista = this.config.data.lista;
    this.item = this.config.data.item;
  }

}
