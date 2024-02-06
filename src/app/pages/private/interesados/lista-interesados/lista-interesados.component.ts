import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Interesado } from 'src/app/shared/models/interesado.model';
import { InteresadosService } from 'src/app/shared/services/interesados.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { BusquedaPaginada } from 'src/app/shared/models/busqueda-paginada.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-interesados',
  templateUrl: './lista-interesados.component.html',
  styleUrls: ['./lista-interesados.component.scss']
})
export class ListaInteresadosComponent implements OnInit {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Interesado[];
    itemDialog!: boolean;

    totalRecords: number = 0;
    loading!: boolean;

    busqueda: BusquedaPaginada = {
        idEmpresa: this.sessionService.getSessionEmpresaId(),
        pagina:1,
        cantidadItems:10,
        tipoOrden: 1,
        campoOrden: '',
        filtro:'',
    };
    constructor(
        private interesadosService: InteresadosService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private router: Router,
    ) {}

    ngOnInit(): void {
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
        this.interesadosService.getPaged(this.busqueda).subscribe({
            next: (res) => {
                this.items = res.content.items;
                console.log(res.content.items);
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
        this.sessionService.setRegistroInteresado(null);
        this.router.navigate(['/adm/gestion-interesado']);
    }

    editItem(item: Interesado) {
        this.interesadosService.getAddress(item.id).subscribe({
            next: (res) => {
                item.direcciones = res.content;
                this.sessionService.setRegistroInteresado(item);
                this.router.navigate(['/adm/gestion-interesado']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    deleteItem(item: Interesado) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a '+item.nombre+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.interesadosService.delete(item).subscribe({
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
    }
}
