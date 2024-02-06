export interface Cliente {
  id: number;
  idEmpresa: number;
  codigoCliente: string;
  codigoTipoDocumentoIdentidad: number;
  tipoDocumentoIdentidad: string;
  numeroDocumento: string;
  complemento: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  sinResidencia: boolean
}
