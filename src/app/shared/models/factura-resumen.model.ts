export interface FacturaResumen {
  id: number;
  codigoAsociacion: string;
  codigoRecepcion: string;
  nitEmisor: number;
  razonSocialEmisor: string;
  numeroFactura: number;
  cuf: string;
  cufd: string;
  sucursal: number;
  puntoVenta: number;
  fechaEmision: Date;
  nombreRazonSocial: string;
  codigoCliente: string;
  subtotal: number;
  descuentoAdicional: number;
  montoTotal: number;
  montoGiftCard: number;
  montoTotalSujetoIva: number;
  codigoEstado: number;
  estado: string;
  codigoVenta: string;
  codigoDocumentoSector: number;
  url: string;
  usuario: string;
}

export interface FacturaError {
    id: number;
    idFactura:          number;
    numeroArchivo?:          number;
    codigoError:         number;
    descripcion:       string;
    advertencia?:          boolean;
    idPaquete?:        number;
    idMasivo?:        number;
    idPaqueteContingencia?:        number;
}

