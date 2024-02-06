export interface Paquete {
    idPaqueteContingencia:  number;
    cufd:                   string;
    codigoRecepcionPaquete: string;
    codigoEstadoPaquete:    number;
    codigoDocumentoSector:  number;
    documentoSector:        string;
    cantidad:               number;
    idEvento:               number;
    codigoRecepcionEvento:  string;
    codigoMotivo:           string;
    cufdEvento:             string;
    descripcion:            string;
    inicioEvento:           string;
    finEvento:              string;
    cafc:                   string;
}
