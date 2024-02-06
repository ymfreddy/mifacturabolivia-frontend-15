export interface ProductoInventario extends Producto {
    idSucursal: number;
    numeroSucursal: number;
    saldoTotal?: number;
}

export interface Producto {
  id: number;
  idTipoProducto: number;
  idCategoria: number;
  idEmpresa: number;
  codigoProducto: string;
  codigoActividad: string;
  codigoProductoSin: number;
  codigoTipoUnidad: number;
  nombre: string;
  descripcion: string;
  costo: number;
  precio: number;
  imagenNombre: string;
  imagenRuta: string;
  tipoProducto: string;
  categoria: string;
  actividad: string;
  productoSin: string;
  tipoUnidad: string;
  cantidadMinimaAlerta: number;
  saldos?: SaldoProducto[];
  descuento?: DescuentoProducto;
  codigoTipoHabitacion?: number;
  tipoHabitacion?: string;
  precioIce?: number;
}

export interface DescuentoProducto {
	id?: number;
	idDescuento? :number;
	idTipoDescuento? : number;
	tipoDescuento? : string;
	descuentoEstablecido? : number;
	descuento: number;
}

export interface SaldoProducto {
	idProducto?: number;
	codigoStock? :string;
	precioCompra? : number;
	precioVenta? : number;
	saldo?: number;
}

export interface ProductoResumen {
    id: number;
    idTipoProducto: number;
    codigoProducto: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagenNombre: string;
    imagenRuta: string;
    descuento?: DescuentoProducto;
    saldo?: SaldoProducto;
    codigoProductoStock: string;
    precioIce: number;
  }



  export interface SolicitudProductoMasivo {
    nit: number;
    sucursal: number;
    descripcion: string;
    nitProveedor: number;
    lista: any[];
  }
