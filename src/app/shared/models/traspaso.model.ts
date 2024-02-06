export interface Traspaso {
    id:                 number;
    correlativo?:    string;
    fechaSolicitud?:    string;
    usuarioSolicitud?:  string;
    idSucursalOrigen?:  number;
    sucursalOrigen?:    string;
    idSucursalDestino?: number;
    sucursalDestino?:   string;
    idEstadoTraspaso?:  number;
    estadoTraspaso?:    string;
    descripcion?:       string;
    fechaTraspaso?:     string;
    usuarioTraspaso?:   string;
    detalle?:           TraspasoDetalle[];
    itemsEliminados?:   number[]|null;
}

export interface TraspasoDetalle {
    id?:                number;
    cantidad:           number;
    idProducto?:        number;
    codigoProducto?:    string;
    producto?:          string;
    saldo?:             number;
    precioCompra?:      number;
    precioVenta?:       number;
    codigoStock?:       string;
}
