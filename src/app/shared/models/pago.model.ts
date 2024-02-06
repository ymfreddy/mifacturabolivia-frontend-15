export interface Pago {
  id?: number;
  idVenta: number;
  idTurno: number;
  idCliente: number;
  codigoCliente: string;
  nombreCliente?: string;
  emailCliente?: string;
  codigoTipoMoneda: number;
  codigoTipoPago: number;
  numeroTarjeta?: number;
  tipoCambio: number;
  importe: number;
  montoPagado: number;
  cambio: number;
  gift: number;
  descripcion?: string;
}

export interface PagoResumen {
    idTurno: number;
    codigoTipoPago: number;
    tipoPago: string;
    importe: number;
    gift?: number;
  }
