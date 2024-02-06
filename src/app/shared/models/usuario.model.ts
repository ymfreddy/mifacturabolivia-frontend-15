export interface Usuario {
  id: number;
  idEmpresa: number;
  idSucursal: number;
  idTipoUsuario: number;
  tipoUsuario: string;
  nombre: string;
  paterno: string;
  materno: string;
  nombreCompleto: string;
  ci: string;
  celular: number;
  username: string;
  password: string;
  cambiarClave: boolean;
  enabled: boolean;
  empresaNombre: string;
  empresaNit: number;
  email: string;
  opciones: string;
  asociaciones: string;
  categorias: string;
}

export interface UsuarioClienteRegistro {
    nombre: string;
    paterno: string;
    ci: number;
    email: string;
    password: string;
  }

