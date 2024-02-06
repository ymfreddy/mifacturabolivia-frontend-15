import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Remision } from 'src/app/shared/models/remision.model';
import { RemisionesService } from 'src/app/shared/services/remisiones.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { adm } from 'src/app/shared/constants/adm';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { FormularioRemisionComponent } from '../formulario-remision/formulario-remision.component';
import * as printJS from "print-js";
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { Router } from '@angular/router';
import { EmpresasService } from 'src/app/shared/services/empresas.service';

@Component({
    selector: 'app-lista-remisiones',
    templateUrl: './lista-remisiones.component.html',
    styleUrls: ['./lista-remisiones.component.scss'],
    providers: [DialogService],
})
export class ListaRemisionesComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;

    items!: Remision[];
    listaEstadosRemision: Parametrica[] = [];
    listaTiposRemision: Parametrica[] = [];
    listaSucursales: Sucursal[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    itemsMenu!: MenuItem[];
    remisioneseleccionada!: Remision;
    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    constructor(
        private fb: FormBuilder,
        private remisionesService: RemisionesService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
        private utilidadesService: UtilidadesService,
        private fileService:FilesService,
        private empresasService: EmpresasService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }


        this.idEmpresa = this.sessionService.getSessionEmpresaId();

        this.cargarEmpresas();
        this.cargarSucursales();

        let fechaInicio = new Date();
        let fechaFin = new Date();


        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            idSucursal: [{ value: this.esSuperAdm() ? null: this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            fechaInicio: [fechaInicio, Validators.required],
            fechaFin: [fechaFin, Validators.required],
            codigoCliente: ''
        });
    }

    loadData(): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        // validar rango fecha
        if (
            this.criteriosBusquedaForm.controls['fechaFin'].value.getTime() -
                this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() <
            0
        ) {
            this.informationService.showWarning(
                'La fecha inicio no debe ser menor a la fecha fin'
            );
            return;
        }

        const dias = Math.round(
            Math.abs(
                (this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() -
                    this.criteriosBusquedaForm.controls[
                        'fechaFin'
                    ].value.getTime()) /
                    adm.UN_DIA
            )
        );
        if (dias > 31) {
            this.informationService.showWarning(
                'El rango de fechas debe ser menor o igual a 31 días'
            );
            return;
        }

        this.blockedPanel = true;
        this.remisionesService.get(this.criteriosBusquedaForm.value)
        .subscribe({
            next: (res) => {
                this.items = res.content;
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }


    newItem() {
        const ref = this.dialogService.open(FormularioRemisionComponent, {
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

    editItem(item: Remision) {
        const ref = this.dialogService.open(FormularioRemisionComponent, {
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

    printItem(item: Remision) {
        this.blockedPanel = true;
        const fileName = `remision-${
            item.correlativo
        }.pdf`;
        this.utilidadesService
            .getRemision(item.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, true);
                this.blockedPanel = false;
            });
    }

    deleteItem(item: Remision) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la remision ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remisionesService.delete(item).subscribe({
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

    public onSubmit(): void {
        this.loadData();
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
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
        this.criteriosBusquedaForm.controls['idSucursal'].setValue(null);
        this.cargarSucursales();
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

    cargarSucursales(){
        this.sucursalesService
        .getByIdEmpresa(this.idEmpresa)
        .subscribe({
            next: (res) => {
                this.listaSucursales = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }
}
