import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { HistorialProducto } from 'src/app/shared/models/historial-producto.model';

@Component({
  selector: 'app-historial-producto-detalle',
  templateUrl: './historial-producto-detalle.component.html',
  styleUrls: ['./historial-producto-detalle.component.scss']
})
export class HistorialProductoDetalleComponent implements OnInit {

    lista: HistorialProducto[]=[];
    item?:HistorialProducto
  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig)
 { }

  ngOnInit(): void {
    this.lista = this.config.data;
    this.item = this.lista[0];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal(
        (event.target as HTMLInputElement).value,
        'contains'
    );
}

}
