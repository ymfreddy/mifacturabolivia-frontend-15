import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { spv } from 'src/app/shared/constants/spv';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { MesaAtencion, MesaGrupo } from 'src/app/shared/models/mesa';
import { Venta } from 'src/app/shared/models/venta.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { MesasService } from 'src/app/shared/services/mesas.service';
import { VentasService } from 'src/app/shared/services/ventas.service';

@Component({
  selector: 'app-atencion',
  templateUrl: './atencion.component.html',
  styleUrls: ['./atencion.component.scss']
})
export class AtencionComponent implements OnInit {

  grupos!: MesaGrupo[];
  constructor(private sessionService: SessionService,
    private informationService: InformationService,
    private mesasService: MesasService,
    private router: Router,
    private ventasService: VentasService,
    ) { }

  ngOnInit(): void {
    this.listarAtencion();
  }

  listarAtencion(): void{
    // console.log('entra a servicio');
    const sucursal = this.sessionService.getSessionUserData().idSucursal
    this.mesasService.getAtencionByIdSucursal(sucursal).subscribe((response: any) => {
      if (response.success) {
        const mesas: MesaAtencion[] = response.content;
        this.grupos = this.getGroupedList(mesas);
        console.log(this.grupos );
      } else {
        this.informationService.showError(response.message);
      }
    });
}

verPedido(idVenta: number, idMesa: number): void{
if (idVenta===0){
    const ventaInicial: Venta = {
        id: 0,
        idCliente: undefined,
        idSucursal:this.sessionService.getSessionUserData().idSucursal,
        idEstadoVenta: spv.ESTADO_VENTA_PEDIDO,
        idTipoVenta: spv.TIPO_VENTA_CONTADO,
        diasCredito: 0,
        total: 0,
        descuentoAdicional:0,
        totalSujetoIva: 0,
        idMesa: idMesa,
        detalle: [],
        itemsEliminados: null
    };

    this.sessionService.setRegistroVenta(ventaInicial);
    this.router.navigate(['/adm/pos-por-pasos']);
}
else{
    this.ventasService.getById(idVenta).subscribe({
        next: (res) => {
            console.log(res.content);
            this.sessionService.setRegistroVenta(res.content);
            this.router.navigate(['/adm/pos-por-pasos']);
        },
        error: (err) => {
            this.informationService.showError(err.error.message);
        },
    });
}
}


getGroupedList(mesas: MesaAtencion[]):any[]{
let itemsOpciones:MesaGrupo[]=[];
const grouped = this.groupByx(mesas, (i:MesaAtencion) => i.lugar);
grouped.forEach((value: [], key: string) => {
  const xx : MesaGrupo ={
      lugar:key,
      mesas:value.map((it:MesaAtencion)=>{return {id: it.id, numero:it.numero, lugar:it.lugar, estadoMesa: it.estadoMesa, cantidadReservas: it.cantidadReservas,idVentaActivo:it.idVentaActivo }})
  }
  itemsOpciones.push(xx)
});
return itemsOpciones;
}

private groupByx(list:MesaAtencion[], keyGetter:any) {
const map = new Map();
list.forEach((item) => {
   const key = keyGetter(item);
   const collection = map.get(key);
   if (!collection) {
       map.set(key, [item]);
   } else {
       collection.push(item);
   }
});
return map;
}
}
