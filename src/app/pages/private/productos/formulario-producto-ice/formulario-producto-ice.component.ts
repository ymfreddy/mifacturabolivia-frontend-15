import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Producto } from 'src/app/shared/models/producto.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Categoria } from 'src/app/shared/models/categoria.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { ActividadSfe } from 'src/app/shared/models/actividad-sfe.model';
import { ProductoSfe } from 'src/app/shared/models/producto-sfe.model';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { spv } from 'src/app/shared/constants/spv';
import { adm } from 'src/app/shared/constants/adm';
import { HelperService } from 'src/app/shared/helpers/helper.service';

@Component({
  selector: 'app-formulario-producto-ice',
  templateUrl: './formulario-producto-ice.component.html',
  styleUrls: ['./formulario-producto-ice.component.scss']
})
export class FormularioProductoIceComponent implements OnInit {
    item?: Producto;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    fileImagen: any;
    listaTiposProducto: Parametrica[] = [];
    listaCategorias: Categoria[] = [];
    listaTiposUnidad: ParametricaSfe[] = [];
    listaActividades: ActividadSfe[] = [];
    listaTiposProductoSinSeleccionado: ProductoSfe[] = [];
    listaTiposProductoSin: ProductoSfe[] = [];
    idEmpresa!:number;
    nitEmpresa!:number;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private fileService: FilesService,
        private informationService: InformationService,
        private productoservice: ProductosService,
        private sessionService: SessionService,
        private parametricasSfeService: ParametricasSfeService,
        private parametricasService: ParametricasService,
        private categoriasService: CategoriasService,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.nitEmpresa = this.config.data.nitEmpresa;
        this.item = this.config.data.item;
        // cargar parametricas
        const busqueda = {
            idEmpresa : this.idEmpresa,
            idsCategorias : this.sessionService.isSuperAdmin() ? '': this.sessionService.getSessionUserData().categorias
        }

        this.categoriasService
            .get(busqueda)
            .subscribe({
                next: (res) => {
                    this.listaCategorias = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_PRODUCTO)
            .subscribe((data) => {
                this.listaTiposProducto = data as unknown as Parametrica[];
            });

        this.parametricasSfeService.getTipoUnidad().subscribe((data) => {
            this.listaTiposUnidad = data as unknown as ParametricaSfe[];
        });

        this.parametricasSfeService.getActividades(this.nitEmpresa).subscribe((data) => {
            this.listaActividades = data as unknown as ActividadSfe[];
        });

        this.parametricasSfeService.getProductosSin(this.nitEmpresa).subscribe((data) => {
            this.listaTiposProductoSin = data as unknown as ProductoSfe[];
            if (this.item?.id){
                this.listaTiposProductoSinSeleccionado = this.listaTiposProductoSin.filter(x=>x.codigoActividad==this.item?.codigoActividad);
            }
        });

        // cargar data
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idTipoProducto: [this.item?.idTipoProducto, Validators.required],
            idCategoria: [this.item?.idCategoria, Validators.required],
            codigoProducto: [this.item?.codigoProducto, Validators.required],
            codigoActividad: [this.item?.codigoActividad, Validators.required],
            codigoProductoSin: [
                this.item?.codigoProductoSin, Validators.required
                            ],
            codigoTipoUnidad: [
                this.item?.codigoTipoUnidad,
                Validators.required,
            ],
            nombre: [this.item?.nombre, Validators.required],
            descripcion: [this.item?.descripcion],
            imagenNombre: [this.item?.imagenNombre],
            imagenRuta: [this.item?.imagenRuta],
            idEmpresa: [this.item?.idEmpresa],
            costo: {
                value: this.item?.costo ?? 0,
                disabled: this.item?.idTipoProducto ==spv.TIPO_PRODUCTO_CON_INVENTARIO,
            },
            precioIce: {
                value: this.item?.precioIce ?? 0,
                disabled: this.item?.idTipoProducto ==spv.TIPO_PRODUCTO_CON_INVENTARIO,
            },
            cantidadMinimaAlerta: {
                value: this.item?.cantidadMinimaAlerta ?? 0,
                disabled: this.item?.idTipoProducto !=spv.TIPO_PRODUCTO_CON_INVENTARIO,
            },
            codigoTipoHabitacion: [
                this.item?.codigoTipoHabitacion
            ],
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

            if ((this.itemForm.controls['idTipoProducto'].value===spv.TIPO_PRODUCTO_PRODUCTO || this.itemForm.controls['idTipoProducto'].value===spv.TIPO_PRODUCTO_SERVICIO_HOTEL_TURISMO)
                && this.itemForm.controls['precioIce'].value===0) {
                this.informationService.showWarning('El precio del producto/servicio debe ser mayor a 0');
                return;
            }

            if (this.itemForm.controls['idTipoProducto'].value===spv.TIPO_PRODUCTO_CON_INVENTARIO && this.itemForm.controls['precioIce'].value>0) {
                this.informationService.showWarning('El precio del producto debe ser 0');
                return;
            }

            if (this.itemForm.controls['idTipoProducto'].value===spv.TIPO_PRODUCTO_SERVICIO_HOTEL_TURISMO && this.itemForm.controls['codigoTipoHabitacion'].value==null) {
                this.informationService.showWarning('Debe elegir un tipo de habitación');
                return;
            }

            const idCategoria = this.itemForm.controls['idCategoria'].value;
            const idTipoProducto =
                this.itemForm.controls['idTipoProducto'].value;
            const codigoActividad =
                this.itemForm.controls['codigoActividad'].value;
            const codigoProductoSin =
                this.itemForm.controls['codigoProductoSin'].value;
            const codigoTipoUnidad =
                this.itemForm.controls['codigoTipoUnidad'].value;

            // obtener valores combo
            const categoria = this.listaCategorias.find(
                (x) => x.id === idCategoria
            )?.nombre;
            const tipoProducto = this.listaTiposProducto.find(
                (x) => x.id === idTipoProducto
            )?.nombre;
            const actividad = this.listaActividades.find(
                (x) => x.codigoCaeb === codigoActividad
            )?.descripcion;
            const tipoProductoSin = this.listaTiposProductoSin.find(
                (x) => x.codigoProducto === codigoProductoSin
            )?.descripcion;
            const tipoUnidad = this.listaTiposUnidad.find(
                (x) => x.codigo === codigoTipoUnidad
            )?.descripcion;

            const precioIce = this.itemForm.controls['precioIce'].value
            const precio = this.helperService.round(precioIce, adm.NUMERO_DECIMALES)
            const producto: Producto = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                idTipoProducto: this.itemForm.controls['idTipoProducto'].value,
                idCategoria: this.itemForm.controls['idCategoria'].value,
                codigoProducto:
                    this.itemForm.controls['codigoProducto'].value.trim(),
                codigoActividad:
                    this.itemForm.controls['codigoActividad'].value,
                codigoProductoSin:
                    this.itemForm.controls['codigoProductoSin'].value,
                codigoTipoUnidad:
                    this.itemForm.controls['codigoTipoUnidad'].value,
                codigoTipoHabitacion:
                    this.itemForm.controls['codigoTipoHabitacion'].value,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                descripcion: this.itemForm.controls['descripcion'].value,
                costo: this.itemForm.controls['costo'].value,
                precio: precio,
                precioIce: precioIce,
                imagenNombre: this.itemForm.controls['imagenNombre'].value,
                imagenRuta: this.itemForm.controls['imagenRuta'].value,
                cantidadMinimaAlerta:
                    this.itemForm.controls['cantidadMinimaAlerta'].value ?? 0,
                actividad: actividad ?? '',
                categoria: categoria ?? '',
                tipoProducto: tipoProducto ?? '',
                productoSin: tipoProductoSin ?? '',
                tipoUnidad: tipoUnidad ?? '',
            };

            this.submited = true;
            if (producto.id > 0) {
                this.productoservice.edit(producto).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(producto);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.productoservice.add(producto).subscribe({
                    next: (res) => {
                        producto.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(producto);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    canbioTipoProducto(event: any) {
        if (event.value == spv.TIPO_PRODUCTO_SERVICIO_HOTEL_TURISMO) {
            this.itemForm.controls['cantidadMinimaAlerta'].disable();
            this.itemForm.patchValue({ cantidadMinimaAlerta: 0 });
            this.itemForm.controls['costo'].disable();
            this.itemForm.controls['precioIce'].enable();
        }else if (event.value == spv.TIPO_PRODUCTO_CON_INVENTARIO) {
            this.itemForm.controls['cantidadMinimaAlerta'].enable();
            this.itemForm.controls['costo'].disable();
            this.itemForm.controls['precioIce'].disable();
            this.itemForm.patchValue({ costo: 0 });
            this.itemForm.patchValue({ precioIce: 0 });
        } else {
            this.itemForm.controls['cantidadMinimaAlerta'].disable();
            this.itemForm.patchValue({ cantidadMinimaAlerta: 0 });
            this.itemForm.controls['costo'].enable();
            this.itemForm.controls['precioIce'].enable();
        }
    }

    verTipoHabitacion(){
        return this.itemForm.controls['idTipoProducto'].value==spv.TIPO_PRODUCTO_SERVICIO_HOTEL_TURISMO;
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    cambioActividad(event: any) {
        if (!event.value) {
            this.listaTiposProductoSinSeleccionado = [];
            return;
        }

        this.listaTiposProductoSinSeleccionado = this.listaTiposProductoSin.filter((x) => x.codigoActividad == event.value);
        this.itemForm.updateValueAndValidity();
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
