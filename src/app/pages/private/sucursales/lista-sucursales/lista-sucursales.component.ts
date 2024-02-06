import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioSucursalComponent } from '../formulario-sucursal/formulario-sucursal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { adm } from 'src/app/shared/constants/adm';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-lista-sucursales',
    templateUrl: './lista-sucursales.component.html',
    styleUrls: ['./lista-sucursales.component.scss'],
    providers: [DialogService],
})
export class ListaSucursalesComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Sucursal[];
    itemDialog!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    constructor(
        private sucursalesService: SucursalesService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private empresasService: EmpresasService,
        private sessionService: SessionService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.isSuperAdmin() || !this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.empresasService
        .get()
        .subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
                this.idEmpresa=this.sessionService.getSessionEmpresaId();
                this.loadData();
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }


    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            return;
        }
        this.loadData();
    }

    loadData(): void {
        this.sucursalesService.getByIdEmpresa(this.idEmpresa).subscribe({
            next: (res) => {
                this.items = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioSucursalComponent, {
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

    editItem(item: Sucursal) {
        const ref = this.dialogService.open(FormularioSucursalComponent, {
            header: 'Actualizar',
            width: '80%',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    deleteItem(item: Sucursal) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la sucursal '+item.direccion+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.sucursalesService.delete(item).subscribe({
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



    esSuperAdmin(){
        return this.sessionService.getSessionUserData().idTipoUsuario===adm.TIPO_USUARIO_SUPERADMIN;
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
