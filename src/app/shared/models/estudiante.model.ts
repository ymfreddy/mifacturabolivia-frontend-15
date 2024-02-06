export interface Estudiante {
  id: number;
  idEmpresa: number;
  codigoEstudiante: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto?: string;
  curso?: string;
  idGrado?: number;
  grado?: string;
  idTurno?: number;
  turno?: string;
}
