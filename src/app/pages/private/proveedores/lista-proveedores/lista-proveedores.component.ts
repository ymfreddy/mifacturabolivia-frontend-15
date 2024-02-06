import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { Proveedor } from 'src/app/shared/models/proveedor.model';
import { ProveedoresService } from 'src/app/shared/services/proveedores.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioProveedorComponent } from '../formulario-proveedor/formulario-proveedor.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';

@Component({
    selector: 'app-lista-proveedores',
    templateUrl: './lista-proveedores.component.html',
    styleUrls: ['./lista-proveedores.component.scss'],
    providers: [DialogService],
})
export class ListaProveedoresComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Proveedor[];
    itemDialog!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;

    constructor(
        private proveedoresService: ProveedoresService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private empresasService: EmpresasService
    ) {}


    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.idEmpresa = this.sessionService.getSessionEmpresaId();
        this.cargarEmpresas();
        this.loadData();
    }

    loadData(): void {
        this.proveedoresService.getByIdEmpresa(this.idEmpresa).subscribe({
            next: (res) => {
                this.items = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioProveedorComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { idEmpresa: this.idEmpresa },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Proveedor) {
        const ref = this.dialogService.open(FormularioProveedorComponent, {
            header: 'Actualizar',
            width: '80%',
            data: { idEmpresa: this.idEmpresa, item: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj => obj.id == res.id));
                this.items[objIndex]=res;
            }
        });
    }

    deleteItem(item: Proveedor) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a '+item.nombre+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.proveedoresService.delete(item).subscribe({
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

    cargarEmpresas(){
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
    }

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            return;
        }
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.loadData();
    }
}
