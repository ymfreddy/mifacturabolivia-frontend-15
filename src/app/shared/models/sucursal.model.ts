export interface Sucursal {
  id: number;
  direccion: string;
  telefono: string;
  casaMatriz: boolean;
  ciudad: string;
  numero: number;
  idEmpresa: number;
  nit?: number;
  puntosVenta: PuntoVentaResumen[]
  impresora?: string;
  impresoraUno?: string;
  impresoraDos?: string;
  impresoraDosCategorias?: string;
}

export interface PuntoVentaResumen {
    id:               number;
    numeroSucursal:   number;
    numeroPuntoVenta: number;
    nombre:           string;
  }

