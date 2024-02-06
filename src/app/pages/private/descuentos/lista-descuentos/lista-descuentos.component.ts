import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { Descuento } from 'src/app/shared/models/descuento.model';
import { DescuentosService } from 'src/app/shared/services/descuentos.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { BusquedaDescuento } from 'src/app/shared/models/busqueda-descuento.model';
import { spv } from 'src/app/shared/constants/spv';
import { adm } from 'src/app/shared/constants/adm';
import { DescuentoDetalleComponent } from 'src/app/components/descuento-detalle/descuento-detalle.component';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';


@Component({
    selector: 'app-lista-descuentos',
    templateUrl: './lista-descuentos.component.html',
    styleUrls: ['./lista-descuentos.component.scss'],
    providers: [DialogService],
})
export class ListaDescuentosComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;

    items!: Descuento[];
    listaTiposDescuento: Parametrica[] = [];
    listaSucursales: Sucursal[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    descuentoSeleccionada!: Descuento;
    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        private descuentosService: DescuentosService,
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
            idSucursal: [{ value: null, disabled: false}],
            idTipoDescuento: null,
        });

        const esAdministrador = this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_ADMIN || this.sessionService.getSessionUserData().idTipoUsuario == adm.TIPO_USUARIO_SUPERADMIN;
        if (!esAdministrador) {
            this.criteriosBusquedaForm.controls['idSucursal'].disable();
            this.criteriosBusquedaForm.patchValue({ idSucursal: this.sessionService.getSessionUserData().idSucursal });
        }
    }

    loadData(): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        this.blockedPanel = true;
        const criterios = this.getBusquedaCriterios();
        this.descuentosService.get(criterios)
        .subscribe({
            next: (res) => {
                this.sessionService.setBusquedaDescuento(criterios);
                this.items = res.content;
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    getBusquedaCriterios() {
        const criterios: BusquedaDescuento = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idSucursal: this.criteriosBusquedaForm.controls['idSucursal'].value,
            idTipoDescuento: this.criteriosBusquedaForm.controls['idTipoDescuento'].value,
        };
        return criterios;
    }

    newItem() {
        this.sessionService.setRegistroDescuento(null);
        this.router.navigate(['/adm/formulario-descuento']);
    }

    editItem(item: Descuento) {
        this.descuentosService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
                this.sessionService.setRegistroDescuento(item);
                this.router.navigate(['/adm/formulario-descuento']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    deleteItem(item: Descuento) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar el descuento ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.descuentosService.delete(item).subscribe({
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

    showDetail(item: Descuento) {
        this.descuentosService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
                const ref = this.dialogService.open(DescuentoDetalleComponent, {
                    header: 'Detalle Descuento '+ item.correlativo,
                    width: '80%',
                    data: { item: item, data: {}},
                });
                ref.onClose.subscribe((res) => {
                });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
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

    cargarParametricas(){
        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_DESCUENTO)
        .subscribe((data) => {
            this.listaTiposDescuento = data as unknown as Parametrica[];
            this.listaTiposDescuento = this.listaTiposDescuento.filter(x=>x.id!==spv.TIPO_DESCUENTO_TOTAL);
        });
    }
}
