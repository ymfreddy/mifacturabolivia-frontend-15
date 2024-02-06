import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { delay } from 'rxjs';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { ProductoInventario } from 'src/app/shared/models/producto.model';

@Component({
    selector: 'app-reporte-producto-historial',
    templateUrl: './reporte-producto-historial.component.html',
    styleUrls: ['./reporte-producto-historial.component.scss'],
})
export class ReporteProductoHistorialComponent implements OnInit {
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    item!: ProductoInventario;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private datepipe: DatePipe,
        private utilidadesService: UtilidadesService,
        private fileService:FilesService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.item = this.config.data;
        // cargar data
        this.itemForm = this.fb.group({
            fechaInicio: [new Date(), Validators.required],
            fechaFin: [new Date(), Validators.required],
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
            // validar rango fecha
            if (
                this.itemForm.controls['fechaFin'].value.getTime() -
                    this.itemForm.controls['fechaInicio'].value.getTime() <
                0
            ) {
                this.informationService.showWarning(
                    'La fecha inicio no debe ser menor a la fecha fin'
                );
                return;
            }

            const busqueda: any = {
                fechaInicio: this.datepipe.transform(
                    this.itemForm.controls['fechaInicio'].value,
                    'dd/MM/yyyy'
                ),
                fechaFin: this.datepipe.transform(
                    this.itemForm.controls['fechaFin'].value,
                    'dd/MM/yyyy'
                ),
                idEmpresa: this.sessionService.getSessionUserData().idEmpresa,
                idSucursal: this.item.idSucursal,
                idProducto: this.item.id,
            };

            this.submited = true;
            const fileName = `producto-${this.item.nombre}.pdf`;
            this.utilidadesService
                .getProductoHistorial(busqueda)
                .pipe(delay(1000))
                .subscribe((blob: Blob): void => {
                    this.fileService.printFile(blob, fileName, false);
                    this.submited = false;
                    this.dialogRef.close(null);
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
