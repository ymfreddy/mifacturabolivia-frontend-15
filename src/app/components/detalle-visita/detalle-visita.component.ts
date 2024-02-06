import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { sv } from 'src/app/shared/constants/sv';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { VisitasService } from 'src/app/shared/services/visitas.service';
import { Visita, VisitaDetalle } from '../../shared/models/visita.model';

@Component({
  selector: 'app-detalle-visita',
  templateUrl: './detalle-visita.component.html',
  styleUrls: ['./detalle-visita.component.scss']
})
export class DetalleVisitaComponent implements OnInit {
  item!: Visita;
  itemForm!: FormGroup;
  closeClicked = false;
  submited = false;
  constructor(
      private fb: FormBuilder,
      public config: DynamicDialogConfig,
      private dialogRef: DynamicDialogRef,
      private informationService: InformationService,
      private visitasService: VisitasService,
      private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
      // cargar data
      this.item = this.config.data;
      this.itemForm = this.fb.group({
          id: [this.item?.detalle?.id],
          idVisita: [this.item?.id, Validators.required],
          detalle: [this.item?.detalle?.detalle, Validators.required],
          observaciones: [this.item?.detalle?.observaciones],
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
          const detalle: VisitaDetalle = {
              id: this.itemForm.controls['id'].value,
              idVisita: this.itemForm.controls['idVisita'].value,
              detalle: this.itemForm.controls['detalle'].value,
              observaciones: this.itemForm.controls['observaciones'].value,
          };

          this.submited = true;
          this.visitasService.addDetail(detalle).subscribe({
              next: (res) => {
                 //this.informationService.showSuccess(res.message);
                 // finalizar
                 this.submited = false;
                 this.confirmationService.confirm({
                    message:
                        'Esta seguro de finalizar la visita de ' +
                        this.item?.interesado +
                        ' ?',
                    header: 'Confirmación',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                        this.submited = true;
                        this.visitasService
                            .finalize(this.item)
                            .subscribe({
                                next: (res2) => {
                                    this.informationService.showSuccess(res2.message);
                                    this.dialogRef.close(detalle);
                                    this.submited = false;
                                },
                                error: (err2) => {
                                    this.informationService.showError(
                                        err2.error.message
                                    );
                                    this.submited = false;
                                },
                            });
                    },
                    reject: () =>{
                        this.dialogRef.close(null);
                        this.submited = false;
                    }
                });
              },
              error: (err) => {
                  this.informationService.showError(err.error.message);
                  this.submited = false;
              },
          });
      }
  }

  esEditable(){
    return this.item.idEstadoVisita==sv.ESTADO_VISITA_INICIADA;
  }

  public onClose(): void {
      this.closeClicked = true;
  }

  public onSave(): void {
      this.closeClicked = false;
  }
}
