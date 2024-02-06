export interface Interesado {
  id: number;
  idEmpresa: number;
  numeroDocumento: string;
  idEspecialidad: number;
  especialidad: string;
  nombre: string;
  telefono: string;
  idUsuario:number;
  usuario?: string;
  direcciones?: InteresadoDireccion[];
  itemsEliminados?:  number[]|null;
}

export interface InteresadoDireccion {
    id: number;
    idInteresado: number;
    zona: string;
    direccion: string;
    tipoPuestoTrabajo: string ;
    puestoTrabajo: string ;
    dias: string;
    turnos: string;
    horarios: string;
    latitud: number;
    longitud:number;
    interesado?: string;
    telefono?: string;
    especialidad?: string;
	idUsuario? :number;
	usuario?: string
	idEmpresa? :number;
  }

  export interface BusquedaZona {
    termino?: string;
    cantidadRegistros?: number;
}

export interface BusquedaSugerenciaAsignacion {
    idEmpresa: number;
    fecha: string;
    idUsuario?: number;
    zona?: string;
}




