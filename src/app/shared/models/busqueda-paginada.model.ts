export interface BusquedaPaginada {
    idEmpresa?: number;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden?: number|1|-1;
    filtro?: string ;
    campoEspecifico?: string ;
}
