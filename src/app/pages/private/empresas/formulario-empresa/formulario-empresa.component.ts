import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';

@Component({
    selector: 'app-formulario-empresa',
    templateUrl: './formulario-empresa.component.html',
    styleUrls: ['./formulario-empresa.component.scss'],
    providers: [DialogService],
})
export class FormularioEmpresaComponent implements OnInit {
    item?: Empresa;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaDocumentos: ParametricaSfe[] = [];
    listaCategorias: any[]= [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private empresaservice: EmpresasService,
        private parametricasSfeService: ParametricasSfeService,
        private categoriasService: CategoriasService
    ) {}

    ngOnInit(): void {
        this.parametricasSfeService.getTipoDocumento().subscribe((data) => {
            this.listaDocumentos = data as unknown as ParametricaSfe[];
        });

        this.item = this.config.data;
        if (this.item?.id){
            this.cargarCategorias(this.item?.id);
        }

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            nit: [
                this.item?.nit,
                Validators.required,
            ],
            nombre: [this.item?.nombre ?? '', Validators.required],
            representanteLegal: [this.item?.representanteLegal],
            mensajeFactura: [this.item?.mensajeFactura],
            facturaRollo: [this.item?.facturaRollo ?? false],
            email: [this.item?.email],
            //sigla: [{value:this.item?.sigla, disabled: this.item?.id }, [Validators.required]],
            sigla: [this.item?.sigla, Validators.required],
            envioEmailCopia: [this.item?.envioEmailCopia ?? false],
            envioEmail: [this.item?.envioEmail ?? false],
            copiaImpresion: [this.item?.copiaImpresion ?? false],
            conexionAutomatica: [this.item?.conexionAutomatica ?? false],
            restaurante: [this.item?.restaurante ?? false],
            impresionDirecta: [this.item?.impresionDirecta ?? false],
            categoriasOnline: [this.item?.categoriasOnline ? this.item?.categoriasOnline.split(",") : null],
            descripcionAdicionalProducto: [this.item?.descripcionAdicionalProducto ?? false],
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

            const categorias = this.itemForm.controls['categoriasOnline'].value;

            const empresa: Empresa = {
                id: this.itemForm.controls['id'].value,
                nit: this.itemForm.controls['nit'].value,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                representanteLegal: this.itemForm.controls['representanteLegal'].value,
                mensajeFactura: this.itemForm.controls['mensajeFactura'].value,
                facturaRollo: this.itemForm.controls['facturaRollo'].value,
                email: this.itemForm.controls['email'].value,
                sigla: this.itemForm.controls['sigla'].value,
                envioEmailCopia: this.itemForm.controls['envioEmailCopia'].value,
                envioEmail: this.itemForm.controls['envioEmail'].value,
                copiaImpresion: this.itemForm.controls['copiaImpresion'].value,
                conexionAutomatica: this.itemForm.controls['conexionAutomatica'].value,
                restaurante: this.itemForm.controls['restaurante'].value,
                impresionDirecta: this.itemForm.controls['impresionDirecta'].value,
                categoriasOnline: (!categorias || categorias.length==0) ?'':categorias.join(','),
                descripcionAdicionalProducto: this.itemForm.controls['descripcionAdicionalProducto'].value,
            };
            console.log(empresa);

            this.submited = true;
            if (empresa.id > 0) {
                this.empresaservice.edit(empresa).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(empresa);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.empresaservice.add(empresa).subscribe({
                    next: (res) => {
                        empresa.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(empresa);
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

    cargarCategorias(idEmpresa:number): void {
        this.listaCategorias = [];
        const busqueda = {
            idEmpresa : idEmpresa
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
    }
}
