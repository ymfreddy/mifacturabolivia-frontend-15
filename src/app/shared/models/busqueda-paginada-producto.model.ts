export interface BusquedaPaginadaProducto {
    idEmpresa?: number;
    idSucursal?: number;
    idProducto?: number;
    idsTipoProducto?: number;
    idsCategorias?: string;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden?: number|1|-1;
    filtro?: string ;
    campoEspecifico?: string ;
}
