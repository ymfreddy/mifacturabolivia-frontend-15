export interface Mesa {
  id: number;
  numero: number;
  lugar: string;
  idSucursal: number;
  idEmpresa: number;
}

export interface MesaAtencion {
    id: number;
    numero: number;
    lugar: string;
    estadoMesa: string;
    cantidadReservas: number;
    idVentaActivo: number;
  }

export interface MesaGrupo {
  lugar: string;
  mesas: MesaAtencion[];
}

export interface MesaGrupoGestion {
    lugar: string;
    mesas: Mesa[];
  }
