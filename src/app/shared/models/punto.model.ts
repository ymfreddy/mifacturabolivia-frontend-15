export interface PuntoVenta {
    id:                   number;
    idEmpresa:            number;
    nit?:                  number;
    codigoTipoPuntoVenta: number;
    codigoTipoEmision?:    number;
    numeroSucursal:       number;
    numeroPuntoVenta:     number;
    nombre:               string;
    descripcion:          string;
    direccionSucursal?:    string;
    tipoPuntoVenta?:       string;
    tipoEmision?:          string;
    sincronizado?:         boolean;
}
