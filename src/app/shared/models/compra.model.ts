export interface Compra {
    id:                 number;
    correlativo?:          string;
    fechaPedido:        string;
    usuarioPedido?:      string;
    idProveedor:        number;
    proveedor?:          string;
    idSucursal?:         number;
    idEstadoCompra?:     number;
    estadoCompra?:       string;
    sucursal?:           string;
    numeroSucursal?:     number;
    descripcion?:        string;
    numeroFactura?:      string;
    subtotal:           number;
    descuentos:         number;
    total:              number;
    fechaRecepcion?:     string;
    usuarioRecepcion?:   string;
    detalle?:           CompraDetalle[];
    itemsEliminados?:   number[]|null;
}

export interface CompraDetalle {
    id?:                number;
    cantidad:           number;
    idProducto?:        number;
    codigoProducto?:    string;
    producto?:          string;
    precio:             number;
    total:              number;
    ubicacion?:         string;
    fechaVencimiento?:  string;
    precioVenta:             number;
}
