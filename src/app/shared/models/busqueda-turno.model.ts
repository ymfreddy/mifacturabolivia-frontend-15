export interface BusquedaTurno {
    usuario?: string;
    idEmpresa?: number;
    idSucursal?: number;
    idPuntoVenta?: number;
    idEstadoTurno?: number;
    fechaInicio: string;
    fechaFin: string;
}
