import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { Categoria } from 'src/app/shared/models/categoria.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioCategoriaComponent } from '../formulario-categoria/formulario-categoria.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-lista-categorias',
    templateUrl: './lista-categorias.component.html',
    styleUrls: ['./lista-categorias.component.scss'],
    providers: [DialogService],
})
export class ListaCategoriasComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Categoria[];
    itemDialog!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;

    constructor(
        private categoriasService: CategoriasService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private empresasService: EmpresasService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.idEmpresa = this.sessionService.getSessionEmpresaId();
        if (this.esSuperAdm()){
            this.empresasService
            .get()
            .subscribe({
                next: (res) => {
                    this.listaEmpresas = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
        }
        this.loadData();
    }

    loadData(): void {
        const busqueda = {
            idEmpresa : this.idEmpresa,
        }
        this.categoriasService.get(busqueda).subscribe({
            next: (res) => {
                this.items = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioCategoriaComponent, {
            header: 'Nuevo',
            width: '400px',
            data: { idEmpresa: this.idEmpresa},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Categoria) {
        const ref = this.dialogService.open(FormularioCategoriaComponent, {
            header: 'Actualizar',
            width: '400px',
            data: { idEmpresa: this.idEmpresa, item: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj => obj.id == res.id));
                this.items[objIndex]=res;
            }
        });
    }

    deleteItem(item: Categoria) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a '+item.nombre+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.categoriasService.delete(item).subscribe({
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

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            return;
        }

        this.idEmpresa = event.value;
        this.loadData();
    }
}
