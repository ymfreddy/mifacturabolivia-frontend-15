import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { VisitasService } from 'src/app/shared/services/visitas.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { Visita } from '../../shared/models/visita.model';

@Component({
  selector: 'app-cancelar-visita',
  templateUrl: './cancelar-visita.component.html',
  styleUrls: ['./cancelar-visita.component.scss']
})
export class CancelarVisitaComponent implements OnInit {
  item!: Visita;
  itemForm!: FormGroup;
  closeClicked = false;
  submited = false;
  listaMotivos: Parametrica[] = [];

  constructor(
      private fb: FormBuilder,
      public config: DynamicDialogConfig,
      private dialogRef: DynamicDialogRef,
      private informationService: InformationService,
      private parametricasService: ParametricasService,
      private visitasService: VisitasService
  ) {}

  ngOnInit(): void {
      this.parametricasService.getParametricasByTipo(TipoParametrica.MOTIVO_CANCELACION_VISITA).subscribe((data) => {
          this.listaMotivos = data as unknown as Parametrica[];
      });

      // cargar data
      this.item = this.config.data;
      this.itemForm = this.fb.group({
          id: [this.item?.id],
          idMotivoCancelacion: [null, Validators.required],
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
          const visita: Visita = {
              ... this.item,
              id: this.itemForm.controls['id'].value,

          };
          const idMotivoCancelacion = this.itemForm.controls['idMotivoCancelacion'].value;
          this.submited = true;
          this.visitasService.cancel(visita ,idMotivoCancelacion).subscribe({
              next: (res) => {
                 this.informationService.showSuccess(res.message);
                 this.dialogRef.close(visita);
                 this.submited = false;
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
