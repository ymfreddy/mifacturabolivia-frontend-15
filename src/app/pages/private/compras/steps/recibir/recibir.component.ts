import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Compra, CompraDetalle } from 'src/app/shared/models/compra.model';
import { Router } from '@angular/router';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { ConfirmationService } from 'primeng/api';
import { ComprasService } from 'src/app/shared/services/compras.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-recibir',
    templateUrl: './recibir.component.html',
    styleUrls: ['./recibir.component.scss'],
})
export class RecibirComponent implements OnInit {
    submited = false;
    compraConGift = false;
    compraConTarjeta = false;
    item?: Compra;
    itemForm!: FormGroup;
    backClicked = false;
    detalle: CompraDetalle[] = [];
    constructor(
        private router: Router,
        private fb: FormBuilder,
        private informationService: InformationService,
        private sessionService: SessionService,
        private confirmationService: ConfirmationService,
        private compraService: ComprasService,
        private datepipe: DatePipe
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getRegistroCompra() != null) {
            this.item = this.sessionService.getRegistroCompra();
        } else {
            this.router.navigate(['/adm/compras']);
        }

        console.log(this.item);
        //let fechaPedido = this.item?.fechaPedido ??  new Date() ;

        this.itemForm = this.fb.group({
            id: [{ value: this.item?.id ?? 0, disabled: true }],
            correlativo: [{ value: this.item?.correlativo, disabled: true }],
            idSucursal: [this.item?.idSucursal],
            idProveedor: [this.item?.idProveedor],
            descripcion: [this.item?.descripcion],
            fechaPedido: [this.datepipe.transform(this.item?.fechaPedido,'dd/MM/yyyy')],
            subtotal: [this.item?.subtotal ?? 0],
            descuentos: [this.item?.descuentos ?? 0],
            total: [this.item?.total ?? 0],
        });

        // cargar detalle
        this.detalle = this.item?.detalle ?? [];
    }

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/adm/compra-por-pasos/solicitar']);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            const finalizar: any = {
                idCompra: this.itemForm.controls['id'].value,
                descripcion: this.itemForm.controls['descripcion'].value,
            };

            this.confirmationService.confirm({
                message: 'Esta seguro de recibir la compra?',
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.submited = true;
                    this.compraService.finalizar(finalizar).subscribe({
                        next: (res) => {
                            this.informationService.showSuccess(res.message);
                            this.sessionService.setRegistroCompra(null);
                            this.router.navigate(['/adm/compras']);
                        },
                        error: (err) => {
                            this.informationService.showError(
                                err.error.message
                            );
                            this.submited = false;
                        },
                    });
                },
            });
        }
    }

    prevPage() {
        this.backClicked = true;
    }

    complete() {
        this.backClicked = false;
    }
}
