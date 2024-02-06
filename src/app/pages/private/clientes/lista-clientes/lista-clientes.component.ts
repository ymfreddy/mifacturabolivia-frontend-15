import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioClienteComponent } from '../formulario-cliente/formulario-cliente.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { BusquedaPaginada } from 'src/app/shared/models/busqueda-paginada.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-lista-clientes',
    templateUrl: './lista-clientes.component.html',
    styleUrls: ['./lista-clientes.component.scss'],
    providers: [DialogService],
})
export class ListaClientesComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Cliente[];
    itemDialog!: boolean;

    totalRecords: number = 0;
    loading!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;

    busqueda: BusquedaPaginada;
    constructor(
        private clientesService: ClientesService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private empresasService: EmpresasService,
        private router: Router,
    ) {
        this.busqueda = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            pagina:1,
            cantidadItems:10,
            tipoOrden: 1,
            campoOrden: '',
            filtro:'',
        };
    }

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.idEmpresa = this.busqueda.idEmpresa!;

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

    loadPaged(event: LazyLoadEvent) {
        this.busqueda = {
            ... this.busqueda,
            pagina:event.first!/event.rows! + 1,
            cantidadItems:event.rows ?? 10,
            campoOrden: event.sortField,
            tipoOrden: event.sortOrder!,
            filtro: event.globalFilter!
        }

        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.clientesService.getPaged(this.busqueda).subscribe({
            next: (res) => {
                this.items = res.content.items;
                this.totalRecords = res.content.totalItems;
                this.loading = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.loading = false;
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioClienteComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { idEmpresa: this.idEmpresa},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Cliente) {
        /*if (item.codigoCliente=="0"||
        item.codigoCliente=="99001" ||
        item.codigoCliente=="99002" ||
        item.codigoCliente=="99003"){
            this.informationService.showWarning('No puede modificar clientes con código especial');
            return;
        }*/


        const ref = this.dialogService.open(FormularioClienteComponent, {
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

    deleteItem(item: Cliente) {
        if (item.codigoCliente=="0"||
        item.codigoCliente=="99001" ||
        item.codigoCliente=="99002" ||
        item.codigoCliente=="99003"){
            this.informationService.showWarning('No puede eliminar clientes con código especial');
            return;
        }
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a '+item.nombre+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.clientesService.delete(item).subscribe({
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

    onGlobalFilterClick(table: Table, text: string) {
        if (text.trim()===''){
            this.informationService.showInfo('Debe introducir un filtro');
            return;
        }
        table.filterGlobal(text, 'contains');
    }

    onGlobalFilterClear(table: Table) {
        table.filterGlobal('', 'contains');
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
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.busqueda = {
            ... this.busqueda,
            idEmpresa: this.idEmpresa,
            pagina: 1,
            campoOrden: '',
            tipoOrden: 1,
            filtro: event.globalFilter!
        }
        this.loadData();
    }
}
