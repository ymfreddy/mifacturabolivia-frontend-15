import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { BusquedaUsuario } from 'src/app/shared/models/busqueda-usuario.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { Notificacion, NotificacionCliente } from 'src/app/shared/models/notificacion.model';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { NotificacionesClienteService } from 'src/app/shared/services/notificaciones-cliente.service';
import { NotificacionesService } from 'src/app/shared/services/notificaciones.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';

@Component({
  selector: 'app-formulario-notificacion',
  templateUrl: './formulario-notificacion.component.html',
  styleUrls: ['./formulario-notificacion.component.scss'],
  providers: [DialogService],
})
export class FormularioNotificacionComponent implements OnInit {
    itemsCollection!: AngularFirestoreCollection<Notificacion>;

    item?: Notificacion;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaEmpresas: Empresa[] = [];
    listaUsuarios: Usuario[] = [];


    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private empresasService: EmpresasService,
        private informationService: InformationService,
        private notificacionesService: NotificacionesService,
        private notificacionesClienteService: NotificacionesClienteService,
        private usuariosService: UsuariosService,
        private utilidadesService: UtilidadesService,
    ) {}

    ngOnInit(): void {
        this.empresasService.get().subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        this.item = this.config.data;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            nit: [this.item?.nit],
            usuario: [this.item?.usuario],
            titulo: [this.item?.titulo, Validators.required],
            mensaje: [this.item?.mensaje, Validators.required],
        });
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            const notificacion: Notificacion = {
                id: this.notificacionesService.generateId(),
                nit: this.itemForm.controls['nit'].value??0,
                usuario: this.itemForm.controls['usuario'].value,
                titulo: this.itemForm.controls['titulo'].value,
                mensaje: this.itemForm.controls['mensaje'].value,
                fecha: new Date()
            };
            this.submited = true;
                this.notificacionesService.create(notificacion).then((result:any) => {
                    this.enviarMensajes(notificacion);
                }).catch((err:any) => {
                    console.log(err);
                    this.informationService.showError(err);
                });
        }
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.nit===event.value)!;
        this.listaUsuarios = [];
        this.itemForm.controls['usuario'].setValue(null);
        this.cargarUsuarios(empresaAux.id);
    }

    cargarUsuarios(idEmpresa:number){
        const busqueda: BusquedaUsuario = {
            idEmpresa: idEmpresa,
            resumen: true,
        };
        this.usuariosService.get(busqueda).subscribe({
            next: (res) => {
                this.listaUsuarios = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    private enviarMensajes(notificacion: Notificacion){
        if(notificacion.nit==0){
            // se envia a todos
            this.listaEmpresas.forEach(empresa => {
                const busqueda: BusquedaUsuario ={ idEmpresa: empresa.id  };
                this.usuariosService.get(busqueda).subscribe({
                    next: (res) => {
                        const usuarios :Usuario[] = res.content;
                        usuarios.forEach(usuario => {
                            if (usuario.enabled){
                                const notificacionCliente: NotificacionCliente = {
                                    id: this.notificacionesClienteService.generateId(),
                                    idNotificacion: notificacion.id,
                                    nit : empresa.nit,
                                    usuario: usuario.username,
                                    leido: false
                                };
                                this.notificacionesClienteService.create(notificacionCliente);
                            }
                        });
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            });
            this.utilidadesService.sendNotificationPushGlobal(notificacion.titulo, notificacion.mensaje).subscribe({
                next: (res) => {
                    console.log(res);
                },
                error: (err) => {
                    console.log(err);
                },
            });

            this.informationService.showSuccess('mensajes enviados a todos');
            this.dialogRef.close(notificacion);
        }
        else if(notificacion.usuario){
            // SOLO SE ENVIA AL USUARIO ESPECIFICO
            const notificacionCliente: NotificacionCliente = {
                id: this.notificacionesClienteService.generateId(),
                idNotificacion: notificacion.id,
                nit : notificacion.nit,
                usuario: notificacion.usuario,
                leido: false
            };
            this.notificacionesClienteService.create(notificacionCliente);
            const usuarioSeleccionado = this.listaUsuarios.find(x=>x.username==notificacion.usuario);
                this.utilidadesService.sendNotificationPushUsers(usuarioSeleccionado!.id.toString() ,notificacion.titulo, notificacion.mensaje).subscribe({
                    next: (res) => {
                        console.log(res);
                    },
                    error: (err) => {
                        console.log(err);
                    },
                });

            this.informationService.showSuccess('mensaje enviado al usuario seleccionado');
            this.dialogRef.close(notificacion);
        }
        else{
            // se envia a todos los usuarios del nit solo al nit
            const empresa = this.listaEmpresas.find(x=>x.nit==notificacion.nit);
            const busqueda: BusquedaUsuario ={ idEmpresa: empresa!.id  };
            this.usuariosService.get(busqueda).subscribe({
                next: (res) => {
                    const usuarios :Usuario[] = res.content;
                    usuarios.forEach(usuario => {
                        if (usuario.enabled){
                            const notificacionCliente: NotificacionCliente = {
                                id: this.notificacionesClienteService.generateId(),
                                idNotificacion: notificacion.id,
                                nit : empresa!.nit,
                                usuario: usuario.username,
                                leido: false
                            };
                            this.notificacionesClienteService.create(notificacionCliente);
                        }
                    });

                    const usuariosIds = Array.prototype.map.call(usuarios, function(item) { return item.id; }).join(",");
                    this.utilidadesService.sendNotificationPushUsers(usuariosIds,notificacion.titulo, notificacion.mensaje).subscribe({
                        next: (res) => {
                            console.log(res);
                        },
                        error: (err) => {
                            console.log(err);
                        },
                    });

                    this.informationService.showSuccess('mensajes enviados al nit seleccionado');
                    this.dialogRef.close(notificacion);
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
        }
    }

}

