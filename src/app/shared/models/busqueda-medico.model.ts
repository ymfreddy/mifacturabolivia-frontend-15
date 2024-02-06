export interface BusquedaMedico {
    idEmpresa?: number;
    nitDocumento?: number;
    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
}

export interface BusquedaMedicoPaginado {
    idEmpresa?: number;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden: number|1|-1;
    filtro?: string ;
}
