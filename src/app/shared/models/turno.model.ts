export interface Turno {
  id: number;
  idSucursal: number;
  idPuntoVenta: number;
  usuario: string;
  nombreUsuario: string;
  idEstadoTurno: number;
  estadoTurno: number;
  base: number;
  montoTotalCaja: number;
  montoTotalActual: number;
  montoTotalDiferencia: number;
  fechaApertura: Date;
  fechaCierre: Date;
  observaciones: string;
  numeroSucursal?: number;
  numeroPuntoVenta?: number;
  detalle: TurnoDetalle[];
}

export interface TurnoDetalle {
    id?: number;
    idTurno: number;
    codigoTipoPago: number;
    tipoPago: string;
    montoTotalCaja: number;
    montoTotalActual: number;
    montoTotalDiferencia: number;
  }

  export interface TurnoCierre {
    id: number;
    montoTotalCaja: number;
    montoTotalActual: number;
    montoTotalDiferencia: number;
    observaciones: string;
    detalle: TurnoDetalle[];
  }
