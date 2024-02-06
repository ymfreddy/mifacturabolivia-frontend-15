import { Component, Input, OnInit } from '@angular/core';
import { Precio } from 'src/app/shared/models/precio';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  @Input() item!: Precio;

  constructor() { }

  ngOnInit(): void {
  }

  solicitar(mensaje: string){
    window.open(`${environment.whatsappUrl}${environment.celular}&text=${mensaje}`, '_blank');
}
}
