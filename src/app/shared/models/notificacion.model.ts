export interface Notificacion {
  //uuid: string;
  id: string;
  titulo: string;
  mensaje: string;
  nit: number;
  usuario: string;
  fecha: any;
}


export interface NotificacionCliente {
    //uuid: string;
    id: string;
    idNotificacion: string;
    nit: number;
    usuario: string;
    fechaLectura?: Date;
    leido: boolean
  }
