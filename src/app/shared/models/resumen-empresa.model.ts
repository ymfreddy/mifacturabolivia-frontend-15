export interface ResumenEmpresa {
    cantidadVentasDia:        number;
    montoVentasDia:           number;
    cantidadComprasDia:       number;
    cantidadTraspasosDia:     number;
    listaPoductosMasVendidos: ListaPoductosMasVendido[];
    listaVentasRecientes:     ListaVentasReciente[];
    listaTipoVenta:     listaTipoVenta;
}

export interface ListaPoductosMasVendido {
    categoria:      string;
    codigoProducto: string;
    producto:       string;
    cantidad:       number;
    porcentaje:     number;
}

export interface ListaVentasReciente {
    correlativo: string;
    numeroSucursal:         number;
    codigoCliente: string;
    nombreCliente: string;
    total:         number;
    estadoVenta:   string;
    tipoVenta:     string;
}

export interface listaTipoVenta {
    contado: ResumenMesCantidadDto[];
    credito: ResumenMesCantidadDto[];
}

export interface ResumenMesCantidadDto {
    mes: string;
    cantidad:  number;
}
