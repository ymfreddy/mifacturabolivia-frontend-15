export interface BusquedaVenta {
    idEmpresa: number;
    nitEmpresa?: number;
    idVenta?: number;
    idSucursal: number;
    fechaInicio?: string;
    fechaFin?: string;
    idsTiposVenta: string;
    idsEstadosVenta: string;
    usuario?: string;
    codigoCliente?: string;
    correlativo?: string;
    soloCreditos?: boolean;
}

export interface BusquedaVentaCliente {
    idEmpresa: number;
    usuario: string;
    idSucursal?: number;
    idsEstadosVenta: string;
    fechaInicio?: string;
    fechaFin?: string;
}
