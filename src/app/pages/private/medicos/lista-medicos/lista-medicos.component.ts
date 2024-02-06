import { Component, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Medico } from 'src/app/shared/models/medico.model';
import { MedicosService } from 'src/app/shared/services/medicos.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioMedicoComponent } from '../formulario-medico/formulario-medico.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { BusquedaPaginada } from 'src/app/shared/models/busqueda-paginada.model';
import { read, utils } from 'xlsx';
import { adm } from 'src/app/shared/constants/adm';
import { Router } from '@angular/router';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';

@Component({
  selector: 'app-lista-medicos',
  templateUrl: './lista-medicos.component.html',
  styleUrls: ['./lista-medicos.component.scss']
})
export class ListaMedicosComponent implements OnInit {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Medico[];
    itemDialog!: boolean;

    totalRecords: number = 0;
    loading!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;

    busqueda: BusquedaPaginada;

    acceptedFiles: string = ".xls, .xlsx";
    blockedPanel: boolean = false;
    constructor(
        private medicosService: MedicosService,
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
        this.cargarEmpresas();
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
        this.medicosService.getPaged(this.busqueda).subscribe({
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
        const ref = this.dialogService.open(FormularioMedicoComponent, {
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

    editItem(item: Medico) {
        const ref = this.dialogService.open(FormularioMedicoComponent, {
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

    deleteItem(item: Medico) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a '+item.nombre+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.medicosService.delete(item).subscribe({
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
        return this.sessionService.getSessionUserData().idTipoUsuario===adm.TIPO_USUARIO_SUPERADMIN;
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

    cargarXls(event: any, fileUpload: any){
        if (event.files.length) {
            const file = event.files[0];
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;
                if (sheets.length) {
                    this.blockedPanel=true;
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    this.medicosService.addMasive(rows).subscribe({
                        next: (res) => {
                            this.loadData();
                            this.informationService.showSuccess(res.message);
                            this.blockedPanel=false;
                        },
                        error: (err) => {
                            this.informationService.showError(err.error.message);
                            this.blockedPanel=false;
                        },
                    });
                }
            }
            reader.readAsArrayBuffer(file);
        }

        fileUpload.clear();
    }
}
