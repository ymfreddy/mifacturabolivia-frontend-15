export interface SessionUsuario {
    id: number;
    username: string;
    idTipoUsuario: number;
    tipoUsuario: string;
    idTurno: number;
    nombreCompleto: string;
    idEmpresa: number;
    idSucursal: number;
    idPuntoVenta: number;
    empresaNombre: string;
    empresaNit: number;
    numeroSucursal?: number;
    numeroPuntoVenta?: number;
    cambiarClave: boolean;
    asociaciones: Asociacion[];
    categorias: string;
    ci: string;
    restaurante: boolean;
    impresionDirecta: boolean;
    descripcionAdicionalProducto: boolean;
    facturaIce: boolean;
    facturaEducativo: boolean;
}

export interface Asociacion {
    id: number;
    codigoAsociacion: string;
    nombreSistema: string;
    ambiente: string;
    codigoDocumentoSector: number;
    modalidad: string;
    documentoSector: string;
    conexionAutomatica: boolean;
}
