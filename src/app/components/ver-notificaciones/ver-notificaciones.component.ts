import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Notificacion, NotificacionCliente } from 'src/app/shared/models/notificacion.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { NotificacionesClienteService } from 'src/app/shared/services/notificaciones-cliente.service';
import { NotificacionesService } from 'src/app/shared/services/notificaciones.service';

@Component({
  selector: 'app-ver-notificaciones',
  templateUrl: './ver-notificaciones.component.html',
  styleUrls: ['./ver-notificaciones.component.scss']
})
export class VerNotificacionesComponent implements OnInit {
    items!: NotificacionCliente[];
    notificaciones!: any[];

  constructor(
    public config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private sessionService: SessionService,
    private notificacionesService: NotificacionesService,
    private notificacionesClienteService: NotificacionesClienteService,
  ) { }

  ngOnInit(): void {
    this.items = this.config.data as NotificacionCliente[];
    const ids = this.items.map(a => a.idNotificacion);
    console.log(this.items);
    this.notificacionesService.getByIds(ids).subscribe((data)=>{
        console.log('notificvaciones:'+data);
        this.notificaciones = data;
    });
  }

  public leer(): void {
    this.dialogRef.close(null);
    }

    public onClose(): void {
        this.dialogRef.close(null);
    }

    public onRead(): void {
        this.items.forEach(element => {
            element.leido=true;
            element.fechaLectura = new Date();
            this.notificacionesClienteService.update(element);
        });
        this.dialogRef.close(null);
    }
}
