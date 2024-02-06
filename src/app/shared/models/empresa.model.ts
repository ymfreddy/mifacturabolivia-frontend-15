import { Sucursal } from './sucursal.model';

export interface Empresa {
  id: number;
  nombre: string;
  representanteLegal: string;
  nit: number;
  facturaRollo: boolean;
  mensajeFactura: string;
  envioEmail: boolean;
  envioEmailCopia: boolean;
  copiaImpresion: boolean;
  conexionAutomatica: boolean;
  email: string;
  sigla: string;
  restaurante: boolean;
  impresionDirecta: boolean;
  categoriasOnline: string;
  sucursales?: Sucursal[];
  descripcionAdicionalProducto: boolean;
}
