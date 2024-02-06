import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Proveedor } from 'src/app/shared/models/proveedor.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProveedoresService } from 'src/app/shared/services/proveedores.service';

@Component({
    selector: 'app-formulario-proveedor',
    templateUrl: './formulario-proveedor.component.html',
    styleUrls: ['./formulario-proveedor.component.scss'],
    providers: [DialogService],
})
export class FormularioProveedorComponent implements OnInit {
    item?: Proveedor;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    idEmpresa!:number;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private proveedoreservice: ProveedoresService
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            nit: [this.item?.nit ?? '', Validators.required],
            nombre: [this.item?.nombre ?? '', Validators.required],
            direccion: [this.item?.direccion],
            telefono: [this.item?.telefono],
            email: [this.item?.email],
            contacto: [this.item?.contacto],
            ciudad: [this.item?.ciudad],
            pais: [this.item?.pais],
            idEmpresa: [this.item?.idEmpresa],
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

            const proveedor: Proveedor = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                this.itemForm.controls['idEmpresa'].value ??
                this.idEmpresa,
                nit: this.itemForm.controls['nit'].value,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                direccion: this.itemForm.controls['direccion'].value,
                telefono: this.itemForm.controls['telefono'].value,
                email: this.itemForm.controls['email'].value,
                contacto: this.itemForm.controls['contacto'].value,
                ciudad: this.itemForm.controls['ciudad'].value,
                pais: this.itemForm.controls['pais'].value,
            };

            this.submited = true;
            if (proveedor.id > 0) {
                this.proveedoreservice.edit(proveedor).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(proveedor);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.proveedoreservice.add(proveedor).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(proveedor);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    }
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
