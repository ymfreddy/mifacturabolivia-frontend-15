import { Pago } from "./pago.model";

export interface FinalizarVenta {
    idVenta?: number;
    pago: Pago
}
