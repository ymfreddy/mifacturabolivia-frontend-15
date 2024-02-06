import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ResumenEmpresa } from 'src/app/shared/models/resumen-empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { Router } from '@angular/router';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];

    chartData: any;

    chartOptions: any;

    subscription!: Subscription;

    resumen!: ResumenEmpresa;

    constructor(private sessionService: SessionService, public layoutService: LayoutService, public empresaService: EmpresasService,
        private router: Router) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }
            this.initChart();
            this.items = [
                { label: 'Add New', icon: 'pi pi-fw pi-plus' },
                { label: 'Remove', icon: 'pi pi-fw pi-minus' }
            ];

            this.empresaService.getResumen(this.sessionService.getSessionEmpresaId())
            .subscribe((data) => {
                this.resumen = data as unknown as ResumenEmpresa;
                this.actualizarDatos();
            });
    }

    private actualizarDatos(){
        this.chartData.labels = this.resumen.listaTipoVenta.contado.map(x=>x.mes);
        this.chartData.datasets[0].data = this.resumen.listaTipoVenta.credito.map(x=>x.cantidad);
        this.chartData.datasets[1].data = this.resumen.listaTipoVenta.contado.map(x=>x.cantidad);
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartData = {
            labels: ['Mes'],
            datasets: [
                {
                    label: 'Ventas Credito',
                    data: [0],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                    tension: .4
                },
                {
                    label: 'Ventas al Contado',
                    data: [0],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
