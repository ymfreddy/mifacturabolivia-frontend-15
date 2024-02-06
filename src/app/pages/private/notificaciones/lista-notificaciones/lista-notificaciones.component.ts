import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioNotificacionComponent } from '../formulario-notificacion/formulario-notificacion.component';
import { Notificacion } from 'src/app/shared/models/notificacion.model';
import { NotificacionesService } from '../../../../shared/services/notificaciones.service';
import { NotificacionesClienteService } from '../../../../shared/services/notificaciones-cliente.service';

@Component({
  selector: 'app-lista-notificaciones',
  templateUrl: './lista-notificaciones.component.html',
  styleUrls: ['./lista-notificaciones.component.scss'],
  providers: [DialogService],
})
export class ListaNotificacionesComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    itemSelected!: Notificacion;
    items!: any[];
    itemDialog!: boolean;
    display: boolean = false;
    qrUrl:string='';
    fileImagen: any;
    cantidadRegistros: number = 5;

    constructor(
        private empresasService: EmpresasService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private fileService: FilesService,
        private confirmationService: ConfirmationService,
        private sessionService: SessionService,
        private router: Router,
        private notificacionesService: NotificacionesService,
        private notificacionesClienteService: NotificacionesClienteService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.isSuperAdmin() || !this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }
        this.loadData();
    }

    loadData(): void {
        let subscription = this.notificacionesService.getAll(this.cantidadRegistros).subscribe((data)=>{
            console.log(data);
            this.items = data;
            subscription.unsubscribe();
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioNotificacionComponent, {
            header: 'Nuevo',
            width: '80%',
            data: {},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.items.push(res);
            }
        });
    }

    editItem(item: Notificacion) {
        this.itemSelected = item;
        const ref = this.dialogService.open(FormularioNotificacionComponent, {
            header: 'Actualizar',
            width: '80%',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj => obj.id == res.id));
                this.items[objIndex]=res;
            }
        });
    }

    deleteItem(item: Notificacion) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar el registro seleccionado?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.notificacionesService.delete(item.id)
                .then((result:any) => {
                    this.informationService.showSuccess("Notificacion Eliminada");
                    // se elimina los mensajes de los clientes
                    this.notificacionesClienteService.deleteByIdNotificacion(item.id);
                    // se elimina el registro
                    this.items = this.items.filter(x=>x.id!=item.id);
                }).catch((err:any) => {
                    console.log(err);
                    this.informationService.showError(err);
                });
                /*this.empresasService.delete(item).subscribe({
                    next: (res) => {
                        this.items = this.items.filter((x) => x.id !== item.id);
                        this.informationService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });*/
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}
