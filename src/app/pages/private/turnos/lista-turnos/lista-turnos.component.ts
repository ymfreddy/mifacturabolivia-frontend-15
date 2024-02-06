import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Turno } from 'src/app/shared/models/turno.model';
import { TurnosService } from 'src/app/shared/services/turnos.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { FormularioTurnoCierreComponent } from '../formulario-turno-cierre/formulario-turno-cierre.component';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { FormularioTurnoAperturaComponent } from '../formulario-turno-apertura/formulario-turno-apertura.component';
import { adm } from 'src/app/shared/constants/adm';
import { Router } from '@angular/router';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';

@Component({
    selector: 'app-lista-turnos',
    templateUrl: './lista-turnos.component.html',
    styleUrls: ['./lista-turnos.component.scss'],
    providers: [DialogService],
})
export class ListaTurnosComponent implements OnInit, OnDestroy {
    criteriosBusquedaForm!: FormGroup;
    onDestroy$: Subject<boolean> = new Subject();
    itemSelected!: Turno;
    items!: Turno[];
    listaEstadosTurno: Parametrica[] = [];
    listaSucursales: Sucursal[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    constructor(
        private fb: FormBuilder,
        private turnosService: TurnosService,
        private sessionService: SessionService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private router: Router,
        private empresasService: EmpresasService
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
            idSucursal: [{ value: this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            idEstadoTurno: null,
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
        this.turnosService.get(this.criteriosBusquedaForm.value).subscribe({
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

    closeItem(item: Turno) {
        this.itemSelected = item;
        const ref = this.dialogService.open(FormularioTurnoCierreComponent, {
            header: 'Cerrar Turno',
            width: '550px',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    open() {
        const ref = this.dialogService.open(FormularioTurnoAperturaComponent, {
            header: 'Abrir Turno',
            width: '350px',
            data: {},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
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
            .getParametricasByTipo(TipoParametrica.ESTADO_TURNO)
            .subscribe((data) => {
                this.listaEstadosTurno = data as unknown as Parametrica[];
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
}
