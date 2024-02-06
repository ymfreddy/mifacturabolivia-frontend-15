import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { FormularioEmpresaComponent } from '../formulario-empresa/formulario-empresa.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/shared/security/session.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';

@Component({
    selector: 'app-lista-empresas',
    templateUrl: './lista-empresas.component.html',
    styleUrls: ['./lista-empresas.component.scss'],
    providers: [DialogService],
})
export class ListaEmpresasComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    itemSelected!: Empresa;
    items!: Empresa[];
    itemDialog!: boolean;
    display: boolean = false;
    qrUrl:string='';
    fileImagen: any;

    constructor(
        private empresasService: EmpresasService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private fileService: FilesService,
        private confirmationService: ConfirmationService,
        private sessionService: SessionService,
        private router: Router,
        private utilidadesService: UtilidadesService
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.isSuperAdmin() || !this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.loadData();
    }

    loadData(): void {
        this.empresasService.get().subscribe({
            next: (res) => {
                this.items = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioEmpresaComponent, {
            header: 'Nuevo',
            width: '80%',
            data: {},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Empresa) {
        this.itemSelected = item;
        const ref = this.dialogService.open(FormularioEmpresaComponent, {
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

    deleteItem(item: Empresa) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar el registro seleccionado?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.empresasService.delete(item).subscribe({
                    next: (res) => {
                        this.items = this.items.filter((x) => x.id !== item.id);
                        this.informationService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
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

    showQr() {
        this.utilidadesService.getQrWhatsapp().subscribe({
            next: (res) => {
                this.qrUrl="data:image/png;base64,"+res.content;
                this.display = true;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    cargarImagen(event: any, fileUpload: any, item: Empresa) {
        this.fileImagen = event.files[0];
        const formData = new FormData();
        formData.append('file', this.fileImagen);
        this.fileService.uploadLogo(formData, item.nit).subscribe({
            next: (resp) => {
                if (resp.success) {
                    this.informationService.showSuccess("Logo Actualizado!");
                }
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
        fileUpload.clear();
    }
}
