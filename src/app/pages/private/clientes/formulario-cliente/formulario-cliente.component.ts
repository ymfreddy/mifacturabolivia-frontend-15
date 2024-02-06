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
import { sfe } from 'src/app/shared/constants/sfe';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';

@Component({
    selector: 'app-formulario-cliente',
    templateUrl: './formulario-cliente.component.html',
    styleUrls: ['./formulario-cliente.component.scss'],
    providers: [DialogService],
})
export class FormularioClienteComponent implements OnInit {
    item?: Cliente;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaDocumentos: ParametricaSfe[] = [];
    idEmpresa!:number;
    esCodigoEspecial? = false;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private clienteservice: ClientesService,
        private parametricasSfeService: ParametricasSfeService,
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.parametricasSfeService.getTipoDocumento().subscribe((data) => {
            this.listaDocumentos = data as unknown as ParametricaSfe[];
        });

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoCliente: [this.item?.codigoCliente],
            codigoTipoDocumentoIdentidad: [this.item?.codigoTipoDocumentoIdentidad, Validators.required,],
            numeroDocumento: [this.item?.numeroDocumento, [Validators.required]],
            complemento: [{ value: this.item?.complemento, disabled: this.item?.codigoTipoDocumentoIdentidad!=sfe.CODIGO_TIPO_DOCUMENTO_CI }],
            nombre: [this.item?.nombre , Validators.required],
            direccion: [this.item?.direccion],
            telefono: [this.item?.telefono],
            email: [this.item?.email, Validators.email],
            sinResidencia: [this.item?.sinResidencia ?? false],
            idEmpresa: [this.item?.idEmpresa],
        });

        // verificar si es codigo especial
        this.esCodigoEspecial = (this.item && (this.item?.codigoCliente === '99001' || this.item?.codigoCliente === '99002' || this.item?.codigoCliente === '99003'|| this.item?.codigoCliente === '0'));
        if (this.esCodigoEspecial) {
            this.itemForm.controls['codigoTipoDocumentoIdentidad'].disable();
            this.itemForm.controls['numeroDocumento'].disable();
            this.itemForm.controls['complemento'].disable();
            if (this.item?.codigoCliente !== '99001') { this.itemForm.controls['nombre'].disable(); }
            this.itemForm.updateValueAndValidity();
        }
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            if (this.itemForm.controls['sinResidencia'].value && this.itemForm.controls['codigoTipoDocumentoIdentidad'].value!=sfe.CODIGO_TIPO_DOCUMENTO_NIT){
                this.informationService.showWarning('El tipo de documento para personas sin residencia debe ser NIT');
                return;
            }

            // obtener valores combo
            const codigoTipoDocumento =
                this.itemForm.controls['codigoTipoDocumentoIdentidad'].value;
            const tipoDocumento = this.listaDocumentos.find(
                (x) => x.codigo === codigoTipoDocumento
            )?.descripcion;
            const numeroDocumento =
                this.itemForm.controls['numeroDocumento'].value;
            const complemento = this.itemForm.controls['complemento'].value
                ? this.itemForm.controls['complemento'].value.trim()
                : '';
            const cliente: Cliente = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                codigoCliente: this.getCodigoCliente(
                    numeroDocumento,
                    complemento
                ),
                codigoTipoDocumentoIdentidad:
                    this.itemForm.controls['codigoTipoDocumentoIdentidad']
                        .value,
                tipoDocumentoIdentidad: tipoDocumento ?? '',
                numeroDocumento: numeroDocumento,
                complemento: complemento,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                direccion: this.itemForm.controls['direccion'].value,
                telefono: this.itemForm.controls['telefono'].value,
                email: this.itemForm.controls['email'].value,
                sinResidencia: this.itemForm.controls['sinResidencia'].value,
            };

            this.submited = true;
            // modificar cliente 0
            if (cliente.id > 0) {
                this.clienteservice.edit(cliente).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(cliente);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.clienteservice.add(cliente).subscribe({
                    next: (res) => {
                        cliente.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(cliente);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    public getCodigoCliente(numeroDocumento: string, complemento: string) {
        if (this.esCodigoEspecial && numeroDocumento=='-') return '0';
        const numeroDocumentoSanitized = numeroDocumento
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const complementoSanitized = complemento
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const final =
            numeroDocumentoSanitized +
            (complementoSanitized.length === 0
                ? ''
                : '-' + complementoSanitized);
        return `${final}`;
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    canbioTipoDocumento(event: any) {
        if (!event.value) {
            this.itemForm.controls['complemento'].disable();
            this.itemForm.patchValue({ complemento: '' });
            this.itemForm.updateValueAndValidity();
            return;
        }
        const tipoDocumento = this.listaDocumentos.find(
            (x) => x.codigo == event.value
        )?.codigo;

        if (tipoDocumento==sfe.CODIGO_TIPO_DOCUMENTO_CI) {
            this.itemForm.controls['complemento'].enable();
        } else {
            this.itemForm.controls['complemento'].disable();
            this.itemForm.patchValue({ complemento: '' });
        }
        this.itemForm.updateValueAndValidity();
    }
}
