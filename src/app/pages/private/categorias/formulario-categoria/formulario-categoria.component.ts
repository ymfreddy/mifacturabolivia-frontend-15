import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Categoria } from 'src/app/shared/models/categoria.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';

@Component({
    selector: 'app-formulario-categoria',
    templateUrl: './formulario-categoria.component.html',
    styleUrls: ['./formulario-categoria.component.scss'],
    providers: [DialogService],
})
export class FormularioCategoriaComponent implements OnInit {
    item?: Categoria;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    fileImagen: any;

    idEmpresa!:number;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private fileService: FilesService,
        private informationService: InformationService,
        private categoriaService: CategoriasService,
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            nombre: [this.item?.nombre ?? '', Validators.required],
            imagenNombre: [this.item?.imagenNombre],
            imagenRuta: [this.item?.imagenRuta],
            idEmpresa: [this.item?.idEmpresa],
        });
        this.itemForm.controls['imagenNombre'].disable();
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            this.submited = true;
            const categoria: Categoria = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                imagenRuta: this.itemForm.controls['imagenRuta'].value,
                imagenNombre: this.itemForm.controls['imagenNombre'].value,
            };

            if (categoria.id > 0) {
                this.categoriaService.edit(categoria).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(categoria);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.categoriaService.add(categoria).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(categoria);
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

    cargarImagen(event: any, fileUpload: any) {
        this.fileImagen = event.files[0];
        const formData = new FormData();
        formData.append('file', this.fileImagen);
        this.fileService.uploadImage(formData).subscribe({
            next: (resp) => {
                if (resp.success) {
                    this.itemForm.controls['imagenNombre'].setValue(
                        resp.content.fileName
                    );
                    this.itemForm.controls['imagenRuta'].setValue(
                        resp.content.fileDownloadUri
                    );
                }
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
        fileUpload.clear();
    }
}
