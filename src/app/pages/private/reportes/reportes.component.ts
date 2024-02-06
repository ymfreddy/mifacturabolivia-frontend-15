import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, delay } from 'rxjs';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { ReporteProductosMasVendidos } from 'src/app/shared/models/reporte-productos-mas-vendidos';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent implements OnInit {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    listaSucursales: Sucursal[] = [];
    listaEmpresas: Empresa[] = [];
    nitEmpresa!: number;
    idEmpresa!: number;
    blockedPanel: boolean = false;
    constructor(
        private fb: FormBuilder,
        private sessionService: SessionService,
        private informationService: InformationService,
        private sucursalesService: SucursalesService,
        public dialogService: DialogService,
        private utilidadesService: UtilidadesService,
        private helperService: HelperService,
        private datepipe: DatePipe,
        private fileService: FilesService,
        private empresasService: EmpresasService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.idEmpresa = this.sessionService.getSessionEmpresaId();
        this.nitEmpresa = this.sessionService.getSessionEmpresaNit();
        this.cargarEmpresas();
        this.cargarSucursales();
        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            nitEmisor: this.nitEmpresa,
            sucursal: [{ value: null, disabled: false }],
            cantidad: [5, Validators.required],
            fechaInicio: [new Date(), Validators.required],
            fechaFin: [new Date(), Validators.required],
        });
    }

    esSuperAdm() {
        return this.sessionService.isSuperAdmin();
    }

    cargarEmpresas() {
        if (this.esSuperAdm()) {
            this.empresasService.get().subscribe({
                next: (res) => {
                    this.listaEmpresas = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
        }
    }

    cargarSucursales() {
        this.sucursalesService.getByIdEmpresa(this.idEmpresa).subscribe({
            next: (res) => {
                this.listaSucursales = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(
            (x) => x.id === event.value
        )!;
        this.nitEmpresa = empresaAux.nit;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['nitEmisor'].setValue(
            empresaAux.nit
        );
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(
            empresaAux.id
        );

        this.criteriosBusquedaForm.controls['sucursal'].setValue(null);
        this.cargarSucursales();
    }
    public onSubmit(): void {
    }

    public reporteProductosMasVendidos(tipo: string): void {
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

        this.blockedPanel = true;
        const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio'].value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin'].value as Date;
        const criterios: ReporteProductosMasVendidos = {
            nitEmisor: this.criteriosBusquedaForm.controls['nitEmisor'].value,
            sucursal: this.criteriosBusquedaForm.controls['sucursal'].value,
            fechaInicio: this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            cantidad: this.criteriosBusquedaForm.controls['cantidad'].value,
            tipoReporte: tipo
        };

        const fileName = `productos-mas-vendidos-${this.nitEmpresa}.`+tipo;
        this.utilidadesService
            .getReporteProductosMasVendidos(criterios)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
                this.blockedPanel = false;
            });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}
