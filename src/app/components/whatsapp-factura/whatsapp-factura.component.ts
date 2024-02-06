import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { BusquedaCliente } from 'src/app/shared/models/busqueda-cliente.model';
import { FacturaResumen } from 'src/app/shared/models/factura-resumen.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-whatsapp-factura',
  templateUrl: './whatsapp-factura.component.html',
  styleUrls: ['./whatsapp-factura.component.scss']
})
export class WhatsappFacturaComponent implements OnInit {
    item!: FacturaResumen;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private clienteService: ClientesService,
        private sessionService :SessionService
    ) {}

    ngOnInit(): void {
        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            telefono: [null, Validators.required],
        });

        const criteriosBusqueda: BusquedaCliente = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            codigoCliente: this.item?.codigoCliente,
            resumen: true,
        };
        this.clienteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.informationService.showWarning('No existe el cliente')
                    return;
                }
                if (res.content[0].telefono){
                    this.enviarMensaje(this.item.razonSocialEmisor, res.content[0].telefono, this.item.url);
                }
                else{
                    this.itemForm.patchValue({ telefono: res.content[0].telefono });
                    this.itemForm.updateValueAndValidity();
                }
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
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
            this.enviarMensaje(this.item.razonSocialEmisor, this.itemForm.value.telefono, this.item.url);
        }
    }


    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    enviarMensaje(empresa:string, telefono:string, mensaje:string){
        window.open(`${environment.whatsappUrl}${telefono}&text=${empresa} le remite la siguiente factura: `+encodeURIComponent(mensaje), '_blank');
        this.dialogRef.close(this);
    }
}
