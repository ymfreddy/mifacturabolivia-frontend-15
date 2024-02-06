export interface Asociacion {
  id: number;
  codigoAsociacion: string;
  idSistema: number;
  idEmpresa: number;
  idEstadoAsociacion: number;
  ambiente: number;
  nit?: number;
  nombreSistema?: string;
  modalidad: number;
  token: string;
  estadoAsociacion?: string;
  nombreEmpresa?: string;
  privateKey?: string;
  publicKey?: string;
  conexionAutomatica?: boolean;
}
