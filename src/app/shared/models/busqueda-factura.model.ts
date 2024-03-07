export interface BusquedaFactura {
    idEmpresa?: number;
    nitEmisor?: number;
    sucursal: number;
    puntoVenta?: number;
    codigoCliente?: string;
    cuf?: string;
    codigoRecepcion?: string;
    codigosEstados?: string;
    codigoDocumentoSector?:number;
    fechaInicio: string;
    fechaFin: string;
    cantidad?: number;
    usuario: string;
    educativo: boolean;
}

