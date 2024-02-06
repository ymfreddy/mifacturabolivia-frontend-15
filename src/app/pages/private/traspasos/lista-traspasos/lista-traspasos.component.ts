import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Traspaso } from 'src/app/shared/models/traspaso.model';
import { TraspasosService } from 'src/app/shared/services/traspasos.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { ConfirmationService } from 'primeng/api';
import { spv } from 'src/app/shared/constants/spv';
import { adm } from 'src/app/shared/constants/adm';
import { FormularioTraspasoComponent } from '../formulario-traspaso/formulario-traspaso.component';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-lista-traspasos',
    templateUrl: './lista-traspasos.component.html',
    styleUrls: ['./lista-traspasos.component.scss'],
    providers: [DialogService],
})
export class ListaTraspasosComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;

    items!: Traspaso[];
    listaEstadosTraspaso: Parametrica[] = [];
    listaSucursales: Sucursal[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    constructor(
        private fb: FormBuilder,
        private traspasoService: TraspasosService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
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
        this.cargarParametricas();

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            idSucursalOrigen: [{ value: this.esSuperAdm() ? null :this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            idSucursalDestino: null,
            idEstadoTraspaso: null,
            fechaInicio: [new Date(), Validators.required],
            fechaFin: [new Date(), Validators.required],
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
        this.traspasoService.get(this.criteriosBusquedaForm.value).subscribe({
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

    esEditable(idEstado: number) {
        return idEstado == spv.ESTADO_TRASPASO_SOLICITADO;
    }

    newItem() {
        const ref = this.dialogService.open(FormularioTraspasoComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { listaSucursales: this.listaSucursales, data: {} },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Traspaso) {
        const ref = this.dialogService.open(FormularioTraspasoComponent, {
            header: 'Finalizar',
            width: '80%',
            data: { listaSucursales: this.listaSucursales, data: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    deleteItem(item: Traspaso) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar el traspaso '+item.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.traspasoService.delete(item).subscribe({
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
        this.criteriosBusquedaForm.controls['idSucursalOrigen'].setValue(null);
        this.criteriosBusquedaForm.controls['idSucursalDestino'].setValue(null);
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

    cargarParametricas(){
        this.parametricasService
            .getParametricasByTipo(TipoParametrica.ESTADO_TRASPASO)
            .subscribe((data) => {
                this.listaEstadosTraspaso = data as unknown as Parametrica[];
            });
    }
}
