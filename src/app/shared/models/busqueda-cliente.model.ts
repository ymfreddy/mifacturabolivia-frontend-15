export interface BusquedaCliente {
    idEmpresa?: number;
    codigoTipoDocumento?: number;
    codigoCliente?: string;
    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
}

export interface BusquedaClientePaginado {
    idEmpresa?: number;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden: number|1|-1;
    filtro?: string ;
}
