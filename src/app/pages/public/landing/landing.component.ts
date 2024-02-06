import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Precio } from 'src/app/shared/models/precio';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
    email: string = environment.email;
    celular: number = environment.celular;
    paginaInicio: boolean = environment.paginaInicio;
    version: string = environment.version;
    datos: any;

    services!: any[];

	responsiveOptions!: any[];

    preciosMensuales!: Precio[];
    preciosAnuales!: Precio[];
    constructor(public layoutService: LayoutService, public router: Router) {
        this.responsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 3,
                numScroll: 3
            },
            {
                breakpoint: '768px',
                numVisible: 2,
                numScroll: 2
            },
            {
                breakpoint: '560px',
                numVisible: 1,
                numScroll: 1
            }
        ];

        this.preciosMensuales = [
            {
                nombre:'EMPRENDEDOR',
                descripcion:'Solo Facturación',
                precio:50,
                solicitar:'Hola!! necesito el plan EMPRENDEDOR (solo facturación)',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación'],
                caracteristicas:['1 Usuario','1 Sucursal','250 Productos'],
                facturas:['150 Facturas','0.50 bs por factura adicional']
            },
            {
                nombre:'BÁSICO',
                descripcion:'Solo Facturación',
                precio:100,
                solicitar:'Hola!! necesito el plan BÁSICO (solo facturación)',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación'],
                caracteristicas:['2 Usuarios','1 Sucursal','500 Productos'],
                facturas:['350 Facturas','0.40 bs por factura adicional']
            },
            {
                nombre:'STANDAR',
                descripcion:'Ventas y Facturación',
                precio:200,
                solicitar:'Hola!! necesito el plan STANDAR',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación','Módulo Ventas'],
                caracteristicas:['4 Usuarios','2 Sucursal','800 Productos'],
                facturas:['800 Facturas','0.30 bs por factura adicional']
            },
            {
                nombre:'EMPRESARIAL',
                descripcion:'Ventas, Inventarios y Facturación',
                precio:300,
                solicitar:'Hola!! necesito el plan EMPRESARIAL',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación','Módulo Ventas','Módulo Inventarios'],
                caracteristicas:['6 Usuarios','3 Sucursal','1000 Productos'],
                facturas:['1500 Facturas','0.25 bs por factura adicional']
            }
        ]

        this.preciosAnuales = [
            {
                nombre:'EMPRENDEDOR',
                descripcion:'Solo Facturación',
                precio:500,
                solicitar:'Hola!! necesito el plan EMPRENDEDOR ANUAL (solo facturación)',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación'],
                caracteristicas:['1 Usuario','1 Sucursal','250 Productos'],
                facturas:['1800 Facturas por año']
            },
            {
                nombre:'BÁSICO',
                descripcion:'Solo Facturación',
                precio:1000,
                solicitar:'Hola!! necesito el plan BÁSICO ANUAL (solo facturación)',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación'],
                caracteristicas:['2 Usuarios','1 Sucursal','500 Productos'],
                facturas:['4200 Facturas por año']
            },
            {
                nombre:'STANDAR',
                descripcion:'Ventas y Facturación',
                precio:2000,
                solicitar:'Hola!! necesito el plan STANDAR ANUAL',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación','Módulo Ventas'],
                caracteristicas:['4 Usuarios','2 Sucursal','800 Productos'],
                facturas:['9600 Facturas por año']
            },
            {
                nombre:'EMPRESARIAL',
                descripcion:'Ventas, Inventarios y Facturación',
                precio:3000,
                solicitar:'Hola!! necesito el plan EMPRESARIAL ANUAL',
                modulos:['Módulo Clientes','Módulo Productos','Módulo Facturación','Módulo Ventas','Módulo Inventarios'],
                caracteristicas:['6 Usuarios','3 Sucursal','1000 Productos'],
                facturas:['18000 Facturas por año']
            }
        ]
    }

    ngOnInit(): void {
        fetch('./assets/informacion/data.json')
            .then((res) => res.json())
            .then((json) => {
                this.datos = json;
                this.services = this.datos.servicios;
            });
    }

    solicitar(mensaje: string){
        window.open(`${environment.whatsappUrl}${environment.celular}&text=${mensaje}`, '_blank');
    }
}
