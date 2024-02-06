export interface BusquedaEstudiante {
    idEmpresa?: number;
    numeroDocumento?: string;
    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
}

export interface BusquedaEstudiantePaginado {
    idEmpresa?: number;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden: number|1|-1;
    filtro?: string ;
}
