import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-formulario-sucursal',
    templateUrl: './formulario-sucursal.component.html',
    styleUrls: ['./formulario-sucursal.component.scss'],
    providers: [DialogService],
})
export class FormularioSucursalComponent implements OnInit {
    item?: Sucursal;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaEmpresas: Empresa[] = [];
    listaImpresoras: String[] = [];
    listaCategorias: any[]= [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private empresasService: EmpresasService,
        private informationService: InformationService,
        private sucursaleservice: SucursalesService,
        private sessionService: SessionService,
        private utilidadesService: UtilidadesService,
        private categoriasService: CategoriasService
    ) {}

    ngOnInit(): void {
        this.empresasService.get().subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        //if (environment.despliegueLocal){
            this.utilidadesService.getImpresoras().subscribe({
                next: (res) => {
                    console.log(res);
                    const newdata = res.content.map((x:any) => {
                        return { nombre: x };
                      });
                    this.listaImpresoras = newdata;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

            const busqueda = {
                idEmpresa : this.sessionService.getSessionEmpresaId(),
                //idsCategorias : this.sessionService.getSessionUserData().categorias
            }

            this.categoriasService.get(busqueda).subscribe({
                next: (res) => {
                    const categorias = res.content.map((x: any) => {return { codigo: x.id.toString(), nombre: x.nombre }});
                    this.listaCategorias = categorias;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
        //}

        this.item = this.config.data;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            numero: [this.item?.numero, Validators.required],
            casaMatriz: [this.item?.casaMatriz ?? false],
            direccion: [this.item?.direccion, Validators.required],
            telefono: [this.item?.telefono],
            ciudad: [this.item?.ciudad, Validators.required],
            idEmpresa: [this.item?.idEmpresa, Validators.required],
            impresora: [this.item?.impresora],
            impresoraUno: [this.item?.impresoraUno],
            impresoraDos: [this.item?.impresoraDos],
            impresoraDosCategorias: [this.item?.impresoraDosCategorias ? this.item?.impresoraDosCategorias.split(",") : null],
        });
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            const categorias = this.itemForm.controls['impresoraDosCategorias'].value;
            const sucursal: Sucursal = {
                id: this.itemForm.controls['id'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value ??
                    this.sessionService.getSessionEmpresaId(),
                numero: this.itemForm.controls['numero'].value,
                direccion: this.itemForm.controls['direccion'].value,
                telefono: this.itemForm.controls['telefono'].value,
                ciudad: this.itemForm.controls['ciudad'].value,
                casaMatriz: this.itemForm.controls['casaMatriz'].value,
                impresora: this.itemForm.controls['impresora'].value,
                impresoraUno: this.itemForm.controls['impresoraUno'].value,
                impresoraDos: this.itemForm.controls['impresoraDos'].value,
                impresoraDosCategorias: (!categorias || categorias.length==0) ?'':categorias.join(','),
                puntosVenta: [],
            };
            this.submited = true;
            if (sucursal.id > 0) {
                this.sucursaleservice.edit(sucursal).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(sucursal);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.sucursaleservice.add(sucursal).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(sucursal);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}
