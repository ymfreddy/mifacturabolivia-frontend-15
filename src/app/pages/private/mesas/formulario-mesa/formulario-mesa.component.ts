import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Mesa } from 'src/app/shared/models/mesa';
import { SessionService } from 'src/app/shared/security/session.service';
import { MesasService } from 'src/app/shared/services/mesas.service';

@Component({
  selector: 'app-formulario-mesa',
  templateUrl: './formulario-mesa.component.html',
  styleUrls: ['./formulario-mesa.component.scss']
})
export class FormularioMesaComponent implements OnInit {
    item?: Mesa;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    idEmpresa!:number;
    idSucursal!:number;

  constructor(private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private informationService: InformationService,
    private mesasService: MesasService,
    private sessionService: SessionService,) { }

  ngOnInit(): void {
    this.idEmpresa = this.sessionService.getSessionUserData().idEmpresa;
    this.idSucursal =  this.sessionService.getSessionUserData().idSucursal;
    this.item = this.config.data.item;

    this.itemForm = this.fb.group({
        id: [this.item?.id],
        numero: [this.item?.numero, Validators.required],
        lugar: [this.item?.lugar, Validators.required],
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

        this.submited = true;
        const mesa: Mesa = {
            id: this.itemForm.controls['id'].value,
            idSucursal:this.idSucursal,
            idEmpresa:this.idEmpresa,
            numero: this.itemForm.controls['numero'].value.trim(),
            lugar: this.itemForm.controls['lugar'].value.trim(),
        };

        if (mesa.id > 0) {
            this.mesasService.edit(mesa).subscribe({
                next: (res) => {
                    this.informationService.showSuccess(res.message);
                    this.dialogRef.close(mesa);
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.submited = false;
                },
            });
        } else {
            this.mesasService.add(mesa).subscribe({
                next: (res) => {
                    this.informationService.showSuccess(res.message);
                    this.dialogRef.close(mesa);
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
