import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FacturaRecepcion } from '../models/factura-recepcion.model';

@Injectable({
    providedIn: 'root',
})
export class FacturasService {
    constructor(
        private httpClient: HttpClient,
        private helperService: HelperService,
        private sessionService: SessionService
    ) {}
    // codigos
    verifyNit(request: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/codigos/validar-nit`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    verifyCufds(): Observable<any> {
        const apiUrl = `${environment.api.sfe}/codigos/verificar-cufds`;
        return this.httpClient.post<any>(apiUrl, {});
    }
    getCufd(request: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryString(request);
        const apiUrl = `${environment.api.sfe}/codigos/obtener-cufd`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    getCuis(request: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryString(request);
        const apiUrl = `${environment.api.sfe}/codigos/obtener-cuis`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    getCuises(nit: number): Observable<any> {
        const apiUrl = `${environment.api.sfe}/codigos/listar-cuises/${nit}`;
        return this.httpClient.get<any>(apiUrl);
    }

    // facturas
    get(criteriosSearch: any): Observable<any> {
        const queryString =
            this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
            console.log(queryString);
        const apiUrl = `${environment.api.sfe}/facturas/listar?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    getPaquetes(criteriosSearch: any): Observable<any> {
        const queryString =
            this.helperService.jsonToQueryString(criteriosSearch);
        const apiUrl = `${environment.api.sfe}/facturas/listar-paquetes?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    sendFactura(facturaEmision: FacturaRecepcion): Observable<any> {
        console.log(facturaEmision);
        const apiUrl = `${environment.api.sfe}/facturas/recepciones`;
        return this.httpClient.post<any>(apiUrl, facturaEmision);
    }

    sendFacturaAnulada(factura: any) {
        const apiUrl = `${environment.api.sfe}/facturas/anulaciones`;
        return this.httpClient.post<any>(apiUrl, factura);
    }

    sendFacturaRevertida(factura: any) {
        const apiUrl = `${environment.api.sfe}/facturas/reversiones`;
        return this.httpClient.post<any>(apiUrl, factura);
    }

    sendFacturaVerificacion(factura: any) {
        const apiUrl = `${environment.api.sfe}/facturas/verificaciones`;
        return this.httpClient.post<any>(apiUrl, factura);
    }

    sendPaquete(envio: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/facturas/enviar-paquetes`;
        return this.httpClient.post<any>(apiUrl, envio);
    }

    verificarPaquetes(): void {
        if (this.sessionService
            .getSessionUserData()
            .asociaciones){
                this.sessionService
                .getSessionUserData()
                .asociaciones.forEach((element) => {
                    if (element.conexionAutomatica){
                        console.log('verificando paquetes: '+element.documentoSector);
                        const criteriosSearch = {
                            codigoAsociacion: element.codigoAsociacion,
                            sucursal:
                                this.sessionService.getSessionUserData().numeroSucursal,
                            puntoVenta:
                                this.sessionService.getSessionUserData()
                                    .numeroPuntoVenta,
                        };
                        const queryString =
                            this.helperService.jsonToQueryStringSinfiltro(
                                criteriosSearch
                            );
                        const apiUrl = `${environment.api.sfe}/facturas/listar-paquetes?${queryString}`;
                        this.httpClient.get<any>(apiUrl).subscribe({
                            next: (res) => {
                                if (res.content.length > 0) {
                                    this.sendPaquete(criteriosSearch).subscribe(
                                        (res2) => {}
                                    );
                                }
                            },
                            error: (err) => {},
                        });
                    }
                });
            }
    }

    // contigencia
    sendFacturaContigencia(facturaEmision: FacturaRecepcion): Observable<any> {
        const apiUrl = `${environment.api.sfe}/contingencias/recepciones`;
        return this.httpClient.post<any>(apiUrl, facturaEmision);
    }

    sendEventoContigencia(evento: any) {
        const apiUrl = `${environment.api.sfe}/contingencias/registrar-eventos`;
        return this.httpClient.post<any>(apiUrl, evento);
    }

    getPaquetesContigencia(criteriosSearch: any): Observable<any> {
        const queryString =
            this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.sfe}/contingencias/listar-paquetes?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    sendPaqueteContigencia(envio: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/contingencias/enviar-paquetes`;
        return this.httpClient.post<any>(apiUrl, envio);
    }

    async verificarContigencia(busqueda: any): Promise<any> {
        const apiUrl = `${environment.api.sfe}/contingencias/validar-contigencia`;
        return await this.httpClient.post<any>(apiUrl, busqueda).toPromise();
    }

    // operaciones
    sincronizePuntos(request: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/operaciones/puntos-ventas/listar`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    activarTipoEmision(request: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/operaciones/activar-tipo-emision`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    activarTipoEmisionGlobal(request: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/operaciones/activar-tipo-emision-global`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    sincronizarPunto(request: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/operaciones/puntos-ventas/registrar-sin`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    cerrarPunto(request: any): Observable<any> {
        const apiUrl = `${environment.api.sfe}/operaciones/puntos-ventas/cierre-sin`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    // parametricas
    sincronizeParametricas(request: any): Observable<any> {
        const queryString =
            this.helperService.jsonToQueryStringSinfiltro(request);
        const apiUrl = `${environment.api.sfe}/parametricas/sincronizar?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    sincronizeParametricasAsociacion(request: any): Observable<any> {
        const queryString =
            this.helperService.jsonToQueryStringSinfiltro(request);
        const apiUrl = `${environment.api.sfe}/parametricas/sincronizar-asociaciones?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    // paquetes
    sendMasivo(request: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryString(request);
        const apiUrl = `${environment.api.sfe}/facturas/enviar-masivos?${queryString}`;
        return this.httpClient.post<any>(apiUrl, request);
    }

    // errores
    getErrores(idFactura: number): Observable<any> {
        const apiUrl = `${environment.api.sfe}/facturas-errores/${idFactura}`;
        return this.httpClient.get<any>(apiUrl);
    }
}
