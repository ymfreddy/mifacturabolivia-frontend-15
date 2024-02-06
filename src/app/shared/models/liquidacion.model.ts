import { Pago } from "./pago.model";

export interface Liquidacion {
    pago: Pago;
    listaIdVentas: number[];
  }
