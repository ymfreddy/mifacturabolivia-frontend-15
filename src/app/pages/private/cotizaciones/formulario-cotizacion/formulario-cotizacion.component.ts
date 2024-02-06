import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {

    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { delay } from 'rxjs';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Cotizacion } from 'src/app/shared/models/cotizacion.model';
import { Venta } from 'src/app/shared/models/venta.model';
import { CotizacionesService } from 'src/app/shared/services/cotizaciones.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';


@Component({
  selector: 'app-formulario-cotizacion',
  templateUrl: './formulario-cotizacion.component.html',
  styleUrls: ['./formulario-cotizacion.component.scss']
})
export class FormularioCotizacionComponent implements OnInit {
    item?: Venta;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    idEmpresa!:number;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private cotizacionService: CotizacionesService,
        private utilidadesService: UtilidadesService,
        private fileService: FilesService
    ) {}

    ngOnInit(): void {
        this.item = this.config.data.item;

        this.itemForm = this.fb.group({
            descripcion: ['', Validators.required],
            diasCotizacion: [7, Validators.required],
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
            const cotizacion: Cotizacion = {
                ... this.item,
                id: this.item?.id!,
                descripcion: this.itemForm.controls['descripcion'].value.trim(),
                diasCotizacion: this.itemForm.controls['diasCotizacion'].value,
            };

            this.cotizacionService.add(cotizacion).subscribe({
                next: (res) => {
                    console.log(res);
                    this.informationService.showSuccess(res.message);

                    const fileName = `cotizacion-${res.content.correlativo}.pdf`;
                    this.utilidadesService
                        .getCotizacion(res.content.id)
                        .pipe(delay(1000))
                        .subscribe((blob: Blob): void => {
                            this.fileService.printFile(blob, fileName, false);
                            this.submited = false;
                        });

                    this.dialogRef.close(res.content);

                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.submited = false;
                },
            });
        }
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}
