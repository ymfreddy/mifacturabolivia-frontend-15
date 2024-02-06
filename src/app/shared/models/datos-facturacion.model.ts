export interface SucursalPuntoDatosFacturacion {
    codigoAsociacion:      string;
    idEmpresa:            number;
    nit:                  number;
    idPuntoVenta:           number;
    sucursal:       number;
    puntoVenta:     number;
    nombre:               string;
    tipoPuntoVenta:       string;
    sincronizado:         boolean;
    cuis?: string;
    fechaVigenciaCuis?: Date;
    cufd?: string;
    fechaVigenciaCufd?: Date;
    tipoEmision?:          string;
  }

export interface DatosFacturacion {
  codigoAsociacion: string;
  nit: number;
  nombreSistema: string;
  modalidad: number;
  codigoTipoEmision: number;
  tipoEmision: string;
  ambiente: number;
  sucursal: number;
  puntoVenta: number;
  cuis: string;
  cufd: string;
  fechaVigencia: Date;
}

export interface Cuis {
    id: number;
    codigoAsociacion: string;
    nit: number;
    nombreSistema: string;
    modalidad: number;
    ambiente: number;
    codigoDocumentoSector: number;
    documentoSector: string;
    sucursal: number;
    puntoVenta: number;
    cuis: string;
    fechaVigencia: Date;
  }
